import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TarifService } from '../tarif.service';
import { Tarif, TypePublic } from '../entities/tarif.entity';

const mockTarif: Partial<Tarif> = {
  id_tarif: 1,
  typePublic: TypePublic.NORMAL,
  prix: 50,
  seance: { id_seance: 1 } as any,
};

const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('TarifService', () => {
  let service: TarifService;
  let repo: Repository<Tarif>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TarifService,
        {
          provide: getRepositoryToken(Tarif),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TarifService>(TarifService);
    repo = module.get<Repository<Tarif>>(getRepositoryToken(Tarif));

    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create a tarif when it does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockTarif);
      mockRepository.save.mockResolvedValue(mockTarif);

      const result = await service.create({
        typePublic: TypePublic.NORMAL,
        prix: 50,
        id_seance: 1,
      });

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          typePublic: TypePublic.NORMAL,
          seance: { id_seance: 1 },
        },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        typePublic: TypePublic.NORMAL,
        prix: 50,
        seance: { id_seance: 1 },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockTarif);
      expect(result).toEqual(mockTarif);
    });

    it('should throw ConflictException when tarif already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockTarif);

      await expect(
        service.create({
          typePublic: TypePublic.NORMAL,
          prix: 50,
          id_seance: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findBySeance()', () => {
    it('should return tarifs for a seance', async () => {
      mockRepository.find.mockResolvedValue([mockTarif]);

      const result = await service.findBySeance(1);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { seance: { id_seance: 1 } },
        order: { typePublic: 'ASC' },
      });
      expect(result).toEqual([mockTarif]);
    });
  });

  describe('update()', () => {
    it('should update a tarif price', async () => {
      const updatedTarif = { ...mockTarif, prix: 45 } as Tarif;

      mockRepository.findOne
        .mockResolvedValueOnce(mockTarif)
        .mockResolvedValueOnce(updatedTarif);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, { prix: 45 });

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id_tarif: 1 },
        { prix: 45 },
      );
      expect(result).toEqual(updatedTarif);
    });

    it('should throw NotFoundException when tarif does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { prix: 45 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove()', () => {
    it('should delete a tarif', async () => {
      mockRepository.findOne.mockResolvedValue(mockTarif);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when tarif does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
