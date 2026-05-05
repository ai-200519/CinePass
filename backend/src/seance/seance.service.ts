// src/seance/seance.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository }              from '@nestjs/typeorm';
import { Repository }                    from 'typeorm';
import { StatutReservation } from '../common/enums/statut-reservation.enum';
import { Film }              from '../film/entities/film.entity';
import { Salle }             from '../salle/entities/salle.entity';
import { Siege }             from '../siege/entities/siege.entity';
import { ReservationSiege }  from '../reservation/entities/reservation-siege.entity';
import { Tarif }             from '../tarif/entities/tarif.entity';
import { CreateSeanceDto }   from './dto/create-seance.dto';
import { UpdateSeanceDto }   from './dto/update-seance.dto';
import { Seance }            from './entities/seance.entity';

const EXCLUDED_RESERVATION_STATUSES: StatutReservation[] = [
  StatutReservation.ANNULEE,
  StatutReservation.EXPIREE,
];

@Injectable()
export class SeanceService {

  constructor(
    @InjectRepository(Seance)
    private readonly seanceRepository: Repository<Seance>,

    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,

    @InjectRepository(Salle)
    private readonly salleRepository: Repository<Salle>,

    // ── NEW — needed for getSiegesDisponibles ─────────────────────────────
    @InjectRepository(Siege)
    private readonly siegeRepository: Repository<Siege>,

    @InjectRepository(ReservationSiege)
    private readonly reservationSiegeRepository: Repository<ReservationSiege>,

    // ── NEW — needed for getTarifs ────────────────────────────────────────
    @InjectRepository(Tarif)
    private readonly tarifRepository: Repository<Tarif>,
  ) {}

  // ── create() — unchanged ──────────────────────────────────────────────────
  async create(createSeanceDto: CreateSeanceDto) {
    const film = await this.filmRepository.findOne({
      where: { id: createSeanceDto.film?.id }
    });
    if (!film) throw new NotFoundException(
      `Film with ID ${createSeanceDto.film?.id} not found`
    );

    const salle = await this.salleRepository.findOne({
      where: { id_salle: createSeanceDto.salle?.id_salle }
    });
    if (!salle) throw new NotFoundException(
      `Salle with ID ${createSeanceDto.salle?.id_salle} not found`
    );

    const seance = this.seanceRepository.create({
      dateHeure:   new Date(createSeanceDto.dateHeure),
      technologie: createSeanceDto.technologie,
      statut:      createSeanceDto.statut,
      film,
      salle,
    });

    const saved = await this.seanceRepository.save(seance);
    return this.findOne(saved.id_seance);
  }

  // ── mapAvailability() — extended with cinema + poster + estComplet ────────
  private mapAvailability(
    seance: Seance & { reservationsCount?: number }
  ) {
    const totalSeats    = seance.salle?.capaciteTotale ?? null;
    const reservedSeats = seance.reservationsCount ?? 0;
    const remainingSeats = typeof totalSeats === 'number'
      ? Math.max(0, totalSeats - reservedSeats)
      : null;

    // ── cinema comes from salle relation ─────────────────────────────────
    const cinema = (seance.salle as any)?.cinema;

    return {
      id_seance:    seance.id_seance,
      dateHeure:    seance.dateHeure,
      technologie:  seance.technologie,
      statut:       seance.statut,

      film: seance.film ? {
        id:       seance.film.id,
        title:    seance.film.title,
        poster:   seance.film.poster,     // ← NEW
        genre:    seance.film.genre,      // ← NEW
        duration: seance.film.duration,   // ← NEW
        note:     seance.film.note,       // ← NEW
      } : null,

      salle: seance.salle ? {
        id_salle:       seance.salle.id_salle,
        numero:         seance.salle.numero,
        nom:            seance.salle.nom,
        capaciteTotale: seance.salle.capaciteTotale ?? null,
      } : null,

      // ← NEW — cinema info
      cinema: cinema ? {
        id_cinema: cinema.id_cinema,
        nom:       cinema.nom,
        ville:     cinema.ville,
      } : null,

      totalSeats,
      reservedSeats,
      remainingSeats,
      estComplet: remainingSeats !== null && remainingSeats <= 0, // ← NEW
    };
  }

  // ── findAll() — extended with optional id_film filter ────────────────────
  async findAll(id_film?: number) {    // ← ADDED optional param

    const qb = this.seanceRepository
      .createQueryBuilder('seance')
      .leftJoinAndSelect('seance.film',         'film')
      .leftJoinAndSelect('seance.salle',        'salle')
      .leftJoinAndSelect('salle.cinema',        'cinema') // ← NEW join
      .loadRelationCountAndMap(
        'seance.reservationsCount',
        'seance.reservations',
        'reservation',
        (qb) => qb.andWhere(
          'reservation.statut NOT IN (:...excluded)',
          { excluded: EXCLUDED_RESERVATION_STATUSES }
        ),
      );

    // ← NEW — filter by film if provided
    if (id_film) {
      qb.andWhere('film.id = :id_film', { id_film });
    }

    const seances = await qb.getMany();
    return seances.map(s => this.mapAvailability(s as any));
  }

  // ── findOne() — extended with cinema join ─────────────────────────────────
  async findOne(id: number) {

    const seance = await this.seanceRepository
      .createQueryBuilder('seance')
      .leftJoinAndSelect('seance.film',         'film')
      .leftJoinAndSelect('seance.salle',        'salle')
      .leftJoinAndSelect('salle.cinema',        'cinema')  // ← NEW join
      .where('seance.id_seance = :id', { id })
      .loadRelationCountAndMap(
        'seance.reservationsCount',
        'seance.reservations',
        'reservation',
        (qb) => qb.andWhere(
          'reservation.statut NOT IN (:...excluded)',
          { excluded: EXCLUDED_RESERVATION_STATUSES }
        ),
      )
      .getOne();

    if (!seance) throw new NotFoundException(`Seance with ID ${id} not found`);
    return this.mapAvailability(seance as any);
  }

  // ── update() — unchanged ──────────────────────────────────────────────────
  async update(id: number, updateSeanceDto: UpdateSeanceDto) {

    const seance = await this.seanceRepository.findOne({
      where:     { id_seance: id },
      relations: ['film', 'salle'],
    });
    if (!seance) throw new NotFoundException(`Seance with ID ${id} not found`);

    if (updateSeanceDto.dateHeure)   seance.dateHeure   = new Date(updateSeanceDto.dateHeure);
    if (updateSeanceDto.technologie) seance.technologie = updateSeanceDto.technologie;
    if (updateSeanceDto.statut)      seance.statut      = updateSeanceDto.statut;

    if (updateSeanceDto.film?.id) {
      const film = await this.filmRepository.findOne({
        where: { id: updateSeanceDto.film.id }
      });
      if (!film) throw new NotFoundException(
        `Film with ID ${updateSeanceDto.film.id} not found`
      );
      seance.film = film;
    }

    if (updateSeanceDto.salle?.id_salle) {
      const salle = await this.salleRepository.findOne({
        where: { id_salle: updateSeanceDto.salle.id_salle }
      });
      if (!salle) throw new NotFoundException(
        `Salle with ID ${updateSeanceDto.salle.id_salle} not found`
      );
      seance.salle = salle;
    }

    await this.seanceRepository.save(seance);
    return this.findOne(id);
  }

  // ── remove() — unchanged ──────────────────────────────────────────────────
  async remove(id: number) {
    const seance = await this.seanceRepository.findOne({
      where: { id_seance: id }
    });
    if (!seance) throw new NotFoundException(`Seance with ID ${id} not found`);
    await this.seanceRepository.delete(id);
    return { message: 'Seance deleted successfully' };
  }

  // ── getSiegesDisponibles() — NEW ──────────────────────────────────────────
  async getSiegesDisponibles(id_seance: number): Promise<any> {

    // 1. Verify séance exists
    const seance = await this.seanceRepository.findOne({
      where:     { id_seance },
      relations: ['salle'],
    });
    if (!seance) throw new NotFoundException('Séance introuvable');

    // 2. Get ALL seats of the salle
    const tousLesSieges = await this.siegeRepository.find({
      where: { salle: { id_salle: seance.salle.id_salle } },
      order: { rangee: 'ASC', numero: 'ASC' },
    });

    // 3. Get seats already reserved for THIS séance
    const siegesOccupes = await this.reservationSiegeRepository
      .createQueryBuilder('rs')
      .leftJoin('rs.reservation', 'r')
      .leftJoin('rs.siege',       'si')
      .select('si.id_siege',      'id_siege')
      .where('r.seance = :id_seance', { id_seance })
      .andWhere('r.statut NOT IN (:...excluded)', {
        excluded: EXCLUDED_RESERVATION_STATUSES,
      })
      .getRawMany();

    const occupesSet = new Set(siegesOccupes.map(s => s.id_siege));

    const capacite        = seance.salle.capaciteTotale || 0;
    const nbOccupes       = occupesSet.size;
    const placesRestantes = capacite - nbOccupes;

    return {
      id_seance,
      salle:           seance.salle.nom,
      capaciteTotale:  capacite,
      placesRestantes: Math.max(0, placesRestantes),
      estComplet:      placesRestantes <= 0,
      sieges:          tousLesSieges.map(siege => ({
        id_siege:  siege.id_siege,
        rangee:    siege.rangee,
        numero:    siege.numero,
        categorie: siege.categorie,
        statut:    siege.statut === 'BLOQUE'
                     ? 'BLOQUE'
                     : occupesSet.has(siege.id_siege)
                       ? 'OCCUPE'
                       : 'DISPONIBLE',
      })),
    };
  }

  // ── getTarifs() — NEW ─────────────────────────────────────────────────────
  async getTarifs(id_seance: number): Promise<any[]> {

    const seance = await this.seanceRepository.findOne({
      where: { id_seance },
    });
    if (!seance) throw new NotFoundException('Séance introuvable');

    return this.tarifRepository.find({
      where: { seance: { id_seance } },
      order: { typePublic: 'ASC' },
    });
  }
}