import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSiegeDto } from './dto/create-siege.dto';
import { UpdateSiegeDto } from './dto/update-siege.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Siege } from './entities/siege.entity';
import { Repository } from 'typeorm';
import { Salle } from '../salle/entities/salle.entity';

@Injectable()
export class SiegeService {
  constructor(
    @InjectRepository(Siege)
    private readonly siegeRepository: Repository<Siege>,
    @InjectRepository(Salle)
    private readonly salleRepository: Repository<Salle>,
  ) { }

  async create(createSiegeDto: CreateSiegeDto) {
    const salle = await this.salleRepository.findOne({ where: { id_salle: createSiegeDto.id_salle } });
    if (!salle) {
      throw new NotFoundException(`Salle with ID ${createSiegeDto.id_salle} not found`);
    }
    const siege = this.siegeRepository.create({
      rangee: createSiegeDto.rangee,
      numero: createSiegeDto.numero,
      categorie: createSiegeDto.categorie,
      statut: createSiegeDto.statut,
      salle: salle,
    });
    return this.siegeRepository.save(siege);
  }

  async findAll(idSalle?: number) {
    return this.siegeRepository.find({
      where: idSalle ? { salle: { id_salle: idSalle } } : undefined,
      relations: ['salle'],
      order: { rangee: 'ASC', numero: 'ASC' },
    });
  }

  async findOne(id: number) {
    const siege = await this.siegeRepository.findOne({
      where: { id_siege: id },
      relations: ['salle'],
    });
    if (!siege) {
      throw new NotFoundException(`Siege with ID ${id} not found`);
    }
    return siege;
  }

  async update(id: number, updateSiegeDto: UpdateSiegeDto) {
    const siege = await this.siegeRepository.findOne({ where: { id_siege: id } });
    if (!siege) {
      throw new NotFoundException(`Siege with ID ${id} not found`);
    }
    if (updateSiegeDto.id_salle) {
      const salle = await this.salleRepository.findOne({ where: { id_salle: updateSiegeDto.id_salle } });
      if (!salle) {
        throw new NotFoundException(`Salle with ID ${updateSiegeDto.id_salle} not found`);
      }
      siege.salle = salle;
    }
    return this.siegeRepository.update(id, updateSiegeDto);
  }

  async remove(id: number) {
    const siege = await this.siegeRepository.findOne({ where: { id_siege: id } });
    if (!siege) {
      throw new NotFoundException(`Siege with ID ${id} not found`);
    }
    return this.siegeRepository.delete(id);
  }
}
