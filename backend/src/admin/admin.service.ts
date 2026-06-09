// src/admin/admin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cinema } from '../cinema/entities/cinema.entity';
import { Film } from '../film/entities/film.entity';
import { Paiement } from '../paiement/entities/paiement.entity';
import { FilterReservationDto } from '../reservation/dto/filter-reservation.dto';
import { ReservationSiege } from '../reservation/entities/reservation-siege.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Seance } from '../seance/entities/seance.entity';
import { StatsFilterDto } from './dto/stats-filter.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,

    @InjectRepository(ReservationSiege)
    private readonly reservationSiegeRepo: Repository<ReservationSiege>,

    @InjectRepository(Paiement)
    private readonly paiementRepo: Repository<Paiement>,

    @InjectRepository(Film)
    private readonly filmRepo: Repository<Film>,

    @InjectRepository(Seance)
    private readonly seanceRepo: Repository<Seance>,

    @InjectRepository(Cinema)
    private readonly cinemaRepo: Repository<Cinema>,
  ) {}

  // ── Helper — date filter condition ────────────────────────────────────────
  private getDateCondition(
    alias: string,
    dateDebut?: string,
    dateFin?: string,
  ): { condition: string; params: object } {
    if (dateDebut && dateFin) {
      return {
        condition: `${alias} BETWEEN :dateDebut AND :dateFin`,
        params: {
          dateDebut: new Date(dateDebut),
          dateFin: new Date(dateFin + 'T23:59:59'),
        },
      };
    }
    return { condition: '1=1', params: {} };
  }
  // ── Helper — cinema filter ────────────────────────────────────────────────
  private applyCinemaFilter(query: any, id_cinema?: number) {
    if (id_cinema) {
      query.andWhere('sa.id_cinema = :id_cinema', { id_cinema });
    }
    return query;
  }

  // ── Helper — get cinema info ──────────────────────────────────────────────
  private async getCinemaInfo(id_cinema: number) {
    const cinema = await this.cinemaRepo.findOne({
      where: { id_cinema },
    });
    return cinema
      ? { id: cinema.id_cinema, nom: cinema.nom, ville: cinema.ville }
      : null;
  }

  // ── Helper — taux moyen ───────────────────────────────────────────────────
  private async getTauxMoyen(
    id_cinema?: number,
    dateDebut?: string,
    dateFin?: string,
  ): Promise<string> {
    const { condition, params } = this.getDateCondition(
      's.dateHeure',
      dateDebut,
      dateFin,
    );
    let query = this.seanceRepo
      .createQueryBuilder('s')
      .leftJoin('s.salle', 'sa')
      .leftJoin('s.reservations', 'r', 'r.statut IN (:...statuts)', {
        statuts: ['PAYEE', 'VALIDEE', 'UTILISEE'],
      })
      .select('sa.capaciteTotale', 'capacite')
      .addSelect('COUNT(r.id_reservation)', 'nbReservations')
      .where(condition, params)
      .groupBy('s.id_seance')
      .addGroupBy('sa.capaciteTotale');

    if (id_cinema) {
      query.andWhere('sa.id_cinema = :id_cinema', { id_cinema });
    }

    const data = await query.getRawMany();

    if (data.length === 0) return '0%';

    const moyen =
      data.reduce((sum, s) => {
        const taux =
          s.capacite > 0
            ? (parseInt(s.nbReservations) / parseInt(s.capacite)) * 100
            : 0;
        return sum + taux;
      }, 0) / data.length;

    return `${Math.round(moyen * 10) / 10}%`;
  }

  // ── GET /admin/stats — Global KPIs ────────────────────────────────────────
  async getGlobalStats(filter: StatsFilterDto) {
    const { condition, params } = this.getDateCondition(
      'r.dateReservation',
      filter.dateDebut,
      filter.dateFin,
    );

    // Total billets vendus
    let billetsQuery = this.reservationRepo
      .createQueryBuilder('r')
      .leftJoin('r.seance', 's')
      .leftJoin('s.salle', 'sa')
      .where(condition, params)
      .andWhere('r.statut IN (:...statuts)', {
        statuts: ['PAYEE', 'VALIDEE', 'UTILISEE'],
      });
    this.applyCinemaFilter(billetsQuery, filter.id_cinema);
    const totalBillets = await billetsQuery.getCount();

    // Chiffre d'affaires
    let caQuery = this.paiementRepo
      .createQueryBuilder('p')
      .leftJoin('p.reservation', 'r')
      .leftJoin('r.seance', 's')
      .leftJoin('s.salle', 'sa')
      .select('SUM(p.montantTotal)', 'total')
      .where('p.statut = :statut', { statut: 'ACCEPTE' })
      .andWhere(condition, params);
    this.applyCinemaFilter(caQuery, filter.id_cinema);
    const caResult = await caQuery.getRawOne();
    const chiffreAffaires = parseFloat(caResult?.total || '0');

    // Total réservations
    let totalQuery = this.reservationRepo
      .createQueryBuilder('r')
      .leftJoin('r.seance', 's')
      .leftJoin('s.salle', 'sa')
      .where(condition, params);
    this.applyCinemaFilter(totalQuery, filter.id_cinema);
    const totalReservations = await totalQuery.getCount();

    // Taux annulation
    let annulQuery = this.reservationRepo
      .createQueryBuilder('r')
      .leftJoin('r.seance', 's')
      .leftJoin('s.salle', 'sa')
      .where(condition, params)
      .andWhere('r.statut = :statut', { statut: 'ANNULEE' });
    this.applyCinemaFilter(annulQuery, filter.id_cinema);
    const totalAnnulations = await annulQuery.getCount();

    const tauxAnnulation =
      totalReservations > 0
        ? Math.round((totalAnnulations / totalReservations) * 100 * 10) / 10
        : 0;

    return {
      cinema: filter.id_cinema
        ? await this.getCinemaInfo(filter.id_cinema)
        : { id: null, nom: 'Tous les cinémas' },
      periode: {
        debut: filter.dateDebut || 'all time',
        fin: filter.dateFin || 'all time',
      },
      kpis: {
        totalBillets,
        totalReservations,
        chiffreAffaires: Math.round(chiffreAffaires * 100) / 100,
        devise: 'MAD',
        tauxRemplissageMoyen: await this.getTauxMoyen(
          filter.id_cinema,
          filter.dateDebut,
          filter.dateFin,
        ),
        tauxAnnulation: `${tauxAnnulation}%`,
      },
    };
  }

  // ── GET /admin/stats/films — Films populaires ─────────────────────────────
  async getFilmsStats(filter: StatsFilterDto) {
    const limit = filter.limit || 5;
    const { condition, params } = this.getDateCondition(
      'r.dateReservation',
      filter.dateDebut,
      filter.dateFin,
    );

    let query = await this.reservationRepo
      .createQueryBuilder('r')
      .leftJoin('r.seance', 's')
      .leftJoin('s.salle', 'sa')
      .leftJoin('s.film', 'f')
      .leftJoin('r.paiement', 'p')
      .select('f.id', 'id_film')
      .addSelect('f.title', 'title')
      .addSelect('f.genre', 'genre')
      .addSelect('f.poster', 'poster')
      .addSelect('f.note', 'note')
      .addSelect('COUNT(r.id_reservation)', 'nbReservations')
      .addSelect('SUM(p.montantTotal)', 'chiffreAffaires')
      .where(condition, params)
      .andWhere('r.statut IN (:...statuts)', {
        statuts: ['PAYEE', 'VALIDEE', 'UTILISEE'],
      });

    this.applyCinemaFilter(query, filter.id_cinema);

    const films = await query
      .groupBy('f.id')
      .addGroupBy('f.title')
      .addGroupBy('f.genre')
      .addGroupBy('f.poster')
      .addGroupBy('f.note')
      .orderBy('COUNT(r.id_reservation)', 'DESC')
      .limit(limit)
      .getRawMany();

    return {
      cinema: filter.id_cinema
        ? await this.getCinemaInfo(filter.id_cinema)
        : { id: null, nom: 'Tous les cinémas' },
      films: films.map((f, index) => ({
        rang: index + 1,
        id_film: f.id_film,
        title: f.title,
        genre: f.genre,
        poster: f.poster,
        nbReservations: parseInt(f.nbReservations),
        chiffreAffaires:
          Math.round(parseFloat(f.chiffreAffaires || '0') * 100) / 100,
        devise: 'MAD',
      })),
    };
  }

  // ── GET /admin/stats/seances — Taux de remplissage ────────────────────────
  async getSeancesStats(filter: StatsFilterDto) {
    const limit = filter.limit || 10;

    const { condition, params } = this.getDateCondition(
      's.dateHeure',
      filter.dateDebut,
      filter.dateFin,
    );

    let query = await this.seanceRepo
      .createQueryBuilder('s')
      .leftJoin('s.film', 'f')
      .leftJoin('s.salle', 'sa')
      .leftJoin('s.reservations', 'r', 'r.statut IN (:...statuts)', {
        statuts: ['PAYEE', 'VALIDEE', 'UTILISEE'],
      })
      .select('s.id_seance', 'id_seance')
      .addSelect('s.dateHeure', 'dateHeure')
      .addSelect('s.technologie', 'technologie')
      .addSelect('f.title', 'film')
      .addSelect('f.poster', 'poster')
      .addSelect('sa.nom', 'salle')
      .addSelect('sa.capaciteTotale', 'capacite')
      .addSelect('COUNT(r.id_reservation)', 'nbReservations');

    query.where(condition, params);
    this.applyCinemaFilter(query, filter.id_cinema);

    const seances = await query
      .groupBy('s.id_seance')
      .addGroupBy('s.dateHeure')
      .addGroupBy('s.technologie')
      .addGroupBy('f.title')
      .addGroupBy('f.poster')
      .addGroupBy('sa.nom')
      .addGroupBy('sa.capaciteTotale')
      .orderBy('s.dateHeure', 'DESC')
      .limit(limit)
      .getRawMany();

    return {
      seances: seances.map((s) => {
        const nbReservations = parseInt(s.nbReservations);
        const capacite = parseInt(s.capacite);
        const tauxRemplissage =
          capacite > 0
            ? Math.round((nbReservations / capacite) * 100 * 10) / 10
            : 0;

        return {
          id_seance: s.id_seance,
          cinema: s.cinema,
          dateHeure: s.dateHeure,
          technologie: s.technologie,
          film: s.film,
          poster: s.poster,
          salle: s.salle,
          capacite,
          nbReservations,
          placesRestantes: capacite - nbReservations,
          tauxRemplissage: `${tauxRemplissage}%`,
          statut:
            tauxRemplissage >= 90
              ? 'QUASI_COMPLET'
              : tauxRemplissage >= 50
                ? 'BIEN_REMPLI'
                : 'DISPONIBLE',
        };
      }),
    };
  }

  // ── GET /admin/stats/revenus — CA par période ─────────────────────────────
  async getRevenusStats(filter: StatsFilterDto) {
    const { condition, params } = this.getDateCondition(
      'r.dateReservation',
      filter.dateDebut,
      filter.dateFin,
    );

    // CA par jour
    const parJour = await this.paiementRepo
      .createQueryBuilder('p')
      .leftJoin('p.reservation', 'r')
      .select("DATE_TRUNC('day', r.dateReservation)", 'jour')
      .addSelect('SUM(p.montantTotal)', 'ca')
      .addSelect('COUNT(p.id_paiement)', 'nbPaiements')
      .where('p.statut = :statut', { statut: 'ACCEPTE' })
      .andWhere(condition, params)
      .groupBy("DATE_TRUNC('day', r.dateReservation)")
      .orderBy('jour', 'ASC')
      .getRawMany();

    // CA par méthode de paiement
    const parMethode = await this.paiementRepo
      .createQueryBuilder('p')
      .leftJoin('p.reservation', 'r')
      .select('p.methode', 'methode')
      .addSelect('SUM(p.montantTotal)', 'ca')
      .addSelect('COUNT(p.id_paiement)', 'count')
      .where('p.statut = :statut', { statut: 'ACCEPTE' })
      .andWhere(condition, params)
      .groupBy('p.methode')
      .getRawMany();

    // Totals
    const total = parJour.reduce((sum, d) => sum + parseFloat(d.ca || '0'), 0);

    return {
      periode: {
        debut: filter.dateDebut || 'all time',
        fin: filter.dateFin || 'all time',
      },
      totalCA: Math.round(total * 100) / 100,
      devise: 'MAD',
      parJour: parJour.map((d) => ({
        jour: d.jour,
        ca: Math.round(parseFloat(d.ca || '0') * 100) / 100,
        nbPaiements: parseInt(d.nbPaiements),
      })),
      parMethode: parMethode.map((m) => ({
        methode: m.methode,
        ca: Math.round(parseFloat(m.ca || '0') * 100) / 100,
        count: parseInt(m.count),
      })),
    };
  }

  // ── GET /admin/stats/reservations — Par statut ────────────────────────────
  async getReservationsStats(filter: StatsFilterDto) {
    const { condition, params } = this.getDateCondition(
      'r.dateReservation',
      filter.dateDebut,
      filter.dateFin,
    );

    const parStatut = await this.reservationRepo
      .createQueryBuilder('r')
      .select('r.statut', 'statut')
      .addSelect('COUNT(*)', 'count')
      .where(condition, params)
      .groupBy('r.statut')
      .getRawMany();

    const total = parStatut.reduce((sum, s) => sum + parseInt(s.count), 0);

    return {
      total,
      parStatut: parStatut.map((s) => ({
        statut: s.statut,
        count: parseInt(s.count),
        pourcentage:
          total > 0
            ? Math.round((parseInt(s.count) / total) * 100 * 10) / 10
            : 0,
      })),
    };
  }

  // ── GET /admin/stats/cinemas ──────────────────────────────────────────────
  async getCinemasStats(filter: StatsFilterDto) {
    const { condition, params } = this.getDateCondition(
      'r.dateReservation',
      filter.dateDebut,
      filter.dateFin,
    );

    const cinemas = await this.reservationRepo
      .createQueryBuilder('r')
      .leftJoin('r.seance', 's')
      .leftJoin('s.salle', 'sa')
      .leftJoin('sa.cinema', 'c')
      .leftJoin('r.paiement', 'p')
      .select('c.id_cinema', 'id_cinema')
      .addSelect('c.nom', 'nom')
      .addSelect('c.ville', 'ville')
      .addSelect('COUNT(r.id_reservation)', 'nbReservations')
      .addSelect('SUM(p.montantTotal)', 'chiffreAffaires')
      .where(condition, params)
      .andWhere('r.statut IN (:...statuts)', {
        statuts: ['PAYEE', 'VALIDEE', 'UTILISEE'],
      })
      .groupBy('c.id_cinema')
      .addGroupBy('c.nom')
      .addGroupBy('c.ville')
      .orderBy('chiffreAffaires', 'DESC')
      .getRawMany();

    return {
      periode: {
        debut: filter.dateDebut || 'all time',
        fin: filter.dateFin || 'all time',
      },
      cinemas: cinemas.map((c, i) => ({
        rang: i + 1,
        id_cinema: c.id_cinema,
        nom: c.nom,
        ville: c.ville,
        nbReservations: parseInt(c.nbReservations),
        chiffreAffaires:
          Math.round(parseFloat(c.chiffreAffaires || '0') * 100) / 100,
        devise: 'MAD',
      })),
    };
  }

  // ── All Reservations (Admin) ───────────────────────────────────────────────
  async getAllReservations(filter: FilterReservationDto) {
    const query = this.reservationRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.utilisateur', 'u')
      .leftJoinAndSelect('r.seance', 's')
      .leftJoinAndSelect('s.film', 'f')
      .leftJoinAndSelect('s.salle', 'sa')
      .leftJoinAndSelect('sa.cinema', 'c')
      .leftJoinAndSelect('r.paiement', 'p')
      .orderBy('r.dateReservation', 'DESC');

    if (filter.statut) {
      query.andWhere('r.statut = :statut', { statut: filter.statut });
    }

    if (filter.id_seance) {
      query.andWhere('s.id_seance = :id_seance', {
        id_seance: filter.id_seance,
      });
    }

    if (filter.id_cinema)
      query.andWhere('sa.id_cinema = :id', { id: filter.id_cinema });

    if (filter.reference) {
      query.andWhere('r.reference LIKE :ref', {
        ref: `%${filter.reference}%`,
      });
    }

    if (filter.dateDebut && filter.dateFin) {
      query.andWhere('r.dateReservation BETWEEN :debut AND :fin', {
        debut: new Date(filter.dateDebut),
        fin: new Date(filter.dateFin),
      });
    }

    const reservations = await query.getMany();

    return {
      total: reservations.length,
      reservations: reservations.map((r) => ({
        id: r.id_reservation,
        reference: r.reference,
        statut: r.statut,
        dateReservation: r.dateReservation,
        montant: r.paiement?.montantTotal || 0,
        client: {
          nom: r.utilisateur?.nom,
          prenom: r.utilisateur?.prenom,
          email: r.utilisateur?.email,
        },
        film: r.seance?.film?.title,
        cinema: r.seance?.salle?.cinema?.nom,
        dateSeance: r.seance?.dateHeure,
      })),
    };
  }

  // ── Get Reservation by ID (Admin) ─────────────────────────────────────────
  async getReservationById(id: number) {
    const reservation = await this.reservationRepo.findOne({
      where: { id_reservation: id },
      relations: [
        'utilisateur',
        'seance',
        'seance.film',
        'seance.salle',
        'seance.salle.cinema',
        'paiement',
        'reservationSieges', // ← ReservationSiege
        'reservationSieges.siege', // ← and Siege inside it
      ],
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    const film = reservation.seance?.film;

    return {
      id: reservation.id_reservation,
      reference: reservation.reference,
      statut: reservation.statut,
      dateReservation: reservation.dateReservation,
      montant: reservation.paiement?.montantTotal || 0,
      devise: reservation.paiement?.devise || 'MAD',
      methodePaiement: reservation.paiement?.methode,

      client: {
        id: reservation.utilisateur?.id_utilisateur,
        nom: reservation.utilisateur?.nom,
        prenom: reservation.utilisateur?.prenom,
        email: reservation.utilisateur?.email,
        telephone: reservation.utilisateur?.telephone,
      },

      film: film
        ? {
            id: film.id,
            title: film.title,
            genre: film.genre,
            duration: film.duration,
            poster: film.poster,
            note: film.note,
            director: film.director,
            isShowing: film.isShowing,
          }
        : null,

      seance: {
        id: reservation.seance?.id_seance,
        dateHeure: reservation.seance?.dateHeure,
        technologie: reservation.seance?.technologie,
        film: reservation.seance?.film?.title,
        poster: reservation.seance?.film?.poster,
        note: reservation.seance?.film?.note,
        salle: reservation.seance?.salle?.nom,
        cinema: reservation.seance?.salle?.cinema?.nom,
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

  // ── Export CSV ────────────────────────────────────────────────────────────
  async exportCsv(filter: FilterReservationDto): Promise<string> {
    const data = await this.getAllReservations(filter);

    const headers = [
      'ID',
      'Référence',
      'Statut',
      'Date Réservation',
      'Montant (MAD)',
      'Client',
      'Email',
      'Film',
      'Cinéma',
      'Date Séance',
    ].join(',');

    const rows = data.reservations.map((r) =>
      [
        r.id,
        r.reference,
        r.statut,
        new Date(r.dateReservation).toLocaleDateString('fr-FR'),
        r.montant,
        `${r.client.prenom} ${r.client.nom}`,
        r.client.email,
        r.film,
        r.cinema,
        new Date(r.dateSeance).toLocaleDateString('fr-FR'),
      ].join(','),
    );

    return [headers, ...rows].join('\n');
  }
}
