import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {

  @ApiProperty({
    example:     'oldPassword123',
    description: 'Mot de passe actuel — requis pour vérification',
  })
  @IsString()
  motDePasseActuel: string;

  @ApiProperty({
    example:     'newPassword456',
    description: 'Nouveau mot de passe — minimum 6 caractères',
    minLength:   6,
  })
  @IsString()
  @MinLength(6, { message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' })
  @MaxLength(50)
  nouveauMotDePasse: string;
}