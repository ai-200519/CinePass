import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
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
  async register(registerDto: RegisterDto) {
    const user = await this.utilisateurService.create(registerDto);

    // Auto login after register
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

  // ── Generate OTP  ────────────────────────────────────────────────────────────────
  private generateOtp(): string {
    const buffer = crypto.randomBytes(3); // 3 bytes = 6 hex characters
    const num = buffer.readUIntBE(0, 3) % 1000000;
    return num.toString().padStart(6, '0');
  }
  // ── Step 1 : Send OTP ─────────────────────────────────────────────────────────
  async forgotPassword(email: string): Promise<void> {
    const user = await this.utilisateurService.findByEmail(email);

    // Always return OK — prevent email enumeration
    if (!user) return;

    // Generate 6-digit OTP
    const otp = this.generateOtp();

    // Set expiry — 10 minutes
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10);

    // Save OTP in utilisateur table
    await this.utilisateurService.saveOtp(
      user.id_utilisateur,
      otp,
      otpExpiresAt,
    );

    // Send OTP by email
    await this.emailProvider.sendOtp(user.email, user.nom, otp);
  }

  // ── Step 2 : Verify OTP + reset password ─────────────────────────────────────
  async resetPasswordWithOtp(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.utilisateurService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Email introuvable');
    }

    // Check OTP exists
    if (!user.otpCode) {
      throw new BadRequestException('Aucun code OTP demandé');
    }

    // Check OTP already used
    if (user.otpUsed) {
      throw new BadRequestException('Ce code a déjà été utilisé');
    }

    // Check OTP not expired
    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException(
        'Code OTP expiré — veuillez faire une nouvelle demande',
      );
    }

    // Check OTP matches
    if (user.otpCode !== otp) {
      throw new BadRequestException('Code OTP incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password + clear OTP
    await this.utilisateurService.resetPasswordAndClearOtp(
      user.id_utilisateur,
      hashedPassword,
    );
  }
}
