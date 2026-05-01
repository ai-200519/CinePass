import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Utilisateur } from '../src/utilisateur/entities/utilisateur.entity';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let utilisateurRepo: any;

  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();

    utilisateurRepo = moduleFixture.get(getRepositoryToken(Utilisateur));
  });

  afterAll(async () => {
    // Clean up test data
    if (utilisateurRepo) {
      await utilisateurRepo.delete({ email: 'e2etest@cinepass.ma' });
    }
    if (app) {
      await app.close();
    }
  });

  // ── POST /api/auth/register ───────────────────────────────────────────────
  describe('POST /api/auth/register', () => {

    it('should create account and return message + email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          nom:        'E2E',
          prenom:     'Test',
          email:      'e2etest@cinepass.ma',
          motDePasse: 'password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('email', 'e2etest@cinepass.ma');
      expect(response.body).not.toHaveProperty('access_token');
    });

    it('should return 409 when email already exists', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          nom:        'E2E',
          prenom:     'Test',
          email:      'e2etest@cinepass.ma',
          motDePasse: 'password123',
        })
        .expect(409);
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'incomplete@test.com' })
        .expect(400);
    });

    it('should return 400 when password is too short', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          nom:        'Test',
          prenom:     'User',
          email:      'short@test.com',
          motDePasse: '123',   // too short
        })
        .expect(400);
    });

    it('should return 400 when email format is invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          nom:        'Test',
          prenom:     'User',
          email:      'not-an-email',
          motDePasse: 'password123',
        })
        .expect(400);
    });
  });

  // ── POST /api/auth/login ──────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {

    it('should return 401 when account is PENDING (email not verified)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email:      'e2etest@cinepass.ma',
          motDePasse: 'password123',
        })
        .expect(401);
    });

    it('should return 401 when credentials are wrong', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email:      'e2etest@cinepass.ma',
          motDePasse: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 400 when body is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });
  });

  // ── GET /api/auth/me ──────────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });

  // ── POST /api/auth/forgot-password ───────────────────────────────────────
  describe('POST /api/auth/forgot-password', () => {

    it('should always return 200 regardless of email existence', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@test.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when email format is invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });

  // ── POST /api/auth/reset-password ────────────────────────────────────────
  describe('POST /api/auth/reset-password', () => {

    it('should return 400 with invalid OTP', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          email:       'e2etest@cinepass.ma',
          otp:         '000000',
          newPassword: 'newPass456',
        })
        .expect(400);
    });

    it('should return 400 when OTP length is wrong', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          email:       'e2etest@cinepass.ma',
          otp:         '123',   // wrong length
          newPassword: 'newPass456',
        })
        .expect(400);
    });
  });
});