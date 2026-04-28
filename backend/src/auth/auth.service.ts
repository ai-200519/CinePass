import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UtilisateurService } from '../utilisateur/utilisateur.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private readonly utilisateurService: UtilisateurService,
    private readonly jwtService: JwtService,
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

    const user = await this.validateUser(
      loginDto.email,
      loginDto.motDePasse,
    );

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (user.statut === 'BANNI') {
      throw new UnauthorizedException('Votre compte a été banni');
    }

    // Generate JWT
    const payload = {
      sub:   user.id_utilisateur,
      email: user.email,
      role:  user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id:     user.id_utilisateur,
        nom:    user.nom,
        prenom: user.prenom,
        email:  user.email,
        role:   user.role,
      },
    };
  }

  // ── Register ────────────────────────────────────────────────────────────────
  async register(registerDto: RegisterDto) {

    const user = await this.utilisateurService.create(registerDto);

    // Auto login after register
    const payload = {
      sub:   user.id_utilisateur,
      email: user.email,
      role:  user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id:     user.id_utilisateur,
        nom:    user.nom,
        prenom: user.prenom,
        email:  user.email,
        role:   user.role,
      },
    };
  }
}