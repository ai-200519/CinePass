import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SeanceService } from '../seance.service';
import { Seance } from '../entities/seance.entity';
import { Film } from '../../film/entities/film.entity';
import { Salle } from '../../salle/entities/salle.entity';
import { Siege } from '../../siege/entities/siege.entity';
import { ReservationSiege } from '../../reservation/entities/reservation-siege.entity';
import { Tarif } from '../../tarif/entities/tarif.entity';

const createQueryBuilderMock = () => {
  const qb: any = {
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getRawMany: jest.fn(),
  };

  return qb;
};

const mockSeanceRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockFilmRepo = { findOne: jest.fn() };
const mockSalleRepo = { findOne: jest.fn() };
const mockSiegeRepo = { find: jest.fn() };
const mockReservationSiegeRepo = { createQueryBuilder: jest.fn() };
const mockTarifRepo = { find: jest.fn() };

describe('SeanceService', () => {
  let service: SeanceService;
  let seanceRepo: Repository<Seance>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeanceService,
        { provide: getRepositoryToken(Seance), useValue: mockSeanceRepo },
        { provide: getRepositoryToken(Film), useValue: mockFilmRepo },
        { provide: getRepositoryToken(Salle), useValue: mockSalleRepo },
        { provide: getRepositoryToken(Siege), useValue: mockSiegeRepo },
        { provide: getRepositoryToken(ReservationSiege), useValue: mockReservationSiegeRepo },
        { provide: getRepositoryToken(Tarif), useValue: mockTarifRepo },
      ],
    }).compile();

    service = module.get<SeanceService>(SeanceService);
    seanceRepo = module.get<Repository<Seance>>(getRepositoryToken(Seance));
    jest.clearAllMocks();
  });

  it('should create a seance', async () => {
    const dto = {
      dateHeure: '2026-05-10T19:30:00.000Z',
      technologie: '2D',
      statut: 'PROGRAMMEE',
      film: { id: 1 },
      salle: { id_salle: 2 },
    } as any;

    const film = { id: 1 } as any;
    const salle = { id_salle: 2 } as any;
    const created = { id_seance: 1 } as any;

    mockFilmRepo.findOne.mockResolvedValue(film);
    mockSalleRepo.findOne.mockResolvedValue(salle);
    mockSeanceRepo.create.mockReturnValue(created);
    mockSeanceRepo.save.mockResolvedValue(created);
    jest.spyOn(service, 'findOne').mockResolvedValue({ id_seance: 1 } as any);

    await expect(service.create(dto)).resolves.toEqual({ id_seance: 1 });
    expect(seanceRepo.save).toHaveBeenCalledWith(created);
  });

  it('should throw when film not found in create', async () => {
    mockFilmRepo.findOne.mockResolvedValue(null);

    await expect(service.create({ film: { id: 99 }, salle: { id_salle: 1 } } as any))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when salle not found in create', async () => {
    mockFilmRepo.findOne.mockResolvedValue({ id: 1 } as any);
    mockSalleRepo.findOne.mockResolvedValue(null);

    await expect(service.create({ film: { id: 1 }, salle: { id_salle: 99 } } as any))
      .rejects.toThrow(NotFoundException);
  });

  it('should return seances with availability', async () => {
    const qb = createQueryBuilderMock();
    const seances = [
      {
        id_seance: 1,
        dateHeure: new Date('2026-05-10T19:30:00.000Z'),
        technologie: '2D',
        statut: 'PROGRAMMEE',
        film: { id: 1, title: 'Film A', poster: 'p', genre: 'Action', duration: 120, note: 4 },
        salle: {
          id_salle: 2,
          numero: 1,
          nom: 'Salle 1',
          capaciteTotale: 100,
          cinema: { id_cinema: 3, nom: 'Cinema A', ville: 'Safi' },
        },
        reservationsCount: 10,
      },
    ];

    qb.getMany.mockResolvedValue(seances as any);
    mockSeanceRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await service.findAll();

    expect(result[0].remainingSeats).toBe(90);
    expect(result[0].estComplet).toBe(false);
    expect(result[0].cinema?.nom).toBe('Cinema A');
  });

  it('should apply film filter in findAll', async () => {
    const qb = createQueryBuilderMock();
    qb.getMany.mockResolvedValue([]);
    mockSeanceRepo.createQueryBuilder.mockReturnValue(qb);

    await service.findAll(5);

    expect(qb.andWhere).toHaveBeenCalledWith('film.id = :id_film', { id_film: 5 });
  });

  it('should return one seance', async () => {
    const qb = createQueryBuilderMock();
    qb.getOne.mockResolvedValue({ id_seance: 1, salle: { capaciteTotale: 10 } } as any);
    mockSeanceRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await service.findOne(1);

    expect(result.id_seance).toBe(1);
  });

  it('should throw when seance not found in findOne', async () => {
    const qb = createQueryBuilderMock();
    qb.getOne.mockResolvedValue(null);
    mockSeanceRepo.createQueryBuilder.mockReturnValue(qb);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should update a seance', async () => {
    const existing = {
      id_seance: 1,
      dateHeure: new Date(),
      technologie: '2D',
      statut: 'PROGRAMMEE',
      film: { id: 1 },
      salle: { id_salle: 2 },
    } as any;

    mockSeanceRepo.findOne.mockResolvedValue(existing);
    mockSeanceRepo.save.mockResolvedValue(existing);
    jest.spyOn(service, 'findOne').mockResolvedValue({ id_seance: 1 } as any);

    await expect(service.update(1, { technologie: '3D' } as any)).resolves.toEqual({ id_seance: 1 });
  });

  it('should throw when seance not found in update', async () => {
    mockSeanceRepo.findOne.mockResolvedValue(null);

    await expect(service.update(99, {} as any)).rejects.toThrow(NotFoundException);
  });

  it('should throw when film not found in update', async () => {
    mockSeanceRepo.findOne.mockResolvedValue({ id_seance: 1, film: { id: 1 }, salle: { id_salle: 2 } } as any);
    mockFilmRepo.findOne.mockResolvedValue(null);

    await expect(service.update(1, { film: { id: 99 } } as any)).rejects.toThrow(NotFoundException);
  });

  it('should throw when salle not found in update', async () => {
    mockSeanceRepo.findOne.mockResolvedValue({ id_seance: 1, film: { id: 1 }, salle: { id_salle: 2 } } as any);
    mockSalleRepo.findOne.mockResolvedValue(null);

    await expect(service.update(1, { salle: { id_salle: 99 } } as any)).rejects.toThrow(NotFoundException);
  });

  it('should remove a seance', async () => {
    mockSeanceRepo.findOne.mockResolvedValue({ id_seance: 1 } as any);
    mockSeanceRepo.delete.mockResolvedValue({ affected: 1 } as any);

    await expect(service.remove(1)).resolves.toEqual({ message: 'Seance deleted successfully' });
  });

  it('should throw when seance not found in remove', async () => {
    mockSeanceRepo.findOne.mockResolvedValue(null);

    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });

  it('should return available seats', async () => {
    const qb = createQueryBuilderMock();
    qb.getRawMany.mockResolvedValue([{ id_siege: 2 }]);

    const seance = { id_seance: 1, salle: { id_salle: 10, nom: 'Salle 1', capaciteTotale: 2 } } as any;
    const sieges = [
      { id_siege: 1, rangee: 'A', numero: 1, categorie: 'STANDARD', statut: 'BLOQUE' },
      { id_siege: 2, rangee: 'A', numero: 2, categorie: 'STANDARD', statut: 'DISPONIBLE' },
    ];

    mockSeanceRepo.findOne.mockResolvedValue(seance);
    mockSiegeRepo.find.mockResolvedValue(sieges);
    mockReservationSiegeRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await service.getSiegesDisponibles(1);

    expect(result.placesRestantes).toBe(1);
    expect(result.sieges[0].statut).toBe('BLOQUE');
    expect(result.sieges[1].statut).toBe('OCCUPE');
  });

  it('should throw when seance not found in getSiegesDisponibles', async () => {
    mockSeanceRepo.findOne.mockResolvedValue(null);

    await expect(service.getSiegesDisponibles(99)).rejects.toThrow(NotFoundException);
  });

  it('should return tarifs for seance', async () => {
    mockSeanceRepo.findOne.mockResolvedValue({ id_seance: 1 } as any);
    mockTarifRepo.find.mockResolvedValue([{ id_tarif: 1 }]);

    await expect(service.getTarifs(1)).resolves.toEqual([{ id_tarif: 1 }]);
  });

  it('should throw when seance not found in getTarifs', async () => {
    mockSeanceRepo.findOne.mockResolvedValue(null);

    await expect(service.getTarifs(99)).rejects.toThrow(NotFoundException);
  });
});
