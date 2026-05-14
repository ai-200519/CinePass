import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InitierPaiementDto } from './dto/initier-paiement.dto';
import { Paiement } from './entities/paiement.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { MethodePaiement } from '../common/enums/methode-paiement.enum';
import { StatutPaiement } from '../common/enums/statut-paiement.enum';
import { StatutReservation } from '../common/enums/statut-reservation.enum';
import { StripeGateway } from './gateways/stripe.gateway';
import { ReservationService } from '../reservation/reservation.service';
type StripeCheckoutSession = {
  id?: string | null;
  metadata?: Record<string, string | null> | null;
};

@Injectable()
export class PaiementService {
  constructor(
    @InjectRepository(Paiement)
    private readonly paiementRepo: Repository<Paiement>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    private readonly stripeGateway: StripeGateway,
    private readonly reservationService: ReservationService,
    private readonly configService: ConfigService,
  ) {}

  async initierPaiement(dto: InitierPaiementDto, user: any) {
    if (dto.methode !== MethodePaiement.STRIPE) {
      throw new BadRequestException('Seul Stripe est disponible');
    }

    const reservation = await this.reservationRepo.findOne({
      where: { id_reservation: dto.id_reservation },
      relations: ['utilisateur', 'reservationSieges'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation introuvable');
    }

    if (reservation.utilisateur?.id_utilisateur !== user.id_utilisateur) {
      throw new ForbiddenException('Acces refuse');
    }

    if (reservation.statut !== StatutReservation.EN_COURS) {
      throw new BadRequestException(
        `Reservation deja ${reservation.statut.toLowerCase()}`,
      );
    }

    const montantTotal = (reservation.reservationSieges || []).reduce(
      (sum, rs) => sum + Number(rs.prixUnitaire || 0),
      0,
    );

    if (montantTotal <= 0) {
      throw new BadRequestException('Montant invalide');
    }

    const currency = (
      this.configService.get<string>('PAYMENT_CURRENCY') || 'MAD'
    ).toLowerCase();

    let paiement = await this.paiementRepo.findOne({
      where: { reservation: { id_reservation: reservation.id_reservation } },
      relations: ['reservation'],
    });

    if (paiement?.statut === StatutPaiement.ACCEPTE) {
      throw new BadRequestException('Reservation deja payee');
    }

    if (!paiement) {
      paiement = this.paiementRepo.create({
        reservation,
        montantTotal,
        devise: currency.toUpperCase(),
        methode: MethodePaiement.STRIPE,
        statut: StatutPaiement.EN_ATTENTE,
      });
    } else {
      paiement.montantTotal = montantTotal;
      paiement.devise = currency.toUpperCase();
      paiement.methode = MethodePaiement.STRIPE;
      paiement.statut = StatutPaiement.EN_ATTENTE;
    }

    const session = await this.stripeGateway.createCheckoutSession({
      amount: Math.round(montantTotal * 100),
      currency,
      reservationId: reservation.id_reservation,
      reference: reservation.reference,
    });

    paiement.referenceTransaction = session.id;
    const saved = await this.paiementRepo.save(paiement);

    return {
      id_paiement: saved.id_paiement,
      id_reservation: reservation.id_reservation,
      reference: reservation.reference,
      montantTotal: saved.montantTotal,
      devise: saved.devise,
      statut: saved.statut,
      checkoutUrl: session.url,
    };
  }

  async getStatus(id_reservation: number, user: any) {
    const reservation = await this.reservationRepo.findOne({
      where: { id_reservation },
      relations: ['utilisateur', 'paiement'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation introuvable');
    }

    if (reservation.utilisateur?.id_utilisateur !== user.id_utilisateur) {
      throw new ForbiddenException('Acces refuse');
    }

    return {
      id_reservation: reservation.id_reservation,
      reference: reservation.reference,
      statutReservation: reservation.statut,
      paiement: reservation.paiement
        ? {
            id_paiement: reservation.paiement.id_paiement,
            statut: reservation.paiement.statut,
            methode: reservation.paiement.methode,
            montantTotal: reservation.paiement.montantTotal,
            devise: reservation.paiement.devise,
          }
        : null,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string | string[]) {
    const event = this.stripeGateway.constructEvent(rawBody, signature);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(
          event.data.object as StripeCheckoutSession,
        );
        break;
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed':
        await this.handleCheckoutFailed(
          event.data.object as StripeCheckoutSession,
        );
        break;
      default:
        break;
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: StripeCheckoutSession) {
    const paiement = await this.findPaiementFromSession(session);
    if (!paiement || paiement.statut === StatutPaiement.ACCEPTE) return;

    await this.paiementRepo.manager.transaction(async (manager) => {
      paiement.statut = StatutPaiement.ACCEPTE;
      paiement.datePaiement = new Date();
      await manager.save(paiement);

      const reservation = await manager.findOne(Reservation, {
        where: { id_reservation: paiement.reservation?.id_reservation },
      });

      if (!reservation) return;
      reservation.statut = StatutReservation.PAYEE;
      await manager.save(reservation);

      await this.reservationService.genererQRCode(reservation.reference);
    });
  }

  private async handleCheckoutFailed(session: StripeCheckoutSession) {
    const paiement = await this.findPaiementFromSession(session);
    if (!paiement || paiement.statut === StatutPaiement.ACCEPTE) return;

    paiement.statut = StatutPaiement.REFUSE;
    paiement.datePaiement = new Date();
    await this.paiementRepo.save(paiement);
  }

  private async findPaiementFromSession(session: StripeCheckoutSession) {
    if (session.id) {
      const bySession = await this.paiementRepo.findOne({
        where: { referenceTransaction: session.id },
        relations: ['reservation'],
      });
      if (bySession) return bySession;
    }

    const reservationId = session.metadata?.reservationId;
    if (!reservationId) return null;

    return this.paiementRepo.findOne({
      where: { reservation: { id_reservation: Number(reservationId) } },
      relations: ['reservation'],
    });
  }
}
