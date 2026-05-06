import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString } from 'class-validator';

export class ResendOtpDto {

  @ApiProperty({
    example:     'youssef@cinepass.ma',
    description: 'Email du compte',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example:     'register',
    description: 'But du code OTP : register | reset_password',
    enum:        ['register', 'reset_password'],
  })
  @IsString()
  @IsIn(['register', 'reset_password'])
  purpose: 'register' | 'reset_password';
}