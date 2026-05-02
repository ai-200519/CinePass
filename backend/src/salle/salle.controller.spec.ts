import { Test, TestingModule } from '@nestjs/testing';
import { SalleController } from './salle.controller';
import { SalleService } from './salle.service';
import { CreateSalleDto } from './dto/create-salle.dto';
import { UpdateSalleDto } from './dto/update-salle.dto';

describe('SalleController', () => {
  let controller: SalleController;
  let service: SalleService;

  const mockSalleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalleController],
      providers: [
        {
          provide: SalleService,
          useValue: mockSalleService,
        },
      ],
    }).compile();

    controller = module.get<SalleController>(SalleController);
    service = module.get<SalleService>(SalleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call salleService.create with correct parameters', async () => {
      const createSalleDto: CreateSalleDto = {
        name: 'Salle 1',
        numero: 1,
        totalCapacity: 100,
        equipments: 'Projector, Sound System',
        id_cinema: 1,
      } as any;
      const result = { id_salle: 1, ...createSalleDto };
      mockSalleService.create.mockResolvedValue(result);

      expect(await controller.create(createSalleDto)).toEqual(result);
      expect(mockSalleService.create).toHaveBeenCalledWith(createSalleDto);
    });
  });

  describe('findAll', () => {
    it('should call salleService.findAll and return an array of salles', async () => {
      const result = [{ id_salle: 1, name: 'Salle 1' }];
      mockSalleService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(mockSalleService.findAll).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should call salleService.findOne with correct parameters', async () => {
      const id = '1';
      const result = { id_salle: 1, name: 'Salle 1' };
      mockSalleService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(id)).toEqual(result);
      expect(mockSalleService.findOne).toHaveBeenCalledWith(+id);
    });
  });

  describe('update', () => {
    it('should call salleService.update with correct parameters', async () => {
      const id = '1';
      const updateSalleDto: UpdateSalleDto = { nom: 'Salle 1 updated' };
      const result = { affected: 1 };
      mockSalleService.update.mockResolvedValue(result);

      expect(await controller.update(id, updateSalleDto)).toEqual(result);
      expect(mockSalleService.update).toHaveBeenCalledWith(+id, updateSalleDto);
    });
  });

  describe('remove', () => {
    it('should call salleService.remove with correct parameters', async () => {
      const id = '1';
      const result = { affected: 1 };
      mockSalleService.remove.mockResolvedValue(result);

      expect(await controller.remove(id)).toEqual(result);
      expect(mockSalleService.remove).toHaveBeenCalledWith(+id);
    });
  });
});
