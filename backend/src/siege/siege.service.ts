import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatutReservation } from '../common/enums/statut-reservation.enum';
import { ReservationSiege } from '../reservation/entities/reservation-siege.entity';
import { Salle } from '../salle/entities/salle.entity';
import { CreateSiegeDto } from './dto/create-siege.dto';
import { UpdateSiegeDto } from './dto/update-siege.dto';
import { Siege } from './entities/siege.entity';

@Injectable()
export class SiegeService {
  constructor(
    @InjectRepository(Siege)
    private readonly siegeRepository: Repository<Siege>,
    @InjectRepository(Salle)
    private readonly salleRepository: Repository<Salle>,
    @InjectRepository(ReservationSiege)
    private readonly reservationSiegeRepository: Repository<ReservationSiege>,
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

  async findAll(idSalle?: number, idSeance?: number) {
    const sieges = await this.siegeRepository.find({
      where: idSalle ? { salle: { id_salle: idSalle } } : undefined,
      relations: ['salle'],
      order: { rangee: 'ASC', numero: 'ASC' },
    });

    if (!idSeance) return sieges;

    const statuts = [
      StatutReservation.EN_COURS,
      StatutReservation.PAYEE,
      StatutReservation.VALIDEE,
      StatutReservation.UTILISEE,
    ];

    const qb = this.reservationSiegeRepository
      .createQueryBuilder('rs')
      .select('siege.id_siege', 'id_siege')
      .innerJoin('rs.reservation', 'r')
      .innerJoin('rs.siege', 'siege')
      .innerJoin('siege.salle', 'salle')
      .where('r.seance = :id_seance', { id_seance: idSeance })
      .andWhere('r.statut IN (:...statuts)', { statuts });

    if (idSalle) {
      qb.andWhere('salle.id_salle = :id_salle', { id_salle: idSalle });
    }

    const reservedRows = await qb.getRawMany<{ id_siege: string }>();
    const reservedSet = new Set(reservedRows.map((row) => Number(row.id_siege)));

    return sieges.map((siege) => ({
      ...siege,
      reserved: reservedSet.has(siege.id_siege),
    }));
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
