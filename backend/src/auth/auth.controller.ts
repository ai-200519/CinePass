import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── POST /auth/register ─────────────────────────────────────────────────────
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // ── POST /auth/login ────────────────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ── GET /auth/me — get current user ────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async me(@CurrentUser() user: any) {
    return user;
  }

  // ── POST /auth/forgot-password ────────────────────────────────────────────────
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Demander un code OTP de réinitialisation',
    description:
      'Envoie un code OTP à 6 chiffres valable 10 minutes par email.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Si cet email existe, un code OTP a été envoyé.',
      },
    },
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return {
      message: 'Si cet email existe, un code OTP a été envoyé.',
    };
  }

  // ── POST /auth/reset-password ─────────────────────────────────────────────────
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réinitialiser le mot de passe avec OTP',
    description: 'Vérifie le code OTP et met à jour le mot de passe.',
  })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Mot de passe réinitialisé avec succès.' } },
  })
  @ApiResponse({
    status: 400,
    description: 'OTP invalide, expiré ou déjà utilisé',
  })
  async resetPassword(@Body() dto: VerifyOtpDto) {
    await this.authService.resetPasswordWithOtp(
      dto.email,
      dto.otp,
      dto.newPassword,
    );
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }
}
