import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Role } from '../../common/enums/role.enum';
import { StatutUtilisateur } from '../../common/enums/statut-utilisateur.enum';

export class UpdateUtilisateurDto {
  @ApiPropertyOptional({ example: 'Alami' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nom?: string;

  @ApiPropertyOptional({ example: 'Youssef' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  prenom?: string;

  @ApiPropertyOptional({ example: 'youssef@cinepass.ma' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+212612345678' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ enum: StatutUtilisateur })
  @IsOptional()
  @IsEnum(StatutUtilisateur)
  statut?: StatutUtilisateur;

  @ApiPropertyOptional({ example: 'FR' })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  langue?: string;
}