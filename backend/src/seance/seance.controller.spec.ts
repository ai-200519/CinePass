import { Test, TestingModule } from '@nestjs/testing';
import { SeanceController } from './seance.controller';
import { SeanceService } from './seance.service';

describe('SeanceController', () => {
  let controller: SeanceController;
  let service: SeanceService;

  const mockSeanceService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeanceController],
      providers: [
        {
          provide: SeanceService,
          useValue: mockSeanceService,
        },
      ],
    }).compile();

    controller = module.get<SeanceController>(SeanceController);
    service = module.get<SeanceService>(SeanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a seance', async () => {
      const createSeanceDto = {};
      const expectedResult = { id_seance: 1, ...createSeanceDto };
      mockSeanceService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createSeanceDto as any);
      expect(service.create).toHaveBeenCalledWith(createSeanceDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of seances', async () => {
      const expectedResult = [{ id_seance: 1 }];
      mockSeanceService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single seance by id', async () => {
      const expectedResult = { id_seance: 1 };
      mockSeanceService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a seance', async () => {
      const updateSeanceDto = {};
      const expectedResult = { affected: 1 };
      mockSeanceService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateSeanceDto as any);
      expect(service.update).toHaveBeenCalledWith(1, updateSeanceDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a seance', async () => {
      const expectedResult = { affected: 1 };
      mockSeanceService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });
});
