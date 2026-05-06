// src/tarif/dto/update-tarif.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateTarifDto {

  @ApiPropertyOptional({
    example:     45.00,
    description: 'Nouveau prix en MAD',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  prix?: number;
}