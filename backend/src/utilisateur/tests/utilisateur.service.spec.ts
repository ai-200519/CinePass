// src/utilisateur/tests/utilisateur.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UtilisateurService } from '../utilisateur.service';
import { Utilisateur } from '../entities/utilisateur.entity';
import { Role } from '../../common/enums/role.enum';
import { StatutUtilisateur } from '../../common/enums/statut-utilisateur.enum';
import * as bcrypt from 'bcrypt';

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockUtilisateur: Partial<Utilisateur> = {
  id_utilisateur: 1,
  nom: 'Alami',
  prenom: 'Youssef',
  email: 'youssef@cinepass.ma',
  motDePasse: '$2b$10$hashedpassword',
  role: Role.CLIENT,
  statut: StatutUtilisateur.ACTIF,
  langue: 'FR',
  otpCode: null,
  otpExpiresAt: null,
  otpUsed: false,
};

// ── Mock repository ───────────────────────────────────────────────────────────
const createQueryBuilderMock = () => {
  const qb: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  return qb;
};

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
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
    repo = module.get<Repository<Utilisateur>>(getRepositoryToken(Utilisateur));

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
        relations: ['cinema'],
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
        relations: ['cinema'],
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
      nom: 'Alami',
      prenom: 'Youssef',
      email: 'youssef@cinepass.ma',
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

      await expect(service.create(registerDto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should hash the password before saving', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockImplementation((data) => data);
      mockRepository.save.mockImplementation((data) => Promise.resolve(data));

      await service.create(registerDto as any);

      const savedUser = mockRepository.save.mock.calls[0][0];
      const isHashed = await bcrypt.compare(
        'password123',
        savedUser.motDePasse,
      );
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
          otpCode: '483721',
          otpExpiresAt: expiresAt,
          otpUsed: false,
          otpPurpose: 'register',
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
          statut: StatutUtilisateur.ACTIF,
          otpCode: null,
          otpExpiresAt: null,
          otpUsed: true,
        }),
      );
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return safe users list', async () => {
      const qb = createQueryBuilderMock();
      const user = { ...mockUtilisateur } as any;
      qb.getMany.mockResolvedValue([user]);
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('motDePasse');
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('u.cinema', 'c');
      expect(qb.orderBy).toHaveBeenCalledWith('u.dateInscription', 'DESC');
    });

    it('should apply filters when provided', async () => {
      const qb = createQueryBuilderMock();
      qb.getMany.mockResolvedValue([]);
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({
        search: 'ali',
        role: Role.CLIENT,
        statut: StatutUtilisateur.ACTIF,
      } as any);

      expect(qb.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return a safe user', async () => {
      mockRepository.findOne.mockResolvedValue(mockUtilisateur);

      const result = await service.findOne(1);

      expect(result).not.toHaveProperty('motDePasse');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id_utilisateur: 1 },
        relations: ['cinema'],
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── update ───────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update a user and return safe entity', async () => {
      const user = { ...mockUtilisateur } as any;
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue(user);

      const result = await service.update(1, { nom: 'Updated' } as any);

      expect(result).not.toHaveProperty('motDePasse');
      expect(mockRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { nom: 'Updated' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email already used', async () => {
      const user = { ...mockUtilisateur } as any;
      mockRepository.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce({
          ...mockUtilisateur,
          email: 'taken@test.com',
        } as any);

      await expect(
        service.update(1, { email: 'taken@test.com' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── updateProfil ─────────────────────────────────────────────────────────
  describe('updateProfil()', () => {
    it('should update safe profile fields', async () => {
      const user = { ...mockUtilisateur } as any;
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue(user);

      const result = await service.updateProfil(1, {
        nom: 'Updated',
        prenom: 'Test',
        telephone: '+2126000000',
        langue: 'EN',
      } as any);

      expect(result).not.toHaveProperty('motDePasse');
      expect(mockRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfil(999, { nom: 'Updated' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── role/status helpers ──────────────────────────────────────────────────
  describe('role/status helpers', () => {
    it('should call update for activerCompte', async () => {
      jest
        .spyOn(service, 'update')
        .mockResolvedValue({ id_utilisateur: 1 } as any);

      await service.activerCompte(1);

      expect(service.update).toHaveBeenCalledWith(1, {
        statut: StatutUtilisateur.ACTIF,
      });
    });

    it('should call update for suspendreCompte', async () => {
      jest
        .spyOn(service, 'update')
        .mockResolvedValue({ id_utilisateur: 1 } as any);

      await service.suspendreCompte(1);

      expect(service.update).toHaveBeenCalledWith(1, {
        statut: StatutUtilisateur.BANNI,
      });
    });

    it('should call update for changerRole', async () => {
      jest
        .spyOn(service, 'update')
        .mockResolvedValue({ id_utilisateur: 1 } as any);

      await service.changerRole(1, Role.ADMIN);

      expect(service.update).toHaveBeenCalledWith(1, { role: Role.ADMIN });
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete a user', async () => {
      mockRepository.findOne.mockResolvedValue(mockUtilisateur);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(1)).resolves.toEqual({
        message: 'Utilisateur #1 supprimé avec succès',
      });
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── password helpers ─────────────────────────────────────────────────────
  describe('password helpers', () => {
    it('should reset password and clear OTP', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.resetPasswordAndClearOtp(1, 'hashed');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id_utilisateur: 1 },
        {
          motDePasse: 'hashed',
          otpCode: null,
          otpExpiresAt: null,
          otpUsed: true,
        },
      );
    });

    it('should update password', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updatePassword(1, 'hashed');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id_utilisateur: 1 },
        { motDePasse: 'hashed' },
      );
    });
  });

  // ── changePassword ──────────────────────────────────────────────────────
  describe('changePassword()', () => {
    it('should change password when current password is valid', async () => {
      const user = { ...mockUtilisateur } as any;
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed');

      const result = await service.changePassword(1, 'old', 'new');

      expect(result).toHaveProperty('message');
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id_utilisateur: 1 },
        { motDePasse: 'hashed' },
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.changePassword(1, 'old', 'new')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when current password is wrong', async () => {
      const user = { ...mockUtilisateur } as any;
      mockRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(service.changePassword(1, 'old', 'new')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
