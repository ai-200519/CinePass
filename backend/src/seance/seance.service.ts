import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatutReservation } from '../common/enums/statut-reservation.enum';
import { Film } from '../film/entities/film.entity';
import { Salle } from '../salle/entities/salle.entity';
import { CreateSeanceDto } from './dto/create-seance.dto';
import { UpdateSeanceDto } from './dto/update-seance.dto';
import { Seance } from './entities/seance.entity';

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
  ) {}

  async create(createSeanceDto: CreateSeanceDto) {
    const film = await this.filmRepository.findOne({ where: { id: createSeanceDto.film?.id } });
    if (!film) throw new NotFoundException(`Film with ID ${createSeanceDto.film?.id} not found`);

    const salle = await this.salleRepository.findOne({ where: { id_salle: createSeanceDto.salle?.id_salle } });
    if (!salle) throw new NotFoundException(`Salle with ID ${createSeanceDto.salle?.id_salle} not found`);

    const seance = this.seanceRepository.create({
      dateHeure: new Date(createSeanceDto.dateHeure),
      technologie: createSeanceDto.technologie,
      statut: createSeanceDto.statut,
      film,
      salle,
    });

    const saved = await this.seanceRepository.save(seance);
    return this.findOne(saved.id_seance);
  }

  private mapAvailability(seance: Seance & { reservationsCount?: number }) {
    const totalSeats = seance.salle?.capaciteTotale ?? null;
    const reservedSeats = seance.reservationsCount ?? 0;
    const remainingSeats =
      typeof totalSeats === 'number' ? Math.max(0, totalSeats - reservedSeats) : null;

    return {
      id_seance: seance.id_seance,
      dateHeure: seance.dateHeure,
      technologie: seance.technologie,
      statut: seance.statut,
      film: seance.film ? { id: seance.film.id, title: seance.film.title } : null,
      salle: seance.salle
        ? {
            id_salle: seance.salle.id_salle,
            numero: seance.salle.numero,
            capaciteTotale: seance.salle.capaciteTotale ?? null,
          }
        : null,
      totalSeats,
      reservedSeats,
      remainingSeats,
    };
  }

  async findAll() {
    const seances = await this.seanceRepository
      .createQueryBuilder('seance')
      .leftJoinAndSelect('seance.film', 'film')
      .leftJoinAndSelect('seance.salle', 'salle')
      .loadRelationCountAndMap(
        'seance.reservationsCount',
        'seance.reservations',
        'reservation',
        (qb) => qb.andWhere('reservation.statut NOT IN (:...excluded)', { excluded: EXCLUDED_RESERVATION_STATUSES }),
      )
      .getMany();

    return seances.map((s) => this.mapAvailability(s as any));
  }

  async findOne(id: number) {
    const seance = await this.seanceRepository
      .createQueryBuilder('seance')
      .leftJoinAndSelect('seance.film', 'film')
      .leftJoinAndSelect('seance.salle', 'salle')
      .where('seance.id_seance = :id', { id })
      .loadRelationCountAndMap(
        'seance.reservationsCount',
        'seance.reservations',
        'reservation',
        (qb) => qb.andWhere('reservation.statut NOT IN (:...excluded)', { excluded: EXCLUDED_RESERVATION_STATUSES }),
      )
      .getOne();

    if (!seance) throw new NotFoundException(`Seance with ID ${id} not found`);
    return this.mapAvailability(seance as any);
  }

  async update(id: number, updateSeanceDto: UpdateSeanceDto) {
    const seance = await this.seanceRepository.findOne({ where: { id_seance: id }, relations: ['film', 'salle'] });
    if (!seance) throw new NotFoundException(`Seance with ID ${id} not found`);

    if (updateSeanceDto.dateHeure) seance.dateHeure = new Date(updateSeanceDto.dateHeure);
    if (updateSeanceDto.technologie) seance.technologie = updateSeanceDto.technologie;
    if (updateSeanceDto.statut) seance.statut = updateSeanceDto.statut;

    if (updateSeanceDto.film?.id) {
      const film = await this.filmRepository.findOne({ where: { id: updateSeanceDto.film.id } });
      if (!film) throw new NotFoundException(`Film with ID ${updateSeanceDto.film.id} not found`);
      seance.film = film;
    }

    if (updateSeanceDto.salle?.id_salle) {
      const salle = await this.salleRepository.findOne({ where: { id_salle: updateSeanceDto.salle.id_salle } });
      if (!salle) throw new NotFoundException(`Salle with ID ${updateSeanceDto.salle.id_salle} not found`);
      seance.salle = salle;
    }

    await this.seanceRepository.save(seance);
    return this.findOne(id);
  }

  async remove(id: number) {
    const seance = await this.seanceRepository.findOne({ where: { id_seance: id } });
    if (!seance) throw new NotFoundException(`Seance with ID ${id} not found`);
    await this.seanceRepository.delete(id);
    return { message: 'Seance deleted successfully' };
  }
}
