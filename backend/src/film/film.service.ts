import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Paiement } from '../paiement/entities/paiement.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Seance } from '../seance/entities/seance.entity';
import { Tarif } from '../tarif/entities/tarif.entity';
import { CreateFilmDto } from './dto/create-film.dto';
import { PaginationDto } from './dto/pagination.dto';
import { SearchFilmDto } from './dto/search-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { Film } from './entities/film.entity';

/**
 * Service responsible for handling Film business logic.
 */
@Injectable()
export class FilmService {

  constructor(
    @InjectRepository(Film)
    private filmRepository: Repository<Film>, // Injected TypeORM repository for Film entity
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Create a new film.
   * @param createFilmDto Data required to create a film
   * @returns The saved film entity
   */
  create(createFilmDto: CreateFilmDto) {
    return this.filmRepository.save(createFilmDto);
  }

  /**
   * Retrieve paginated list of films.
   * @param paginationDto Contains page number and limit
   * @returns Paginated response with metadata
   */
  async findAll(paginationDto: PaginationDto) {
    const page = paginationDto.page ?? 1;
    const limit = paginationDto.limit ?? 10;
    const ville = paginationDto.ville?.trim();
    const skip = (page - 1) * limit;

    const query = this.filmRepository
      .createQueryBuilder('film')
      .leftJoin('film.seances', 'seance')
      .leftJoin('seance.salle', 'salle')
      .leftJoin('salle.cinema', 'cinema')
      .distinct(true)
      .skip(skip)
      .take(limit)
      .orderBy('film.id', 'DESC');

    if (ville) {
      query.where('cinema.ville = :ville', { ville });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }
  async search(searchFilmDto : SearchFilmDto) {

    if (!searchFilmDto.q) return this.findAll(searchFilmDto);
    const page = searchFilmDto.page ?? 1;
    const limit = searchFilmDto.limit ?? 10;
    const skip = (page - 1) * limit;
    const [data, total] = await this.filmRepository.findAndCount({
      where: [
        { title: ILike(`%${searchFilmDto.q}%`) },
        { description: ILike(`%${searchFilmDto.q}%`) },
        { genre: ILike(`%${searchFilmDto.q}%`) },
        { director: ILike(`%${searchFilmDto.q}%`) },
      ],
      skip,
      take: limit,
      order: { id: 'DESC' },
    });
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Retrieve a single film by ID.
   * @param id Film ID
   * @throws NotFoundException if film does not exist
   * @returns Film entity
   */
  async findOne(id: number) {
    const film = await this.filmRepository.findOne({ where: { id } });

    if (!film) {
      throw new NotFoundException(`Film with ID ${id} not found`);
    }

    return film;
  }

  /**
   * Update an existing film.
   * @param id Film ID
   * @param updateFilmDto Fields to update
   * @throws NotFoundException if film does not exist
   * @returns Update result
   */
  async update(id: number, updateFilmDto: UpdateFilmDto) {
    const film = await this.filmRepository.findOne({ where: { id } });

    if (!film) {
      throw new NotFoundException(`Film with ID ${id} not found`);
    }

    return this.filmRepository.update(id, updateFilmDto);
  }

  /**
   * Delete a film by ID.
   * @param id Film ID
   * @throws NotFoundException if film does not exist
   * @returns Delete result
   */
  async remove(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const film = await manager.findOne(Film, { where: { id } });

      if (!film) {
        throw new NotFoundException(`Film with ID ${id} not found`);
      }

      const seances = await manager
        .createQueryBuilder(Seance, 'seance')
        .select('seance.id_seance', 'id_seance')
        .where('seance.id_film = :id', { id })
        .getRawMany<{ id_seance: number }>();

      const seanceIds = seances.map((seance) => Number(seance.id_seance));

      if (seanceIds.length > 0) {
        const reservations = await manager
          .createQueryBuilder(Reservation, 'reservation')
          .select('reservation.id_reservation', 'id_reservation')
          .where('reservation.id_seance IN (:...seanceIds)', { seanceIds })
          .getRawMany<{ id_reservation: number }>();

        const reservationIds = reservations.map((reservation) => Number(reservation.id_reservation));

        if (reservationIds.length > 0) {
          await manager
            .createQueryBuilder()
            .delete()
            .from(Paiement)
            .where('id_reservation IN (:...reservationIds)', { reservationIds })
            .execute();

          await manager
            .createQueryBuilder()
            .delete()
            .from(Reservation)
            .where('id_reservation IN (:...reservationIds)', { reservationIds })
            .execute();
        }

        await manager
          .createQueryBuilder()
          .delete()
          .from(Tarif)
          .where('id_seance IN (:...seanceIds)', { seanceIds })
          .execute();

        await manager
          .createQueryBuilder()
          .delete()
          .from(Seance)
          .where('id_seance IN (:...seanceIds)', { seanceIds })
          .execute();
      }

      return manager.delete(Film, { id });
    });
  }
}
