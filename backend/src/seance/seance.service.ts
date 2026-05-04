import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from '../film/entities/film.entity';
import { Salle } from '../salle/entities/salle.entity';
import { CreateSeanceDto } from './dto/create-seance.dto';
import { UpdateSeanceDto } from './dto/update-seance.dto';
import { Seance } from './entities/seance.entity';

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

  findAll() {
    return this.seanceRepository.find({ relations: ['film', 'salle'] });
  }

  async findOne(id: number) {
    const seance = await this.seanceRepository.findOne({ where: { id_seance: id }, relations: ['film', 'salle'] });
    if (!seance) throw new NotFoundException(`Seance with ID ${id} not found`);
    return seance;
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
