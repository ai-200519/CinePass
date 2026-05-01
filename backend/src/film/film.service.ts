import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from './entities/film.entity';

@Injectable()
export class FilmService {

  constructor(
    @InjectRepository(Film)
    private filmRepository: Repository<Film>, // TypeORM automatically provides this
  ) { }

  create(createFilmDto: CreateFilmDto) {
    return this.filmRepository.save(createFilmDto);
  }

  findAll() {
    return this.filmRepository.find();
  }

  async findOne(id: number) {
    const film = await this.filmRepository.findOne({ where: { id } });

    if (!film) {
      throw new NotFoundException(`Film with ID ${id} not found`);
    }

    return film;
  }

  async update(id: number, updateFilmDto: UpdateFilmDto) {
    const film = await this.filmRepository.findOne({ where: { id } });

    if (!film) {
      throw new NotFoundException(`Film with ID ${id} not found`);
    }

    return this.filmRepository.update(id, updateFilmDto);
  }

  async remove(id: number) {
    const film = await this.filmRepository.findOne({ where: { id } });

    if (!film) {
      throw new NotFoundException(`Film with ID ${id} not found`);
    }

    return this.filmRepository.delete(id);
  }
}
