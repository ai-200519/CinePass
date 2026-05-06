// src/reservation/dto/create-reservation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt, IsPositive, IsArray,
  ValidateNested, IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TypePublic } from '../../tarif/entities/tarif.entity';

export class SiegeSelectionDto {

  @ApiProperty({ example: 5, description: 'ID du siège sélectionné' })
  @IsInt()
  @IsPositive()
  id_siege: number;

  @ApiProperty({
    example:     'NORMAL',
    description: 'Type de public pour le tarif',
    enum:        TypePublic,
  })
  @IsEnum(TypePublic)
  typePublic: TypePublic;
}

export class CreateReservationDto {

  @ApiProperty({ example: 1, description: 'ID de la séance' })
  @IsInt()
  @IsPositive()
  id_seance: number;

  @ApiProperty({
    type:        [SiegeSelectionDto],
    description: 'Liste des sièges à réserver avec le type de public',
    example: [
      { id_siege: 5,  typePublic: 'NORMAL'   },
      { id_siege: 12, typePublic: 'ETUDIANT' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SiegeSelectionDto)
  sieges: SiegeSelectionDto[];
}