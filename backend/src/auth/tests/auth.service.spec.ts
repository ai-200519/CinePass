// src/auth/tests/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UtilisateurService } from '../../utilisateur/utilisateur.service';
import { EmailProvider } from '../../common/providers/email.provider';
import { Role } from '../../common/enums/role.enum';
import { StatutUtilisateur } from '../../common/enums/statut-utilisateur.enum';
import * as bcrypt from 'bcrypt';

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockUser = {
  id_utilisateur: 1,
  nom:            'Alami',
  prenom:         'Youssef',
  email:          'youssef@cinepass.ma',
  motDePasse:     '',   // set in beforeAll
  role:           Role.CLIENT,
  statut:         StatutUtilisateur.ACTIF,
  otpCode:        null,
  otpExpiresAt:   null,
  otpUsed:        false,
  otpPurpose:     null,
};

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockUtilisateurService = {
  findByEmail:              jest.fn(),
  findById:                 jest.fn(),
  create:                   jest.fn(),
  saveOtp:                  jest.fn(),
  activateAccount:          jest.fn(),
  resetPasswordAndClearOtp: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

const mockEmailProvider = {
  sendOtp: jest.fn().mockResolvedValue(undefined),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeAll(async () => {
    mockUser.motDePasse = await bcrypt.hash('password123', 10);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UtilisateurService, useValue: mockUtilisateurService },
        { provide: JwtService,         useValue: mockJwtService },
        { provide: EmailProvider,      useValue: mockEmailProvider },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── validateUser ─────────────────────────────────────────────────────────────
  describe('validateUser()', () => {

    it('should return user when credentials are valid', async () => {
      mockUtilisateurService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        'youssef@cinepass.ma', 'password123'
      );

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUtilisateurService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('unknown@test.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is wrong', async () => {
      mockUtilisateurService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        'youssef@cinepass.ma', 'wrongpassword'
      );

      expect(result).toBeNull();
    });
  });

  // ── login ────────────────────────────────────────────────────────────────────
  describe('login()', () => {

    it('should return access_token and user on success', async () => {
      mockUtilisateurService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'youssef@cinepass.ma',
        motDePasse: 'password123',
      });

      expect(result).toHaveProperty('access_token', 'mock.jwt.token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('youssef@cinepass.ma');
      expect(result.user.role).toBe(Role.CLIENT);
    });

    it('should throw UnauthorizedException when credentials are wrong', async () => {
      mockUtilisateurService.findByEmail.mockResolvedValue(null);

      await expect(service.login({
        email: 'wrong@test.com',
        motDePasse: 'wrong',
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when account is PENDING', async () => {
      mockUtilisateurService.findByEmail.mockResolvedValue({
        ...mockUser,
        statut: StatutUtilisateur.PENDING,
      });

      await expect(service.login({
        email: 'youssef@cinepass.ma',
        motDePasse: 'password123',
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when account is BANNI', async () => {
      mockUtilisateurService.findByEmail.mockResolvedValue({
        ...mockUser,
        statut: StatutUtilisateur.BANNI,
      });

      await expect(service.login({
        email: 'youssef@cinepass.ma',
        motDePasse: 'password123',
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should not expose password in response', async () => {
      mockUtilisateurService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'youssef@cinepass.ma',
        motDePasse: 'password123',
      });

      expect(result.user).not.toHaveProperty('motDePasse');
    });
  });

  // ── register ─────────────────────────────────────────────────────────────────
  describe('register()', () => {

    const registerDto = {
      nom:        'Alami',
      prenom:     'Youssef',
      email:      'youssef@cinepass.ma',
      motDePasse: 'password123',
    };

    it('should create user and send OTP email', async () => {
      mockUtilisateurService.create.mockResolvedValue(mockUser);
      mockUtilisateurService.saveOtp.mockResolvedValue(undefined);

      const result = await service.register(registerDto as any);

      expect(result).toHaveProperty('message');
      expect(result.email).toBe('youssef@cinepass.ma');
      expect(mockEmailProvider.sendOtp).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringMatching(/^\d{6}$/),   // 6-digit OTP
        expect.any(Date),
        'register',
      );
    });

    it('should NOT return JWT token before email verification', async () => {
      mockUtilisateurService.create.mockResolvedValue(mockUser);
      mockUtilisateurService.saveOtp.mockResolvedValue(undefined);

      const result = await service.register(registerDto as any);

      expect(result).not.toHaveProperty('access_token');
    });
  });

  // ── verifyEmail ───────────────────────────────────────────────────────────────
  describe('verifyEmail()', () => {

    it('should activate account and return JWT on valid OTP', async () => {
      const userWithOtp = {
        ...mockUser,
        statut:      StatutUtilisateur.PENDING,
        otpCode:     '483721',
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min from now
        otpUsed:     false,
        otpPurpose:  'register',
      };
      mockUtilisateurService.findByEmail.mockResolvedValue(userWithOtp);
      mockUtilisateurService.activateAccount.mockResolvedValue(undefined);

      const result = await service.verifyEmail(
        'youssef@cinepass.ma', '483721'
      );

      expect(result).toHaveProperty('access_token', 'mock.jwt.token');
      expect(mockUtilisateurService.activateAccount).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when OTP is wrong', async () => {
      const userWithOtp = {
        ...mockUser,
        otpCode:     '483721',
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        otpUsed:     false,
        otpPurpose:  'register',
      };
      mockUtilisateurService.findByEmail.mockResolvedValue(userWithOtp);

      await expect(service.verifyEmail('youssef@cinepass.ma', '000000'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when OTP is expired', async () => {
      const userWithExpiredOtp = {
        ...mockUser,
        otpCode:     '483721',
        otpExpiresAt: new Date(Date.now() - 1000), // expired 1 second ago
        otpUsed:     false,
        otpPurpose:  'register',
      };
      mockUtilisateurService.findByEmail.mockResolvedValue(userWithExpiredOtp);

      await expect(service.verifyEmail('youssef@cinepass.ma', '483721'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when OTP already used', async () => {
      const userWithUsedOtp = {
        ...mockUser,
        otpCode:     '483721',
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        otpUsed:     true,   // already used
        otpPurpose:  'register',
      };
      mockUtilisateurService.findByEmail.mockResolvedValue(userWithUsedOtp);

      await expect(service.verifyEmail('youssef@cinepass.ma', '483721'))
        .rejects.toThrow(BadRequestException);
    });
  });

  // ── forgotPassword ────────────────────────────────────────────────────────────
  describe('forgotPassword()', () => {

    it('should send OTP when email exists', async () => {
      mockUtilisateurService.findByEmail.mockResolvedValue(mockUser);
      mockUtilisateurService.saveOtp.mockResolvedValue(undefined);

      await service.forgotPassword('youssef@cinepass.ma');

      expect(mockEmailProvider.sendOtp).toHaveBeenCalledWith(
        'youssef@cinepass.ma',
        expect.any(String),
        expect.stringMatching(/^\d{6}$/),
        expect.any(Date),
        'reset_password',
      );
    });

    it('should return silently when email does not exist (security)', async () => {
      mockUtilisateurService.findByEmail.mockResolvedValue(null);

      // Should NOT throw — prevents email enumeration
      await expect(service.forgotPassword('unknown@test.com'))
        .resolves.toBeUndefined();

      expect(mockEmailProvider.sendOtp).not.toHaveBeenCalled();
    });
  });

  // ── resetPassword ─────────────────────────────────────────────────────────────
  describe('resetPassword()', () => {

    it('should reset password when OTP is valid', async () => {
      const userWithOtp = {
        ...mockUser,
        otpCode:     '291847',
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        otpUsed:     false,
        otpPurpose:  'reset_password',
      };
      mockUtilisateurService.findByEmail.mockResolvedValue(userWithOtp);
      mockUtilisateurService.resetPasswordAndClearOtp.mockResolvedValue(undefined);

      await service.resetPassword(
        'youssef@cinepass.ma', '291847', 'newPassword456'
      );

      expect(mockUtilisateurService.resetPasswordAndClearOtp)
        .toHaveBeenCalledWith(1, expect.any(String));

      // Verify new password is hashed
      const hashedArg = mockUtilisateurService.resetPasswordAndClearOtp.mock.calls[0][1];
      const isHashed = await bcrypt.compare('newPassword456', hashedArg);
      expect(isHashed).toBe(true);
    });
  });
});