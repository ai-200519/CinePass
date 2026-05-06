import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional, IsString,
  MaxLength, IsIn,
} from 'class-validator';

export class UpdateProfilDto {

  @ApiPropertyOptional({ example: 'Alami' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nom?: string;

  @ApiPropertyOptional({ example: 'Youssef' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  prenom?: string;

  @ApiPropertyOptional({ example: '+212 6XX-XXXXXX' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string;

  @ApiPropertyOptional({ example: 'FR', enum: ['FR', 'AR', 'EN'] })
  @IsOptional()
  @IsString()
  @IsIn(['FR', 'AR', 'EN'])
  langue?: string;

  // ← No role, no statut, no email — client cannot change these
}