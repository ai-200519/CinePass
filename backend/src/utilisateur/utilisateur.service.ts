import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Utilisateur } from './entities/utilisateur.entity';
import { Role } from '../common/enums/role.enum';
import { StatutUtilisateur } from '../common/enums/statut-utilisateur.enum';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import * as bcrypt from 'bcrypt';

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
      relations: ['cinema'],
    });
  }

  // ── Find by ID ──────────────────────────────────────────────────────────────
  async findById(id: number): Promise<Utilisateur | null> {
    return this.utilisateurRepository.findOne({
      where: { id_utilisateur: id },
      relations: ['cinema'],
    });
  }

  // ── Find all (admin) ────────────────────────────────────────────────────────
  async findAll(): Promise<Omit<Utilisateur, 'motDePasse'>[]> {
    const users = await this.utilisateurRepository.find({
      relations: ['cinema'],
      order: { dateInscription: 'DESC' },
    });
    // Never expose password hashes
    return users.map(({ motDePasse, otpCode, otpExpiresAt, ...safe }) => safe as any);
  }

  // ── Find one by ID (admin) ──────────────────────────────────────────────────
  async findOne(id: number): Promise<Omit<Utilisateur, 'motDePasse'>> {
    const user = await this.utilisateurRepository.findOne({
      where: { id_utilisateur: id },
      relations: ['cinema'],
    });
    if (!user) throw new NotFoundException(`Utilisateur #${id} introuvable`);
    const { motDePasse, otpCode, otpExpiresAt, ...safe } = user;
    return safe as any;
  }

  // ── Create new client (register) ────────────────────────────────────────────
  async create(registerDto: RegisterDto): Promise<Utilisateur> {
    const existing = await this.findByEmail(registerDto.email);
    if (existing) throw new ConflictException('Cet email est déjà utilisé');

    const hashedPassword = await bcrypt.hash(registerDto.motDePasse, 10);
    const utilisateur = this.utilisateurRepository.create({
      nom: registerDto.nom,
      prenom: registerDto.prenom,
      email: registerDto.email,
      motDePasse: hashedPassword,
      telephone: registerDto.telephone,
      langue: registerDto.langue || 'FR',
      role: Role.CLIENT,
    });

    return this.utilisateurRepository.save(utilisateur);
  }

  // ── Update utilisateur (admin) ──────────────────────────────────────────────
  async update(
    id: number,
    dto: UpdateUtilisateurDto,
  ): Promise<Omit<Utilisateur, 'motDePasse'>> {
    const user = await this.utilisateurRepository.findOne({
      where: { id_utilisateur: id },
    });
    if (!user) throw new NotFoundException(`Utilisateur #${id} introuvable`);

    // Check email uniqueness if changed
    if (dto.email && dto.email !== user.email) {
      const emailTaken = await this.findByEmail(dto.email);
      if (emailTaken) throw new ConflictException('Cet email est déjà utilisé');
    }

    Object.assign(user, dto);
    await this.utilisateurRepository.save(user);
    return this.findOne(id);
  }

  // ── Activer un compte ───────────────────────────────────────────────────────
  async activerCompte(id: number): Promise<Omit<Utilisateur, 'motDePasse'>> {
    return this.update(id, { statut: StatutUtilisateur.ACTIF });
  }

  // ── Suspendre un compte ─────────────────────────────────────────────────────
  async suspendreCompte(id: number): Promise<Omit<Utilisateur, 'motDePasse'>> {
    return this.update(id, { statut: StatutUtilisateur.SUSPENDU });
  }

  // ── Changer le rôle ─────────────────────────────────────────────────────────
  async changerRole(
    id: number,
    role: Role,
  ): Promise<Omit<Utilisateur, 'motDePasse'>> {
    return this.update(id, { role });
  }

  // ── Supprimer un utilisateur ────────────────────────────────────────────────
  async remove(id: number): Promise<{ message: string }> {
    const user = await this.utilisateurRepository.findOne({
      where: { id_utilisateur: id },
    });
    if (!user) throw new NotFoundException(`Utilisateur #${id} introuvable`);
    await this.utilisateurRepository.delete(id);
    return { message: `Utilisateur #${id} supprimé avec succès` };
  }

  // ── OTP helpers (auth module) ───────────────────────────────────────────────
  async saveOtp(
    id: number,
    otp: string,
    expiresAt: Date,
    purpose: string,
  ): Promise<void> {
    await this.utilisateurRepository.update(
      { id_utilisateur: id },
      { otpCode: otp, otpExpiresAt: expiresAt, otpUsed: false, otpPurpose: purpose },
    );
  }

  async activateAccount(id: number): Promise<void> {
    await this.utilisateurRepository.update(
      { id_utilisateur: id },
      {
        statut: StatutUtilisateur.ACTIF,
        otpCode: null,
        otpExpiresAt: null,
        otpUsed: true,
      },
    );
  }

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
        otpUsed: true,
      },
    );
  }
}