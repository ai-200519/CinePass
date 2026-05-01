// src/utilisateur/tests/utilisateur.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UtilisateurService } from '../utilisateur.service';
import { Utilisateur } from '../entities/utilisateur.entity';
import { Role } from '../../common/enums/role.enum';
import { StatutUtilisateur } from '../../common/enums/statut-utilisateur.enum';
import * as bcrypt from 'bcrypt';

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockUtilisateur: Partial<Utilisateur> = {
  id_utilisateur: 1,
  nom:            'Alami',
  prenom:         'Youssef',
  email:          'youssef@cinepass.ma',
  motDePasse:     '$2b$10$hashedpassword',
  role:           Role.CLIENT,
  statut:         StatutUtilisateur.ACTIF,
  langue:         'FR',
  otpCode:        null,
  otpExpiresAt:   null,
  otpUsed:        false,
};

// ── Mock repository ───────────────────────────────────────────────────────────
const mockRepository = {
  findOne: jest.fn(),
  create:  jest.fn(),
  save:    jest.fn(),
  update:  jest.fn(),
};

describe('UtilisateurService', () => {
  let service: UtilisateurService;
  let repo: Repository<Utilisateur>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UtilisateurService,
        {
          provide: getRepositoryToken(Utilisateur),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UtilisateurService>(UtilisateurService);
    repo    = module.get<Repository<Utilisateur>>(getRepositoryToken(Utilisateur));

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  // ── findByEmail ─────────────────────────────────────────────────────────────
  describe('findByEmail()', () => {

    it('should return user when email exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUtilisateur);

      const result = await service.findByEmail('youssef@cinepass.ma');

      expect(result).toEqual(mockUtilisateur);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'youssef@cinepass.ma' },
      });
    });

    it('should return null when email does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@test.com');

      expect(result).toBeNull();
    });
  });

  // ── findById ────────────────────────────────────────────────────────────────
  describe('findById()', () => {

    it('should return user when ID exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUtilisateur);

      const result = await service.findById(1);

      expect(result).toEqual(mockUtilisateur);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id_utilisateur: 1 },
      });
    });

    it('should return null when ID does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  // ── create ──────────────────────────────────────────────────────────────────
  describe('create()', () => {

    const registerDto = {
      nom:        'Alami',
      prenom:     'Youssef',
      email:      'youssef@cinepass.ma',
      motDePasse: 'password123',
    };

    it('should create user successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null); // email not taken
      mockRepository.create.mockReturnValue(mockUtilisateur);
      mockRepository.save.mockResolvedValue(mockUtilisateur);

      const result = await service.create(registerDto as any);

      expect(result).toEqual(mockUtilisateur);
      expect(result.role).toBe(Role.CLIENT);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUtilisateur);

      await expect(service.create(registerDto as any))
        .rejects.toThrow(ConflictException);
    });

    it('should hash the password before saving', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockImplementation((data) => data);
      mockRepository.save.mockImplementation((data) => Promise.resolve(data));

      await service.create(registerDto as any);

      const savedUser = mockRepository.save.mock.calls[0][0];
      const isHashed = await bcrypt.compare('password123', savedUser.motDePasse);
      expect(isHashed).toBe(true);
    });
  });

  // ── saveOtp ─────────────────────────────────────────────────────────────────
  describe('saveOtp()', () => {

    it('should save OTP to utilisateur', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const expiresAt = new Date();
      await service.saveOtp(1, '483721', expiresAt, 'register');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id_utilisateur: 1 },
        {
          otpCode:      '483721',
          otpExpiresAt: expiresAt,
          otpUsed:      false,
          otpPurpose:   'register',
        },
      );
    });
  });

  // ── activateAccount ──────────────────────────────────────────────────────────
  describe('activateAccount()', () => {

    it('should activate account and clear OTP', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.activateAccount(1);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id_utilisateur: 1 },
        expect.objectContaining({
          statut:      StatutUtilisateur.ACTIF,
          otpCode:     null,
          otpExpiresAt: null,
          otpUsed:     true,
        }),
      );
    });
  });
});