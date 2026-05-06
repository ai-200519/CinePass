// src/tarif/dto/create-tarif.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive, IsInt } from 'class-validator';
import { TypePublic } from '../entities/tarif.entity';

export class CreateTarifDto {

  @ApiProperty({
    example:     'NORMAL',
    description: 'Type de public',
    enum:        TypePublic,
  })
  @IsEnum(TypePublic)
  typePublic: TypePublic;

  @ApiProperty({
    example:     50.00,
    description: 'Prix en MAD',
  })
  @IsNumber()
  @IsPositive()
  prix: number;

  @ApiProperty({
    example:     1,
    description: 'ID de la séance concernée',
  })
  @IsInt()
  @IsPositive()
  id_seance: number;
}