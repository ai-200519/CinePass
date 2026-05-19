import { Test, TestingModule } from '@nestjs/testing';
import { CategorieSiege } from '../common/enums/categorie-siege.enum';
import { StatutSiege } from '../common/enums/statut-siege.enum';
import { CreateSiegeDto } from './dto/create-siege.dto';
import { UpdateSiegeDto } from './dto/update-siege.dto';
import { SiegeController } from './siege.controller';
import { SiegeService } from './siege.service';

describe('SiegeController', () => {
  let controller: SiegeController;
  let service: SiegeService;

  const mockSiegeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiegeController],
      providers: [
        {
          provide: SiegeService,
          useValue: mockSiegeService,
        },
      ],
    }).compile();

    controller = module.get<SiegeController>(SiegeController);
    service = module.get<SiegeService>(SiegeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call siegeService.create with correct parameters', async () => {
      const createSiegeDto: CreateSiegeDto = {
        rangee: 'A',
        numero: 1,
        categorie: CategorieSiege.STANDARD,
        statut: StatutSiege.DISPONIBLE,
        id_salle: 1,
      };
      const result = { id_siege: 1, ...createSiegeDto };
      mockSiegeService.create.mockResolvedValue(result);

      expect(await controller.create(createSiegeDto)).toEqual(result);
      expect(mockSiegeService.create).toHaveBeenCalledWith(createSiegeDto);
    });
  });

  describe('findAll', () => {
    it('should call siegeService.findAll and return an array of sieges', async () => {
      const result = [{ id_siege: 1, rangee: 'A', numero: 1 }];
      mockSiegeService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(mockSiegeService.findAll).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('findOne', () => {
    it('should call siegeService.findOne with correct parameters', async () => {
      const id = '1';
      const result = { id_siege: 1, rangee: 'A', numero: 1 };
      mockSiegeService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(id)).toEqual(result);
      expect(mockSiegeService.findOne).toHaveBeenCalledWith(+id);
    });
  });

  describe('update', () => {
    it('should call siegeService.update with correct parameters', async () => {
      const id = '1';
      const updateSiegeDto: UpdateSiegeDto = { numero: 2 };
      const result = { affected: 1 };
      mockSiegeService.update.mockResolvedValue(result);

      expect(await controller.update(id, updateSiegeDto)).toEqual(result);
      expect(mockSiegeService.update).toHaveBeenCalledWith(+id, updateSiegeDto);
    });
  });

  describe('remove', () => {
    it('should call siegeService.remove with correct parameters', async () => {
      const id = '1';
      const result = { affected: 1 };
      mockSiegeService.remove.mockResolvedValue(result);

      expect(await controller.remove(id)).toEqual(result);
      expect(mockSiegeService.remove).toHaveBeenCalledWith(+id);
    });
  });
});
