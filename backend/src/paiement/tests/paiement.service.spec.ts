import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PaiementService } from '../paiement.service';
import { Paiement } from '../entities/paiement.entity';
import { Reservation } from '../../reservation/entities/reservation.entity';
import { StripeGateway } from '../gateways/stripe.gateway';
import { ReservationService } from '../../reservation/reservation.service';
import { StatutPaiement } from '../../common/enums/statut-paiement.enum';
import { StatutReservation } from '../../common/enums/statut-reservation.enum';
import { MethodePaiement } from '../../common/enums/methode-paiement.enum';

describe('PaiementService', () => {
  let service: PaiementService;

  const mockPaiementRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockReservationRepo = {
    findOne: jest.fn(),
  };

  const mockStripeGateway = {
    createCheckoutSession: jest.fn(),
    verifyWebhook: jest.fn(),
  };

  const mockReservationService = {
    confirmerPaiement: jest.fn(),
  };

  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaiementService,
        { provide: getRepositoryToken(Paiement), useValue: mockPaiementRepo },
        { provide: getRepositoryToken(Reservation), useValue: mockReservationRepo },
        { provide: StripeGateway, useValue: mockStripeGateway },
        { provide: ReservationService, useValue: mockReservationService },
      ],
    }).compile();

    service = module.get<PaiementService>(PaiementService);
    jest.clearAllMocks();
    process.env.NODE_ENV = originalNodeEnv;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('initier', () => {
    it('should throw when reservation not found', async () => {
      mockReservationRepo.findOne.mockResolvedValue(null);

      await expect(
        service.initier({ id_reservation: 1 } as any, 7),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when reservation belongs to another user', async () => {
      mockReservationRepo.findOne.mockResolvedValue({
        id_reservation: 1,
        utilisateur: { id_utilisateur: 9 },
        statut: StatutReservation.EN_COURS,
      } as any);

      await expect(
        service.initier({ id_reservation: 1 } as any, 7),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw when reservation is already paid', async () => {
      mockReservationRepo.findOne.mockResolvedValue({
        id_reservation: 1,
        utilisateur: { id_utilisateur: 7 },
        statut: StatutReservation.PAYEE,
      } as any);

      await expect(
        service.initier({ id_reservation: 1 } as any, 7),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reuse existing paiement session when EN_ATTENTE', async () => {
      mockReservationRepo.findOne.mockResolvedValue({
        id_reservation: 1,
        reference: 'CP-1',
        utilisateur: { id_utilisateur: 7 },
        statut: StatutReservation.EN_COURS,
        paiement: {
          id_paiement: 11,
          referenceTransaction: 'cs_test_123',
          montantTotal: 120,
          devise: 'MAD',
          statut: StatutPaiement.EN_ATTENTE,
        },
      } as any);

      const result = await service.initier({ id_reservation: 1 } as any, 7);

      expect(result).toEqual({
        id_paiement: 11,
        stripeSessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
        montantTotal: 120,
        devise: 'MAD',
        statut: StatutPaiement.EN_ATTENTE,
        message: 'Session de paiement existante',
      });
    });

    it('should create paiement and return session data', async () => {
      mockReservationRepo.findOne.mockResolvedValue({
        id_reservation: 1,
        reference: 'CP-1',
        utilisateur: { id_utilisateur: 7 },
        statut: StatutReservation.EN_COURS,
        reservationSieges: [
          { prixUnitaire: 50 },
          { prixUnitaire: 70 },
        ],
        seance: { film: { title: 'Film A' } },
      } as any);

      mockPaiementRepo.create.mockReturnValue({
        montantTotal: 120,
        devise: 'MAD',
        methode: MethodePaiement.STRIPE,
        statut: StatutPaiement.EN_ATTENTE,
      } as any);

      mockPaiementRepo.save.mockResolvedValue({ id_paiement: 99 } as any);

      mockStripeGateway.createCheckoutSession.mockResolvedValue({
        sessionId: 'cs_test_999',
        url: 'https://checkout.stripe.com/pay/cs_test_999',
      } as any);

      const result = await service.initier({ id_reservation: 1 } as any, 7);

      expect(mockPaiementRepo.save).toHaveBeenCalled();
      expect(mockStripeGateway.createCheckoutSession).toHaveBeenCalledWith(
        120,
        'mad',
        'CP-1',
        99,
        'Film A',
      );
      expect(mockPaiementRepo.update).toHaveBeenCalledWith(
        { id_paiement: 99 },
        { referenceTransaction: 'cs_test_999' },
      );
      expect(result).toMatchObject({
        id_paiement: 99,
        stripeSessionId: 'cs_test_999',
        montantTotal: 120,
        devise: 'MAD',
        statut: StatutPaiement.EN_ATTENTE,
      });
    });
  });

  describe('handleWebhook', () => {
    it('should throw on invalid payload in development mode', async () => {
      process.env.NODE_ENV = 'development';

      await expect(
        service.handleWebhook(Buffer.from('not-json'), 'sig'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should confirm paiement on checkout.session.completed', async () => {
      process.env.NODE_ENV = 'development';

      mockPaiementRepo.findOne.mockResolvedValue({
        id_paiement: 10,
        reservation: { id_reservation: 5 },
      } as any);

      const payload = Buffer.from(
        JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              metadata: { id_paiement: '10', reference: 'CP-1' },
              payment_intent: 'pi_123',
              id: 'cs_123',
            },
          },
        }),
      );

      await service.handleWebhook(payload, 'sig');

      expect(mockPaiementRepo.update).toHaveBeenCalledWith(
        { id_paiement: 10 },
        expect.objectContaining({
          statut: StatutPaiement.ACCEPTE,
          referenceTransaction: 'pi_123',
        }),
      );
      expect(mockReservationService.confirmerPaiement).toHaveBeenCalledWith(
        5,
        'pi_123',
      );
    });

    it('should mark paiement as REFUSE on payment failure', async () => {
      process.env.NODE_ENV = 'development';

      const payload = Buffer.from(
        JSON.stringify({
          type: 'payment_intent.payment_failed',
          data: { object: { metadata: { id_paiement: '7' } } },
        }),
      );

      await service.handleWebhook(payload, 'sig');

      expect(mockPaiementRepo.update).toHaveBeenCalledWith(
        { id_paiement: 7 },
        { statut: StatutPaiement.REFUSE },
      );
    });
  });

  describe('getStatus', () => {
    it('should throw when paiement not found', async () => {
      mockPaiementRepo.findOne.mockResolvedValue(null);

      await expect(service.getStatus(1, 7)).rejects.toThrow(NotFoundException);
    });

    it('should throw when paiement belongs to another user', async () => {
      mockPaiementRepo.findOne.mockResolvedValue({
        reservation: { utilisateur: { id_utilisateur: 9 } },
      } as any);

      await expect(service.getStatus(1, 7)).rejects.toThrow(ForbiddenException);
    });

    it('should return paiement status for user', async () => {
      mockPaiementRepo.findOne.mockResolvedValue({
        id_paiement: 10,
        statut: StatutPaiement.ACCEPTE,
        montantTotal: 120,
        devise: 'MAD',
        methode: MethodePaiement.STRIPE,
        referenceTransaction: 'pi_123',
        datePaiement: new Date('2026-05-01T10:00:00.000Z'),
        reservation: { utilisateur: { id_utilisateur: 7 } },
      } as any);

      const result = await service.getStatus(1, 7);

      expect(result).toEqual(
        expect.objectContaining({
          id_paiement: 10,
          statut: StatutPaiement.ACCEPTE,
          montantTotal: 120,
          devise: 'MAD',
          methode: MethodePaiement.STRIPE,
          referenceTransaction: 'pi_123',
        }),
      );
    });
  });
});
