import { Test, TestingModule } from '@nestjs/testing';
import { PaiementController } from '../paiement.controller';
import { PaiementService } from '../paiement.service';

describe('PaiementController', () => {
  let controller: PaiementController;

  const mockPaiementService = {
    initier: jest.fn(),
    getStatus: jest.fn(),
    handleWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaiementController],
      providers: [
        { provide: PaiementService, useValue: mockPaiementService },
      ],
    }).compile();

    controller = module.get<PaiementController>(PaiementController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should initier paiement for current user', async () => {
    const dto = { id_reservation: 5 } as any;
    const user = { id_utilisateur: 7 } as any;
    const result = { id_paiement: 10, statut: 'EN_ATTENTE' } as any;
    mockPaiementService.initier.mockResolvedValue(result);

    await expect(controller.initier(dto, user)).resolves.toEqual(result);
    expect(mockPaiementService.initier).toHaveBeenCalledWith(dto, 7);
  });

  it('should return paiement status for current user', async () => {
    const user = { id_utilisateur: 7 } as any;
    const result = { id_paiement: 10, statut: 'ACCEPTE' } as any;
    mockPaiementService.getStatus.mockResolvedValue(result);

    await expect(controller.getStatus(5, user)).resolves.toEqual(result);
    expect(mockPaiementService.getStatus).toHaveBeenCalledWith(5, 7);
  });

  it('should handle webhook and return received true', async () => {
    const rawBody = Buffer.from('{"type":"checkout.session.completed"}');
    const signature = 'sig_test';
    const req = { rawBody } as any;

    mockPaiementService.handleWebhook.mockResolvedValue(undefined);

    await expect(controller.webhook(req, signature)).resolves.toEqual({
      received: true,
    });

    expect(mockPaiementService.handleWebhook).toHaveBeenCalledWith(
      rawBody,
      signature,
    );
  });
});
