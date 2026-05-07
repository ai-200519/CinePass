import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Film } from './entities/film.entity';
import { PaginationDto } from './dto/pagination.dto';
import { SearchFilmDto } from './dto/search-film.dto';

/**
 * Service responsible for handling Film business logic.
 */
@Injectable()
export class FilmService {

  constructor(
    @InjectRepository(Film)
    private filmRepository: Repository<Film>, // Injected TypeORM repository for Film entity
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
    const film = await this.filmRepository.findOne({ where: { id } });

    if (!film) {
      throw new NotFoundException(`Film with ID ${id} not found`);
    }

    return this.filmRepository.delete(id);
  }
}
