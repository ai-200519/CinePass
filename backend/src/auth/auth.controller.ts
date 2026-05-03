import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto'; // ← new import

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResendOtpDto } from './dto/resend-otp.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── POST /auth/register ───────────────────────────────────────────────────
  // Creates account → status PENDING → sends OTP by email
  // Does NOT return JWT — user must verify email first
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un compte',
    description:
      'Crée un compte CLIENT avec statut PENDING. ' +
      'Envoie un code OTP à 6 chiffres par email. ' +
      'Le JWT est retourné uniquement après vérification via /auth/verify-email.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Compte créé — OTP envoyé par email',
    schema: {
      example: {
        message: 'Un code de vérification a été envoyé à youssef@cinepass.ma',
        email: 'youssef@cinepass.ma',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // ── POST /auth/verify-email ───────────────────────────────────────────────
  // Verifies OTP → status ACTIF → returns JWT
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Vérifier l'email avec OTP",
    description:
      'Vérifie le code OTP reçu par email après inscription. ' +
      'Active le compte (PENDING → ACTIF) et retourne le JWT.',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'Email vérifié — compte activé — JWT retourné',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          nom: 'Alami',
          prenom: 'Youssef',
          email: 'youssef@cinepass.ma',
          role: 'CLIENT',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'OTP invalide, expiré ou déjà utilisé',
  })
  async verifyEmail(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyEmail(dto.email, dto.otp);
  }

  // ── POST /auth/login ──────────────────────────────────────────────────────
  // Returns JWT only if status = ACTIF
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Se connecter',
    description:
      'Authentifie CLIENT, STAFF ou ADMIN. ' +
      'Retourne JWT uniquement si le compte est ACTIF. ' +
      'Retourne 401 si le compte est PENDING (email non vérifié).',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie — JWT retourné',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          nom: 'Alami',
          prenom: 'Youssef',
          email: 'youssef@cinepass.ma',
          role: 'CLIENT', // CLIENT | STAFF | ADMIN
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({
    status: 401,
    description: 'Identifiants incorrects / Compte PENDING ou BANNI',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ── GET /auth/me ──────────────────────────────────────────────────────────
  // Returns current authenticated user from JWT
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Utilisateur connecté',
    description:
      "Retourne les informations de l'utilisateur authentifié depuis le JWT.",
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur connecté',
    schema: {
      example: {
        id_utilisateur: 1,
        email: 'youssef@cinepass.ma',
        role: 'CLIENT',
        nom: 'Alami',
        prenom: 'Youssef',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token invalide ou expiré' })
  async me(@CurrentUser() user: any) {
    return user;
  }

  // ── POST /auth/forgot-password ────────────────────────────────────────────
  // Sends OTP by email for password reset
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Demander une réinitialisation de mot de passe',
    description:
      'Envoie un code OTP à 6 chiffres valable 10 minutes. ' +
      "Retourne toujours 200 même si l'email n'existe pas (sécurité anti-énumération).",
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'OTP envoyé si le compte existe',
    schema: {
      example: {
        message: 'Si cet email existe, un code OTP a été envoyé.',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Format email invalide' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return {
      message: 'Si cet email existe, un code OTP a été envoyé.',
    };
  }

  // ── POST /auth/reset-password ─────────────────────────────────────────────
  // Verifies OTP + updates password
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réinitialiser le mot de passe avec OTP',
    description:
      'Vérifie le code OTP reçu par email et met à jour le mot de passe. ' +
      'Le code est invalidé après utilisation.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe réinitialisé avec succès',
    schema: {
      example: {
        message: 'Mot de passe réinitialisé avec succès.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'OTP invalide, expiré ou déjà utilisé',
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }
  // ── POST /auth/resend-otp ─────────────────────────────────────────────────
  // Resends OTP for expired or lost codes
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renvoyer le code OTP',
    description:
      'Génère un nouveau code OTP et le renvoie par email. ' +
      "Utilisable si le code précédent a expiré ou n'a pas été reçu. " +
      'Fonctionne pour register et reset_password.',
  })
  @ApiBody({ type: ResendOtpDto })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Un nouveau code OTP a été envoyé à youssef@cinepass.ma',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email invalide ou compte déjà actif',
  })
  async resendOtp(@Body() dto: ResendOtpDto) {
    await this.authService.resendOtp(dto.email, dto.purpose);
    return {
      message: `Un nouveau code OTP a été envoyé à ${dto.email}`,
    };
  }
}
