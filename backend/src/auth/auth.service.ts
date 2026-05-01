import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UtilisateurService } from '../utilisateur/utilisateur.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailProvider } from 'src/common/providers/email.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly utilisateurService: UtilisateurService,
    private readonly jwtService: JwtService,
    private readonly emailProvider: EmailProvider,
  ) {}

  // ── Validate user credentials ───────────────────────────────────────────────
  async validateUser(email: string, motDePasse: string) {
    const user = await this.utilisateurService.findByEmail(email);

    if (!user) return null;

    const passwordMatch = await bcrypt.compare(motDePasse, user.motDePasse);

    if (!passwordMatch) return null;

    return user;
  }

  // ── Login ───────────────────────────────────────────────────────────────────
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.motDePasse);

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (user.statut === 'BANNI') {
      throw new UnauthorizedException('Votre compte a été banni');
    }

    // Generate JWT
    const payload = {
      sub: user.id_utilisateur,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id_utilisateur,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ── Register ────────────────────────────────────────────────────────────────
  // sends OTP, status = PENDING, user must verify OTP to activate account
  async register(registerDto: RegisterDto) {
    const user = await this.utilisateurService.create(registerDto);
    // statut = PENDING by default

    // Generate OTP
    const otp = this.generateOTP();
    const expiresAt = this.getOtpExpiry();

    // Save OTP
    await this.utilisateurService.saveOtp(
      user.id_utilisateur,
      otp,
      expiresAt,
      'register',
    );

    // Send email
    await this.emailProvider.sendOtp(
      user.email,
      user.nom,
      otp,
      expiresAt,
      'register',
    );

    // Do NOT return JWT yet — user must verify email first
    return {
      message: `Un code de vérification a été envoyé à ${user.email}`,
      email: user.email,
    };
  }

  // ── Verify email OTP → activates account, returns JWT ────────────────────────
  async verifyEmail(email: string, otp: string) {
    const user = await this.verifyOtp(email, otp, 'register');

    // Activate account
    await this.utilisateurService.activateAccount(user.id_utilisateur);

    // Now return JWT
    const payload = {
      sub: user.id_utilisateur,
      email: user.email,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id_utilisateur,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    };
  }
  // ── Forgot password → sends OTP ───────────────────────────────────────────────
  async forgotPassword(email: string): Promise<void> {
    const user = await this.utilisateurService.findByEmail(email);
    if (!user) return; // Silent — prevent enumeration

    const otp = this.generateOTP();
    const expiresAt = this.getOtpExpiry();

    await this.utilisateurService.saveOtp(
      user.id_utilisateur,
      otp,
      expiresAt,
      'reset_password',
    );

    await this.emailProvider.sendOtp(
      user.email,
      user.nom,
      otp,
      expiresAt,
      'reset_password',
    );
  }

  // ── Reset password with OTP ───────────────────────────────────────────────────
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.verifyOtp(email, otp, 'reset_password');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.utilisateurService.resetPasswordAndClearOtp(
      user.id_utilisateur,
      hashedPassword,
    );
  }

  // ── Private helpers ───────────────────────────────────────────────────────────
  private generateOTP(): string {
    const buffer = require('crypto').randomBytes(3);
    const num = buffer.readUIntBE(0, 3) % 1000000;
    return num.toString().padStart(6, '0');
  }

  private getOtpExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    return expiry;
  }

  private async verifyOtp(email: string, otp: string, purpose: string) {
    const user = await this.utilisateurService.findByEmail(email);

    if (!user) throw new BadRequestException('Email introuvable');
    if (!user.otpCode) throw new BadRequestException('Aucun code OTP demandé');
    if (user.otpUsed)
      throw new BadRequestException('Ce code a déjà été utilisé');
    if (user.otpPurpose !== purpose)
      throw new BadRequestException('Code invalide pour cette action');
    if (new Date() > user.otpExpiresAt)
      throw new BadRequestException('Code OTP expiré');
    if (user.otpCode !== otp)
      throw new BadRequestException('Code OTP incorrect');

    return user;
  }
}
