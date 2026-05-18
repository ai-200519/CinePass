// src/paiement/paiement.service.ts
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MethodePaiement } from '../common/enums/methode-paiement.enum';
import { StatutPaiement } from '../common/enums/statut-paiement.enum';
import { StatutReservation } from '../common/enums/statut-reservation.enum';
import { Reservation } from '../reservation/entities/reservation.entity';
import { ReservationService } from '../reservation/reservation.service';
import { InitierPaiementDto } from './dto/initier-paiement.dto';
import { Paiement } from './entities/paiement.entity';
import { StripeGateway } from './gateways/stripe.gateway';

@Injectable()
export class PaiementService {
  private readonly logger = new Logger(PaiementService.name);

  constructor(
    @InjectRepository(Paiement)
    private readonly paiementRepo: Repository<Paiement>,

    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,

    private readonly stripeGateway: StripeGateway,
    private readonly reservationService: ReservationService,
  ) {}

  // ── POST /paiement/initier ────────────────────────────────────────────────
  async initier(dto: InitierPaiementDto, id_utilisateur: number): Promise<any> {
    // 1. Find reservation
    const reservation = await this.reservationRepo.findOne({
      where: { id_reservation: dto.id_reservation },
      relations: [
        'utilisateur',
        'seance',
        'seance.film',
        'seance.salle',
        'reservationSieges',
        'paiement',
      ],
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    // 2. Verify ownership
    if (reservation.utilisateur?.id_utilisateur !== id_utilisateur) {
      throw new ForbiddenException('Accès refusé');
    }

    // 3. Verify reservation is EN_COURS
    if (reservation.statut !== StatutReservation.EN_COURS) {
      throw new BadRequestException(
        reservation.statut === StatutReservation.PAYEE
          ? 'Cette réservation est déjà payée'
          : reservation.statut === StatutReservation.EXPIREE
            ? 'Cette réservation a expiré — veuillez en créer une nouvelle'
            : `Réservation en statut ${reservation.statut}`,
      );
    }

    // 4. Check if paiement already exists - if so reuse PaymentIntent
    if (reservation.paiement) {
      const existing = reservation.paiement;
      if (existing.statut === StatutPaiement.EN_ATTENTE) {
        const intent = await this.stripeGateway.getPaymentIntent(
          existing.referenceTransaction,
        );

        if (intent.client_secret) {
          return {
            id_paiement: existing.id_paiement,
            paymentIntentId: intent.id,
            clientSecret: intent.client_secret,
            montantTotal: Number(existing.montantTotal),
            devise: existing.devise,
            statut: existing.statut,
            message: 'PaymentIntent existant',
          };
        }
      }
    }

    // 5. Calculate total from ReservationSieges
    const montantTotal =
      reservation.reservationSieges?.reduce(
        (sum, rs) => sum + Number(rs.prixUnitaire),
        0,
      ) || 0;

    // 6. Create Paiement record EN_ATTENTE
    const paiement = this.paiementRepo.create({
      montantTotal,
      devise: 'MAD',
      methode: MethodePaiement.STRIPE,
      statut: StatutPaiement.EN_ATTENTE,
      reservation: { id_reservation: dto.id_reservation },
    });
    const savedPaiement = await this.paiementRepo.save(paiement);

    // 7. Create Stripe Checkout Session (hosted page)
    const filmTitle = reservation.seance?.film?.title || 'CinePass';

    const session = await this.stripeGateway.createCheckoutSession(
      montantTotal,
      'mad',
      reservation.reference,
      savedPaiement.id_paiement,
      filmTitle,
    );

    // 8. Save Stripe Checkout Session ID as referenceTransaction
    await this.paiementRepo.update(
      { id_paiement: savedPaiement.id_paiement },
      { referenceTransaction: session.sessionId },
    );

    this.logger.log(
      `💳 Checkout session created — Réservation ${reservation.reference} — ` +
        `Montant ${montantTotal} MAD`,
    );

    return {
      id_paiement: savedPaiement.id_paiement,
      sessionId: session.sessionId,
      url: session.url,
      montantTotal,
      devise: 'MAD',
      statut: StatutPaiement.EN_ATTENTE,
      message: 'Redirection vers la page de paiement Stripe',
    };
  }

  // ── POST /paiement/webhook — Stripe calls this ────────────────────────────
  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    let event: any;

    // ── Development mode — skip signature verification ──────────────────────
    if (process.env.NODE_ENV === 'development') {
      try {
        // Parse raw body directly without signature check
        event = JSON.parse(payload.toString());
      } catch (error) {
        throw new BadRequestException('Invalid webhook payload');
      }
    } else {
      // ── Production mode — verify signature ─────────────────────────────────
      try {
        event = this.stripeGateway.verifyWebhook(payload, signature);
      } catch (error) {
        this.logger.error(`❌ Webhook signature invalid : ${error.message}`);
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    this.logger.log(`📨 Stripe webhook received : ${event.type}`);

    switch (event.type) {
      // ── Payment succeeded ─────────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = session.metadata;

        if (!metadata?.id_paiement) break;

        const id_paiement = parseInt(metadata.id_paiement);
        const reference = metadata.reference;

        // Update Paiement → ACCEPTE
        const paiement = await this.paiementRepo.findOne({
          where: { id_paiement },
          relations: ['reservation'],
        });

        if (!paiement) break;

        await this.paiementRepo.update(
          { id_paiement },
          {
            statut: StatutPaiement.ACCEPTE,
            datePaiement: new Date(),
            referenceTransaction: session.payment_intent || session.id,
          },
        );

        // Confirm reservation → PAYEE + generate QR Code
        await this.reservationService.confirmerPaiement(
          paiement.reservation.id_reservation,
          session.payment_intent || session.id,
        );

        this.logger.log(`✅ Paiement confirmé — Référence ${reference}`);
        break;
      }

      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        const metadata = intent.metadata;

        if (!metadata?.id_paiement) break;

        const id_paiement = parseInt(metadata.id_paiement);
        const reference = metadata.reference;

        const paiement = await this.paiementRepo.findOne({
          where: { id_paiement },
          relations: ['reservation'],
        });

        if (!paiement) break;

        await this.paiementRepo.update(
          { id_paiement },
          {
            statut: StatutPaiement.ACCEPTE,
            datePaiement: new Date(),
            referenceTransaction: intent.id,
          },
        );

        await this.reservationService.confirmerPaiement(
          paiement.reservation.id_reservation,
          intent.id,
        );

        this.logger.log(`Paiement confirme - Reference ${reference}`);
        break;
      }

      // ── Payment failed ────────────────────────────────────────────────────
      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object;
        const metadata = session.metadata;

        if (!metadata?.id_paiement) break;

        const id_paiement = parseInt(metadata.id_paiement);

        await this.paiementRepo.update(
          { id_paiement },
          { statut: StatutPaiement.REFUSE },
        );

        this.logger.warn(`❌ Paiement refusé — event: ${event.type}`);
        break;
      }

      default:
        this.logger.debug(`Unhandled event : ${event.type}`);
    }
  }

  // ── GET /paiement/:id_reservation — get status ────────────────────────────
  async getStatus(
    id_reservation: number,
    id_utilisateur: number,
  ): Promise<any> {
    const paiement = await this.paiementRepo.findOne({
      where: { reservation: { id_reservation } },
      relations: ['reservation', 'reservation.utilisateur'],
    });

    if (!paiement) {
      throw new NotFoundException(
        'Aucun paiement trouvé pour cette réservation',
      );
    }

    // Verify ownership
    if (paiement.reservation?.utilisateur?.id_utilisateur !== id_utilisateur) {
      throw new ForbiddenException('Accès refusé');
    }

    return {
      id_paiement: paiement.id_paiement,
      statut: paiement.statut,
      montantTotal: paiement.montantTotal,
      devise: paiement.devise,
      methode: paiement.methode,
      referenceTransaction: paiement.referenceTransaction,
      datePaiement: paiement.datePaiement,
    };
  }
}
