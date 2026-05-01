import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSalleDto } from './dto/create-salle.dto';
import { UpdateSalleDto } from './dto/update-salle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Salle } from './entities/salle.entity';
import { Repository } from 'typeorm';
import { Cinema } from '../cinema/entities/cinema.entity';

@Injectable()
export class SalleService {

  constructor(
    @InjectRepository(Salle)
    private readonly salleRepository: Repository<Salle>,
    @InjectRepository(Cinema)
    private readonly cinemaRepository: Repository<Cinema>,
  ) { }


  async create(createSalleDto: CreateSalleDto) {
    const cinema = await this.cinemaRepository.findOne({ where: { id_cinema: createSalleDto.id_cinema } });
    if (!cinema) {
      throw new NotFoundException(`Cinema with ID ${createSalleDto.id_cinema} not found`);
    }
    const salle = this.salleRepository.create({
      name: createSalleDto.name,
      numero: createSalleDto.numero,
      totalCapacity: createSalleDto.totalCapacity,
      equipments: createSalleDto.equipments,
      cinema: cinema,
    });
    return this.salleRepository.save(salle);
  }

  findAll() {
    return this.salleRepository.find();
  }

  async findOne(id: number) {
    const salle = await this.salleRepository.findOne({ where: { id_salle: id } });

    if (!salle) {
      throw new NotFoundException(`Salle with ID ${id} not found`);
    }

    return salle;
  }

  async update(id: number, updateSalleDto: UpdateSalleDto) {
    const salle = await this.salleRepository.findOne({ where: { id_salle: id } });

    if (!salle) {
      throw new NotFoundException(`Salle with ID ${id} not found`);
    }

    if (updateSalleDto.id_cinema) {
      const cinema = await this.cinemaRepository.findOne({ where: { id_cinema: updateSalleDto.id_cinema } });
      if (!cinema) {
        throw new NotFoundException(`Cinema with ID ${updateSalleDto.id_cinema} not found`);
      }
      salle.cinema = cinema;
    }
    return this.salleRepository.update(id, updateSalleDto);
  }

  async remove(id: number) {
    const salle = await this.salleRepository.findOne({ where: { id_salle: id } });

    if (!salle) {
      throw new NotFoundException(`Salle with ID ${id} not found`);
    }

    return this.salleRepository.delete(id);
  }
}
