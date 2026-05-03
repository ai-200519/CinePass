// src/tarif/tarif.service.ts
import {
  Injectable, NotFoundException, ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarif } from './entities/tarif.entity';
import { CreateTarifDto } from './dto/create-tarif.dto';
import { UpdateTarifDto } from './dto/update-tarif.dto';

@Injectable()
export class TarifService {

  constructor(
    @InjectRepository(Tarif)
    private readonly tarifRepository: Repository<Tarif>,
  ) {}

  // ── Create tarif for a séance ─────────────────────────────────────────────
  async create(dto: CreateTarifDto): Promise<Tarif> {

    // Check if tarif for same typePublic already exists for this séance
    const existing = await this.tarifRepository.findOne({
      where: {
        typePublic: dto.typePublic,
        seance:     { id_seance: dto.id_seance },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Un tarif ${dto.typePublic} existe déjà pour cette séance`
      );
    }

    const tarif = this.tarifRepository.create({
      typePublic: dto.typePublic,
      prix:       dto.prix,
      seance:     { id_seance: dto.id_seance },
    });

    return this.tarifRepository.save(tarif);
  }

  // ── Get all tarifs for a séance ───────────────────────────────────────────
  async findBySeance(id_seance: number): Promise<Tarif[]> {
    return this.tarifRepository.find({
      where: { seance: { id_seance } },
      order: { typePublic: 'ASC' },
    });
  }

  // ── Update tarif ──────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateTarifDto): Promise<Tarif> {

    const tarif = await this.tarifRepository.findOne({
      where: { id_tarif: id },
    });

    if (!tarif) throw new NotFoundException('Tarif introuvable');

    await this.tarifRepository.update({ id_tarif: id }, { prix: dto.prix });

    return this.tarifRepository.findOne({ where: { id_tarif: id } });
  }

  // ── Delete tarif ──────────────────────────────────────────────────────────
  async remove(id: number): Promise<void> {

    const tarif = await this.tarifRepository.findOne({
      where: { id_tarif: id },
    });

    if (!tarif) throw new NotFoundException('Tarif introuvable');

    await this.tarifRepository.delete(id);
  }
}