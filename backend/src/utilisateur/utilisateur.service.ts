import {
  Injectable, ConflictException,
  NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindManyOptions } from 'typeorm';
import { Utilisateur }         from './entities/utilisateur.entity';
import { Role }                from '../common/enums/role.enum';
import { StatutUtilisateur }   from '../common/enums/statut-utilisateur.enum';
import { RegisterDto }         from '../auth/dto/register.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { FilterUtilisateurDto } from './dto/filter-utilisateur.dto';
import * as bcrypt from 'bcrypt';
import { UpdateProfilDto } from './dto/update-profile.dto';

@Injectable()
export class UtilisateurService {

  constructor(
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepository: Repository<Utilisateur>,
  ) {}

  // ── Find by email ─────────────────────────────────────────────────────────
  async findByEmail(email: string): Promise<Utilisateur | null> {
    return this.utilisateurRepository.findOne({
      where:     { email },
      relations: ['cinema'],
    });
  }

  // ── Find by ID ────────────────────────────────────────────────────────────
  async findById(id: number): Promise<Utilisateur | null> {
    return this.utilisateurRepository.findOne({
      where:     { id_utilisateur: id },
      relations: ['cinema'],
    });
  }

  // ── Safe user — removes sensitive fields ──────────────────────────────────
  private toSafe(user: Utilisateur) {
    const { motDePasse, otpCode, otpExpiresAt, otpUsed, otpPurpose, ...safe } = user;
    return safe;
  }

  // ── Find all — with filters ───────────────────────────────────────────────
  async findAll(filter?: FilterUtilisateurDto): Promise<any[]> {

    const qb = this.utilisateurRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.cinema', 'c')
      .orderBy('u.dateInscription', 'DESC');

    // Search by nom, prenom or email
    if (filter?.search) {
      qb.andWhere(
        '(u.nom ILIKE :s OR u.prenom ILIKE :s OR u.email ILIKE :s)',
        { s: `%${filter.search}%` }
      );
    }

    if (filter?.role) {
      qb.andWhere('u.role = :role', { role: filter.role });
    }

    if (filter?.statut) {
      qb.andWhere('u.statut = :statut', { statut: filter.statut });
    }

    const users = await qb.getMany();
    return users.map(u => this.toSafe(u));
  }

  // ── Find one by ID ────────────────────────────────────────────────────────
  async findOne(id: number): Promise<any> {
    const user = await this.utilisateurRepository.findOne({
      where:     { id_utilisateur: id },
      relations: ['cinema'],
    });
    if (!user) throw new NotFoundException(`Utilisateur #${id} introuvable`);
    return this.toSafe(user);
  }

  // ── Create new client ─────────────────────────────────────────────────────
  async create(registerDto: RegisterDto): Promise<Utilisateur> {
    const existing = await this.findByEmail(registerDto.email);
    if (existing) throw new ConflictException('Cet email est déjà utilisé');

    const hashedPassword = await bcrypt.hash(registerDto.motDePasse, 10);
    const utilisateur = this.utilisateurRepository.create({
      nom:        registerDto.nom,
      prenom:     registerDto.prenom,
      email:      registerDto.email,
      motDePasse: hashedPassword,
      telephone:  registerDto.telephone,
      langue:     registerDto.langue || 'FR',
      role:       Role.CLIENT,
    });

    return this.utilisateurRepository.save(utilisateur);
  }

  // ── Update by admin ───────────────────────────────────────────────────────
  async update(id: number, dto: UpdateUtilisateurDto): Promise<any> {
    const user = await this.utilisateurRepository.findOne({
      where: { id_utilisateur: id },
    });
    if (!user) throw new NotFoundException(`Utilisateur #${id} introuvable`);

    if (dto.email && dto.email !== user.email) {
      const emailTaken = await this.findByEmail(dto.email);
      if (emailTaken) throw new ConflictException('Cet email est déjà utilisé');
    }

    Object.assign(user, dto);
    await this.utilisateurRepository.save(user);
    return this.findOne(id);
  }

  // ── Update own profile — CLIENT ───────────────────────────────────────────
  async updateProfil(id: number, dto: UpdateProfilDto): Promise<any> {
    const user = await this.utilisateurRepository.findOne({
      where: { id_utilisateur: id },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Only allow safe profile fields
    if (dto.nom)       user.nom       = dto.nom;
    if (dto.prenom)    user.prenom    = dto.prenom;
    if (dto.telephone) user.telephone = dto.telephone;
    if (dto.langue)    user.langue    = dto.langue;

    await this.utilisateurRepository.save(user);
    return this.toSafe(user);
  }

  // ── Activate account — ADMIN ──────────────────────────────────────────────
  async activerCompte(id: number): Promise<any> {
    return this.update(id, { statut: StatutUtilisateur.ACTIF });
  }

  // ── Ban account — ADMIN ───────────────────────────────────────────────────
  async suspendreCompte(id: number): Promise<any> {
    return this.update(id, { statut: StatutUtilisateur.BANNI });
  }

  // ── Change role — ADMIN ───────────────────────────────────────────────────
  async changerRole(id: number, role: Role): Promise<any> {
    return this.update(id, { role });
  }

  // ── Delete — ADMIN ────────────────────────────────────────────────────────
  async remove(id: number): Promise<{ message: string }> {
    const user = await this.utilisateurRepository.findOne({
      where: { id_utilisateur: id },
    });
    if (!user) throw new NotFoundException(`Utilisateur #${id} introuvable`);
    await this.utilisateurRepository.delete(id);
    return { message: `Utilisateur #${id} supprimé avec succès` };
  }

  // ── OTP helpers ───────────────────────────────────────────────────────────
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
        statut:      StatutUtilisateur.ACTIF,
        otpCode:     null,
        otpExpiresAt: null,
        otpUsed:     true,
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
        motDePasse:   hashedPassword,
        otpCode:      null,
        otpExpiresAt: null,
        otpUsed:      true,
      },
    );
  }

  // ── Update password — used by auth reset flow ─────────────────────────────
  async updatePassword(id: number, hashedPassword: string): Promise<void> {
    await this.utilisateurRepository.update(
      { id_utilisateur: id },
      { motDePasse: hashedPassword },
    );
  }
}