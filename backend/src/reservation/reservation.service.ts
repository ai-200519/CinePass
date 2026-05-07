// src/reservation/reservation.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationSiege } from './entities/reservation-siege.entity';
import { Seance } from '../seance/entities/seance.entity';
import { Siege } from '../siege/entities/siege.entity';
import { Tarif } from '../tarif/entities/tarif.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { StatutReservation } from '../common/enums/statut-reservation.enum';
import { StatutSeance } from '../common/enums/statut-seance.enum';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,

    @InjectRepository(ReservationSiege)
    private readonly reservationSiegeRepo: Repository<ReservationSiege>,

    @InjectRepository(Seance)
    private readonly seanceRepo: Repository<Seance>,

    @InjectRepository(Siege)
    private readonly siegeRepo: Repository<Siege>,

    @InjectRepository(Tarif)
    private readonly tarifRepo: Repository<Tarif>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ── Helper — generate reference ───────────────────────────────────────────
  private generateReference(): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CP-${year}-${random}`;
  }

  // ── POST /reservation — Create ────────────────────────────────────────────
  async create(
    dto: CreateReservationDto,
    id_utilisateur: number,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verify séance exists and is PROGRAMMEE
      const seance = await queryRunner.manager.findOne(Seance, {
        where: { id_seance: dto.id_seance },
        relations: ['salle'],
      });

      if (!seance) {
        throw new NotFoundException('Séance introuvable');
      }

      if (seance.statut !== StatutSeance.PROGRAMMEE) {
        throw new BadRequestException("Cette séance n'est plus disponible");
      }

      // 2. For each siege — verify and get tarif
      const siegeDetails: {
        siege: Siege;
        tarif: Tarif;
        typePublic: string;
      }[] = [];

      for (const item of dto.sieges) {
        // 2a. Verify siege exists and belongs to this séance's salle
        const siege = await queryRunner.manager.findOne(Siege, {
          where: { id_siege: item.id_siege },
          relations: ['salle'],
        });

        if (!siege) {
          throw new BadRequestException(`Siège ${item.id_siege} introuvable`);
        }

        if (siege.salle?.id_salle !== seance.salle.id_salle) {
          throw new BadRequestException(
            `Siège ${item.id_siege} n'appartient pas à cette salle`,
          );
        }

        if (siege.statut === 'BLOQUE') {
          throw new BadRequestException(
            `Siège ${siege.rangee}${siege.numero} est bloqué`,
          );
        }

        // 2b. Check availability for THIS séance inside transaction
        const alreadyReserved = await queryRunner.manager
          .createQueryBuilder(ReservationSiege, 'rs')
          .leftJoin('rs.reservation', 'r')
          .where('rs.siege = :id_siege', { id_siege: item.id_siege })
          .andWhere('r.seance = :id_seance', { id_seance: dto.id_seance })
          .andWhere('r.statut IN (:...statuts)', {
            statuts: ['EN_COURS', 'PAYEE', 'VALIDEE'],
          })
          .getCount();

        if (alreadyReserved > 0) {
          throw new BadRequestException(
            `Siège ${siege.rangee}${siege.numero} est déjà réservé`,
          );
        }

        // 2c. Find tarif for typePublic
        let tarif = await queryRunner.manager.findOne(Tarif, {
          where: {
            seance: { id_seance: dto.id_seance },
            typePublic: item.typePublic as any,
          },
        });

        if (!tarif) {
          const defaultPrices: Record<string, number> = {
            NORMAL: 50,
            ETUDIANT: 40,
            ENFANT: 35,
            SENIOR: 35,
            GROUPE: 45,
          };
          tarif = queryRunner.manager.create(Tarif, {
            seance: { id_seance: dto.id_seance },
            typePublic: item.typePublic as any,
            prix: defaultPrices[item.typePublic] ?? 50,
          });
          await queryRunner.manager.save(tarif);
          throw new BadRequestException(
            `Aucun tarif ${item.typePublic} disponible pour cette séance`,
          );
        }

        siegeDetails.push({ siege, tarif, typePublic: item.typePublic });
      }

      // 3. Calculate total
      const montantTotal = siegeDetails.reduce(
        (sum, s) => sum + Number(s.tarif.prix),
        0,
      );

      // 4. Generate unique reference
      let reference: string;
      let exists = true;
      while (exists) {
        reference = this.generateReference();
        const check = await queryRunner.manager.findOne(Reservation, {
          where: { reference },
        });
        exists = !!check;
      }

      // 5. Create Reservation
      const reservation = queryRunner.manager.create(Reservation, {
        reference,
        statut: StatutReservation.EN_COURS,
        utilisateur: { id_utilisateur },
        seance: { id_seance: dto.id_seance },
      });
      const savedReservation = await queryRunner.manager.save(reservation);

      // 6. Create ReservationSiege for each seat
      for (const item of siegeDetails) {
        const rs = queryRunner.manager.create(ReservationSiege, {
          reservation: { id_reservation: savedReservation.id_reservation },
          siege: { id_siege: item.siege.id_siege },
          categorie: item.siege.categorie,
          prixUnitaire: Number(item.tarif.prix),
        });
        await queryRunner.manager.save(rs);
      }

      // 7. Commit transaction
      await queryRunner.commitTransaction();

      // 8. Return response
      return {
        id_reservation: savedReservation.id_reservation,
        reference: savedReservation.reference,
        statut: savedReservation.statut,
        montantTotal: Math.round(montantTotal * 100) / 100,
        devise: 'MAD',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
        seance: {
          id: seance.id_seance,
          dateHeure: seance.dateHeure,
          technologie: seance.technologie,
          salle: seance.salle?.nom,
        },
        sieges: siegeDetails.map((s) => ({
          id_siege: s.siege.id_siege,
          rangee: s.siege.rangee,
          numero: s.siege.numero,
          categorie: s.siege.categorie,
          prix: Number(s.tarif.prix),
          typePublic: s.typePublic,
        })),
        message: 'Réservation créée. Vous avez 10 minutes pour payer.',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ── DELETE /reservation/:id — Cancel EN_COURS only ───────────────────────
  async cancel(id: number, id_utilisateur: number): Promise<any> {
    const reservation = await this.reservationRepo.findOne({
      where: { id_reservation: id },
      relations: [
        'utilisateur',
        'reservationSieges',
        'reservationSieges.siege',
      ],
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    // Verify ownership
    if (reservation.utilisateur?.id_utilisateur !== id_utilisateur) {
      throw new ForbiddenException(
        "Vous ne pouvez pas annuler la réservation d'un autre client",
      );
    }

    // Only EN_COURS can be cancelled
    if (reservation.statut !== StatutReservation.EN_COURS) {
      throw new BadRequestException(
        reservation.statut === StatutReservation.PAYEE
          ? 'Annulation impossible après paiement'
          : `Réservation déjà ${reservation.statut.toLowerCase()}`,
      );
    }

    // Update status to ANNULEE
    await this.reservationRepo.update(
      { id_reservation: id },
      { statut: StatutReservation.ANNULEE },
    );

    return {
      message: 'Réservation annulée avec succès',
      reference: reservation.reference,
      statut: StatutReservation.ANNULEE,
    };
  }

  // ── GET /reservation/mes-reservations — Client history ───────────────────
  async findByUser(id_utilisateur: number): Promise<any> {
    const reservations = await this.reservationRepo.find({
      where: { utilisateur: { id_utilisateur } },
      relations: [
        'seance',
        'seance.film',
        'seance.salle',
        'paiement',
        'reservationSieges',
      ],
      order: { dateReservation: 'DESC' },
    });

    return {
      total: reservations.length,
      reservations: reservations.map((r) => ({
        id_reservation: r.id_reservation,
        reference: r.reference,
        statut: r.statut,
        dateReservation: r.dateReservation,
        montant: r.paiement?.montantTotal || 0,
        film: r.seance?.film?.title,
        poster: r.seance?.film?.poster,
        dateSeance: r.seance?.dateHeure,
        technologie: r.seance?.technologie,
        salle: r.seance?.salle?.nom,
        nbSieges: r.reservationSieges?.length || 0,
      })),
    };
  }

  // ── GET /reservation/:id — Single detail ──────────────────────────────────
  async findOne(id: number, id_utilisateur: number): Promise<any> {
    const reservation = await this.reservationRepo.findOne({
      where: { id_reservation: id },
      relations: [
        'utilisateur',
        'seance',
        'seance.film',
        'seance.salle',
        'paiement',
        'reservationSieges',
        'reservationSieges.siege',
      ],
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    // Client can only see their own reservations
    if (reservation.utilisateur?.id_utilisateur !== id_utilisateur) {
      throw new ForbiddenException('Accès refusé');
    }

    return {
      id_reservation: reservation.id_reservation,
      reference: reservation.reference,
      statut: reservation.statut,
      dateReservation: reservation.dateReservation,
      qrCode: reservation.qrCode,
      montant: reservation.paiement?.montantTotal || 0,
      devise: reservation.paiement?.devise || 'MAD',
      film: reservation.seance?.film
        ? {
            title: reservation.seance.film.title,
            poster: reservation.seance.film.poster,
            genre: reservation.seance.film.genre,
            duration: reservation.seance.film.duration,
          }
        : null,
      seance: {
        dateHeure: reservation.seance?.dateHeure,
        technologie: reservation.seance?.technologie,
        salle: reservation.seance?.salle?.nom,
      },
      sieges:
        reservation.reservationSieges?.map((rs) => ({
          rangee: rs.siege?.rangee,
          numero: rs.siege?.numero,
          categorie: rs.categorie,
          prix: rs.prixUnitaire,
        })) || [],
      nbSieges: reservation.reservationSieges?.length || 0,
    };
  }
  
  // ── Expire old reservations — called by scheduler ─────────────────────────
  async expireOldReservations(): Promise<void> {
    // Find all EN_COURS reservations older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const expiredReservations = await this.reservationRepo
      .createQueryBuilder('r')
      .where('r.statut = :statut', { statut: StatutReservation.EN_COURS })
      .andWhere('r.dateReservation < :limit', { limit: tenMinutesAgo })
      .getMany();

    if (expiredReservations.length === 0) return;

    // Update all expired reservations to EXPIREE
    const ids = expiredReservations.map((r) => r.id_reservation);

    await this.reservationRepo
      .createQueryBuilder()
      .update(Reservation)
      .set({ statut: StatutReservation.EXPIREE })
      .whereInIds(ids)
      .execute();

    console.log(
      `⏰ [Scheduler] ${expiredReservations.length} réservation(s) expirée(s) : ` +
        expiredReservations.map((r) => r.reference).join(', '),
    );
  }
}
