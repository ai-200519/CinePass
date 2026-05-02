import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyOtpDto {

  @ApiProperty({ example: 'youssef@cinepass.ma' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '483721', description: '6-digit OTP code' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

}