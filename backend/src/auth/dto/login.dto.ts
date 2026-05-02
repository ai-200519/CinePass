import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {

  @ApiProperty({
    example:     'youssef@cinepass.ma',
    description: 'Adresse email du compte — utilisée comme identifiant de connexion',
  })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({
    example:     '123456',
    description: 'Mot de passe du compte — minimum 6 caractères',
    minLength:   6,
  })
  @IsString()
  @MinLength(6)
  motDePasse: string;
}