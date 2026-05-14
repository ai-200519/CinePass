import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail, IsEnum, IsOptional,
  IsInt, IsString, MaxLength, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role }              from '../../common/enums/role.enum';
import { StatutUtilisateur } from '../../common/enums/statut-utilisateur.enum';

export class UpdateUtilisateurDto {

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

  @ApiPropertyOptional({ example: 'youssef@cinepass.ma' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+212 6XX-XXXXXX' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string;

  @ApiPropertyOptional({ example: 'FR', enum: ['FR', 'AR', 'EN'] })
  @IsOptional()
  @IsString()
  langue?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ enum: StatutUtilisateur })
  @IsOptional()
  @IsEnum(StatutUtilisateur)
  statut?: StatutUtilisateur;

  @ApiPropertyOptional({
    example: 1,
    description: 'Cinema assigne au staff. Envoyer null pour retirer l affectation.',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_cinema?: number | null;
}
