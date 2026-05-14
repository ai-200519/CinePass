import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { StatutReservation } from '../common/enums/statut-reservation.enum';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Seance } from '../seance/entities/seance.entity';
import { ValidateTicketDto } from './dto/validate-ticket.dto';

type StaffUser = {
  id_utilisateur: number;
  role: Role;
  id_cinema: number | null;
};

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Seance)
    private readonly seanceRepository: Repository<Seance>,

    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async findTodaySeances(user: StaffUser) {
    this.assertStaffCinema(user);

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const seances = await this.seanceRepository
      .createQueryBuilder('seance')
      .leftJoinAndSelect('seance.film', 'film')
      .leftJoinAndSelect('seance.salle', 'salle')
      .leftJoinAndSelect('salle.cinema', 'cinema')
      .where('cinema.id_cinema = :id_cinema', { id_cinema: user.id_cinema })
      .andWhere('seance.dateHeure >= :start', { start })
      .andWhere('seance.dateHeure < :end', { end })
      .orderBy('seance.dateHeure', 'ASC')
      .getMany();

    const sessions = await Promise.all(
      seances.map(async (seance) => {
        const counts = await this.getReservationCounts(seance.id_seance);
        return {
          id_seance: seance.id_seance,
          dateHeure: seance.dateHeure,
          technologie: seance.technologie,
          statut: seance.statut,
          film: seance.film
            ? {
                id: seance.film.id,
                title: seance.film.title,
                poster: seance.film.poster,
              }
            : null,
          salle: seance.salle
            ? {
                id_salle: seance.salle.id_salle,
                numero: seance.salle.numero,
                nom: seance.salle.nom,
                capaciteTotale: seance.salle.capaciteTotale ?? 0,
              }
            : null,
          cinema: seance.salle?.cinema
            ? {
                id_cinema: seance.salle.cinema.id_cinema,
                nom: seance.salle.cinema.nom,
                ville: seance.salle.cinema.ville,
              }
            : null,
          totalSeats: seance.salle?.capaciteTotale ?? 0,
          reservedSeats: counts.reservedSeats,
          validatedEntries: counts.validatedEntries,
          remainingSeats: Math.max(
            0,
            (seance.salle?.capaciteTotale ?? 0) - counts.reservedSeats,
          ),
        };
      }),
    );

    return {
      date: start.toISOString().slice(0, 10),
      total: sessions.length,
      sessions,
    };
  }

  async validateTicket(user: StaffUser, dto: ValidateTicketDto) {
    this.assertStaffCinema(user);

    const reference = this.extractReference(dto.reference ?? dto.qrCode);
    if (!reference) {
      throw new BadRequestException('Reference ou QR code requis');
    }

    const reservationQuery = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.seance', 'seance')
      .leftJoinAndSelect('seance.film', 'film')
      .leftJoinAndSelect('seance.salle', 'salle')
      .leftJoinAndSelect('salle.cinema', 'cinema')
      .leftJoinAndSelect('reservation.reservationSieges', 'reservationSieges')
      .leftJoinAndSelect('reservationSieges.siege', 'siege')
      .leftJoinAndSelect('reservation.utilisateur', 'utilisateur')
      .where('reservation.reference = :reference', { reference });

    if (dto.qrCode?.trim()) {
      reservationQuery.orWhere('reservation.qrCode = :qrCode', {
        qrCode: dto.qrCode.trim(),
      });
    }

    const reservation = await reservationQuery.getOne();

    if (!reservation) {
      return this.invalid(reference, 'Reservation introuvable');
    }

    if (reservation.seance?.salle?.cinema?.id_cinema !== user.id_cinema) {
      return this.invalid(reference, 'Reservation hors de votre cinema');
    }

    if (dto.id_seance && reservation.seance?.id_seance !== dto.id_seance) {
      return this.invalid(reference, 'Reservation pour une autre seance');
    }

    if (reservation.statut === StatutReservation.UTILISEE) {
      return this.invalid(reference, 'Ce billet a deja ete utilise', reservation);
    }

    if (
      reservation.statut !== StatutReservation.PAYEE &&
      reservation.statut !== StatutReservation.VALIDEE
    ) {
      return this.invalid(
        reference,
        `Reservation non validee (${reservation.statut})`,
        reservation,
      );
    }

    reservation.statut = StatutReservation.UTILISEE;
    await this.reservationRepository.save(reservation);

    return {
      valid: true,
      message: 'Entree validee',
      reservation: this.mapReservation(reservation),
    };
  }

  private async getReservationCounts(id_seance: number) {
    const reservedRaw = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.reservationSieges', 'rs')
      .select('COUNT(rs.id_reservation_siege)', 'count')
      .where('reservation.seance = :id_seance', { id_seance })
      .andWhere('reservation.statut IN (:...statuses)', {
        statuses: [
          StatutReservation.PAYEE,
          StatutReservation.VALIDEE,
          StatutReservation.UTILISEE,
        ],
      })
      .getRawOne<{ count: string }>();

    const validatedRaw = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.reservationSieges', 'rs')
      .select('COUNT(rs.id_reservation_siege)', 'count')
      .where('reservation.seance = :id_seance', { id_seance })
      .andWhere('reservation.statut = :status', {
        status: StatutReservation.UTILISEE,
      })
      .getRawOne<{ count: string }>();

    return {
      reservedSeats: Number(reservedRaw?.count ?? 0),
      validatedEntries: Number(validatedRaw?.count ?? 0),
    };
  }

  private extractReference(input?: string | null) {
    const value = input?.trim();
    if (!value) return null;

    try {
      const parsed = JSON.parse(value);
      const candidate =
        parsed.reference ??
        parsed.ref ??
        parsed.reservationReference ??
        parsed.code;
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim().toUpperCase();
      }
    } catch {
      // Not JSON, keep parsing as plain text or URL.
    }

    try {
      const url = new URL(value);
      const candidate =
        url.searchParams.get('reference') ??
        url.searchParams.get('ref') ??
        url.searchParams.get('code');
      if (candidate?.trim()) return candidate.trim().toUpperCase();
    } catch {
      // Not a URL.
    }

    return value.toUpperCase();
  }

  private invalid(reference: string, reason: string, reservation?: Reservation) {
    return {
      valid: false,
      reason,
      reference,
      reservation: reservation ? this.mapReservation(reservation) : null,
    };
  }

  private mapReservation(reservation: Reservation) {
    return {
      id_reservation: reservation.id_reservation,
      reference: reservation.reference,
      statut: reservation.statut,
      film: reservation.seance?.film
        ? {
            id: reservation.seance.film.id,
            title: reservation.seance.film.title,
            poster: reservation.seance.film.poster,
          }
        : null,
      seance: reservation.seance
        ? {
            id_seance: reservation.seance.id_seance,
            dateHeure: reservation.seance.dateHeure,
            technologie: reservation.seance.technologie,
            salle: reservation.seance.salle?.nom,
          }
        : null,
      client: reservation.utilisateur
        ? {
            nom: reservation.utilisateur.nom,
            prenom: reservation.utilisateur.prenom,
            email: reservation.utilisateur.email,
          }
        : null,
      sieges:
        reservation.reservationSieges?.map((rs) => ({
          id_siege: rs.siege?.id_siege,
          rangee: rs.siege?.rangee,
          numero: rs.siege?.numero,
          categorie: rs.categorie,
          prix: Number(rs.prixUnitaire),
        })) ?? [],
    };
  }

  private assertStaffCinema(user: StaffUser) {
    if (user.role !== Role.STAFF) {
      throw new ForbiddenException('Role STAFF requis');
    }

    if (!user.id_cinema) {
      throw new ForbiddenException('Aucun cinema assigne a ce staff');
    }
  }
}
