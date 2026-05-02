import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {

  @ApiProperty({
    example:     'Alami',
    description: 'Nom de famille du client',
    maxLength:   100,
  })
  @IsString()
  @MaxLength(100)
  nom: string;

  @ApiProperty({
    example:     'Youssef',
    description: 'Prénom du client',
    maxLength:   100,
  })
  @IsString()
  @MaxLength(100)
  prenom: string;

  @ApiProperty({
    example:     'youssef@cinepass.ma',
    description: 'Adresse email unique — utilisée pour la connexion et les notifications',
  })
  @IsEmail({}, { message: 'Format email invalide' })
  email: string;

  @ApiProperty({
    example:     '123456',
    description: 'Mot de passe — minimum 6 caractères, maximum 50',
    minLength:   6,
    maxLength:   50,
  })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @MaxLength(50)
  motDePasse: string;

  @ApiPropertyOptional({
    example:     '+212 6XX-XXXXXX',
    description: 'Numéro de téléphone — optionnel, utilisé pour les notifications SMS',
    maxLength:   20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string;

  @ApiPropertyOptional({
    example:     'FR',
    description: 'Langue préférée — utilisée pour les notifications SMS ou emails et l\'interface. Valeurs : FR | AR | EN',
    default:     'FR',
    enum:        ['FR', 'AR', 'EN'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['FR', 'AR', 'EN'], { message: 'Langue invalide — valeurs acceptées : FR, AR, EN' })
  langue?: string;
}