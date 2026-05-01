import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Utilisateur } from './entities/utilisateur.entity';
import { Role } from '../common/enums/role.enum';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { StatutUtilisateur } from 'src/common/enums/statut-utilisateur.enum';

@Injectable()
export class UtilisateurService {
  constructor(
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepository: Repository<Utilisateur>,
  ) {}

  // ── Find by email ───────────────────────────────────────────────────────────
  async findByEmail(email: string): Promise<Utilisateur | null> {
    return this.utilisateurRepository.findOne({
      where: { email },
    });
  }

  // ── Find by ID ──────────────────────────────────────────────────────────────
  async findById(id: number): Promise<Utilisateur | null> {
    return this.utilisateurRepository.findOne({
      where: { id_utilisateur: id },
    });
  }

  // ── Create new client ───────────────────────────────────────────────────────
  async create(registerDto: RegisterDto): Promise<Utilisateur> {
    // Check email uniqueness
    const existing = await this.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.motDePasse, 10);

    // Create entity
    const utilisateur = this.utilisateurRepository.create({
      nom: registerDto.nom,
      prenom: registerDto.prenom,
      email: registerDto.email,
      motDePasse: hashedPassword,
      telephone: registerDto.telephone,
      langue: registerDto.langue || 'FR',
      role: Role.CLIENT, // always CLIENT on register
    });

    return this.utilisateurRepository.save(utilisateur);
  }

  // Save OTP to utilisateur table
  async saveOtp(id: number, otp: string, expiresAt: Date, purpose: string): Promise<void> {
    await this.utilisateurRepository.update(
      { id_utilisateur: id },
      { otpCode: otp, otpExpiresAt: expiresAt, otpUsed: false, otpPurpose: purpose },
    );
  }

  // activate account after email verification
  async activateAccount(id: number): Promise<void> {
    await this.utilisateurRepository.update(
      { id_utilisateur: id },
      { statut: StatutUtilisateur.ACTIF, otpCode: null, otpExpiresAt: null, otpUsed: true },
    );
  }

  // Reset password and clear OTP fields
  async resetPasswordAndClearOtp(
    id: number,
    hashedPassword: string,
  ): Promise<void> {
    await this.utilisateurRepository.update(
      { id_utilisateur: id },
      {
        motDePasse: hashedPassword,
        otpCode: null,
        otpExpiresAt: null,
        otpUsed: true, // mark as used before nullifying
      },
    );
  }
}
