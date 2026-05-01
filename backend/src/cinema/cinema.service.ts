import { Injectable } from '@nestjs/common';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cinema } from './entities/cinema.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CinemaService {

  @InjectRepository(Cinema)
  private readonly cinemaRepository: Repository<Cinema>;

  create(createCinemaDto: CreateCinemaDto) {
    const cinema = this.cinemaRepository.create(createCinemaDto);
    return this.cinemaRepository.save(cinema);
  }

  findAll() {
    return this.cinemaRepository.find();
  }

  findOne(id: number) {
    return this.cinemaRepository.findOne({ where: { id_cinema: id } });
  }

  update(id: number, updateCinemaDto: UpdateCinemaDto) {
    return this.cinemaRepository.update(id, updateCinemaDto);
  }

  remove(id: number) {
    return this.cinemaRepository.delete(id);
  }
}
