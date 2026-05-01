// src/auth/tests/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

const mockAuthService = {
  login:           jest.fn(),
  register:        jest.fn(),
  verifyEmail:     jest.fn(),
  forgotPassword:  jest.fn(),
  resetPassword:   jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  // ── register ──────────────────────────────────────────────────────────────────
  describe('register()', () => {

    it('should call authService.register and return message', async () => {
      mockAuthService.register.mockResolvedValue({
        message: 'Un code de vérification a été envoyé à youssef@cinepass.ma',
        email:   'youssef@cinepass.ma',
      });

      const result = await controller.register({
        nom:        'Alami',
        prenom:     'Youssef',
        email:      'youssef@cinepass.ma',
        motDePasse: 'password123',
      } as any);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('email');
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────────
  describe('login()', () => {

    it('should call authService.login and return token', async () => {
      mockAuthService.login.mockResolvedValue({
        access_token: 'mock.jwt.token',
        user: { id: 1, email: 'youssef@cinepass.ma', role: 'CLIENT' },
      });

      const result = await controller.login({
        email:      'youssef@cinepass.ma',
        motDePasse: 'password123',
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    });
  });

  // ── verifyEmail ───────────────────────────────────────────────────────────────
  describe('verifyEmail()', () => {

    it('should call authService.verifyEmail and return token', async () => {
      mockAuthService.verifyEmail.mockResolvedValue({
        access_token: 'mock.jwt.token',
        user: { id: 1, email: 'youssef@cinepass.ma', role: 'CLIENT' },
      });

      const result = await controller.verifyEmail({
        email: 'youssef@cinepass.ma',
        otp: '483721',
        newPassword: ''
      });

      expect(result).toHaveProperty('access_token');
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(
        'youssef@cinepass.ma', '483721'
      );
    });
  });

  // ── forgotPassword ────────────────────────────────────────────────────────────
  describe('forgotPassword()', () => {

    it('should always return success message regardless of email existence', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      const result = await controller.forgotPassword({
        email: 'anyone@test.com',
      });

      expect(result).toHaveProperty('message');
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('anyone@test.com');
    });
  });

  // ── resetPassword ─────────────────────────────────────────────────────────────
  describe('resetPassword()', () => {

    it('should call authService.resetPassword and return success', async () => {
      mockAuthService.resetPassword.mockResolvedValue(undefined);

      const result = await controller.resetPassword({
        email:       'youssef@cinepass.ma',
        otp:         '291847',
        newPassword: 'newPass456',
      });

      expect(result).toHaveProperty('message');
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        'youssef@cinepass.ma', '291847', 'newPass456'
      );
    });
  });

  // ── me ────────────────────────────────────────────────────────────────────────
  describe('me()', () => {

    it('should return current user from request', async () => {
      const mockUser = {
        id_utilisateur: 1,
        email:          'youssef@cinepass.ma',
        role:           'CLIENT',
        nom:            'Alami',
        prenom:         'Youssef',
      };

      const result = await controller.me(mockUser);

      expect(result).toEqual(mockUser);
    });
  });
});