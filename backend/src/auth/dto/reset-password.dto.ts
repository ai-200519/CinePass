// src/auth/dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {

  @ApiProperty({ example: 'youssef@cinepass.ma' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '483721' })
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}