import { Test, TestingModule } from '@nestjs/testing';
import { TarifController } from './tarif.controller';
import { TarifService } from './tarif.service';

describe('TarifController', () => {
  let controller: TarifController;
  let service: TarifService;

  const mockTarifService = {
    create: jest.fn(),
    findBySeance: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TarifController],
      providers: [
        {
          provide: TarifService,
          useValue: mockTarifService,
        },
      ],
    }).compile();

    controller = module.get<TarifController>(TarifController);
    service = module.get<TarifService>(TarifService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findBySeance', () => {
    it('should return tarifs for a seance', async () => {
      const result = [{ id_tarif: 1, prix: 50 }];
      mockTarifService.findBySeance.mockResolvedValue(result);

      await expect(controller.findBySeance(1)).resolves.toEqual(result);
      expect(service.findBySeance).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should call tarifService.create with correct parameters', async () => {
      const dto = { typePublic: 'NORMAL', prix: 50, id_seance: 1 } as any;
      const result = { id_tarif: 1, ...dto };
      mockTarifService.create.mockResolvedValue(result);

      await expect(controller.create(dto)).resolves.toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should call tarifService.update with correct parameters', async () => {
      const dto = { prix: 45 } as any;
      const result = { id_tarif: 1, prix: 45 };
      mockTarifService.update.mockResolvedValue(result);

      await expect(controller.update(1, dto)).resolves.toEqual(result);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should call tarifService.remove with correct parameters', async () => {
      mockTarifService.remove.mockResolvedValue(undefined);

      await expect(controller.remove(1)).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
