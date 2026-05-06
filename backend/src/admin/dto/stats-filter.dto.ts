// src/admin/dto/stats-filter.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsInt, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class StatsFilterDto {
  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Date début de la période (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Date fin de la période (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Nombre de résultats à retourner (défaut: 5)',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filtrer par cinéma (ID du cinéma)',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  id_cinema?: number;
}
