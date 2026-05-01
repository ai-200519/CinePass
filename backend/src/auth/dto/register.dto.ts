import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Youssef' })
  @IsString()
  @MaxLength(100)
  nom: string;

  @ApiProperty({ example: 'Elmasoudi' })
  @IsString()
  @MaxLength(100)
  prenom: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @MaxLength(50)
  motDePasse: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  langue?: string;
}