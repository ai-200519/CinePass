// src/reservation/dto/filter-reservation.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatutReservation } from '../../common/enums/statut-reservation.enum';

export class FilterReservationDto {

  @ApiPropertyOptional({
    example:     'PAYEE',
    description: 'Filtrer par statut',
    enum:        StatutReservation,
  })
  @IsOptional()
  @IsEnum(StatutReservation)
  statut?: StatutReservation;

  @ApiPropertyOptional({
    example:     1,
    description: 'Filtrer par ID séance',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  id_seance?: number;

  @ApiPropertyOptional({
    example:     1,
    description: 'Filtrer par ID cinéma',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  id_cinema?: number;

  @ApiPropertyOptional({
    example:     '2026-05-01',
    description: 'Date début (format YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiPropertyOptional({
    example:     '2026-05-31',
    description: 'Date fin (format YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiPropertyOptional({
    example:     'CP-2026-ABCDEF',
    description: 'Rechercher par référence',
  })
  @IsOptional()
  reference?: string;
}