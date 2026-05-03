import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from '../admin.service';
import { Reservation } from '../../reservation/entities/reservation.entity';
import { ReservationSiege } from '../../reservation/entities/reservation-siege.entity';
import { Paiement } from '../../paiement/entities/paiement.entity';
import { Film } from '../../film/entities/film.entity';
import { Seance } from '../../seance/entities/seance.entity';
import { Cinema } from '../../cinema/entities/cinema.entity';

const createQueryBuilderMock = () => {
  const qb: any = {
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    getCount: jest.fn(),
    getMany: jest.fn(),
  };

  return qb;
};

describe('AdminService', () => {
  let service: AdminService;
  let reservationRepo: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    reservationRepo = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Reservation), useValue: reservationRepo },
        {
          provide: getRepositoryToken(ReservationSiege),
          useValue: { createQueryBuilder: jest.fn() },
        },
        { provide: getRepositoryToken(Paiement), useValue: { createQueryBuilder: jest.fn() } },
        { provide: getRepositoryToken(Film), useValue: { createQueryBuilder: jest.fn() } },
        { provide: getRepositoryToken(Seance), useValue: { createQueryBuilder: jest.fn() } },
        { provide: getRepositoryToken(Cinema), useValue: { createQueryBuilder: jest.fn() } },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should map films stats correctly', async () => {
    const qb = createQueryBuilderMock();
    qb.getRawMany.mockResolvedValue([
      {
        id_film: 1,
        title: 'Film A',
        genre: 'Action',
        poster: 'poster.jpg',
        note: 4.5,
        nbReservations: '2',
        chiffreAffaires: '30.5',
      },
    ]);

    reservationRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await service.getFilmsStats({} as any);

    expect(result.films).toHaveLength(1);
    expect(result.films[0]).toEqual({
      rang: 1,
      id_film: 1,
      title: 'Film A',
      genre: 'Action',
      poster: 'poster.jpg',
      nbReservations: 2,
      chiffreAffaires: 30.5,
      devise: 'MAD',
    });
  });

  it('should return reservations with cinema info', async () => {
    const qb = createQueryBuilderMock();
    qb.getMany.mockResolvedValue([
      {
        id_reservation: 1,
        reference: 'CP-2026-ABC',
        statut: 'PAYEE',
        dateReservation: new Date('2026-05-01T10:00:00.000Z'),
        paiement: { montantTotal: 100 },
        utilisateur: { nom: 'Alami', prenom: 'Youssef', email: 'youssef@cinepass.ma' },
        seance: {
          dateHeure: new Date('2026-05-03T19:30:00.000Z'),
          film: { title: 'Gladiator II' },
          salle: { cinema: { nom: 'Cinema Central' } },
        },
      },
    ]);

    reservationRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await service.getAllReservations({} as any);

    expect(result.total).toBe(1);
    expect(result.reservations[0]).toMatchObject({
      id: 1,
      reference: 'CP-2026-ABC',
      film: 'Gladiator II',
      cinema: 'Cinema Central',
    });
  });

  it('should export CSV with cinema column', async () => {
    jest.spyOn(service, 'getAllReservations').mockResolvedValue({
      total: 1,
      reservations: [
        {
          id: 1,
          reference: 'CP-1',
          statut: 'PAYEE',
          dateReservation: new Date('2026-05-01T10:00:00.000Z'),
          montant: 100,
          client: { prenom: 'Youssef', nom: 'Alami', email: 'youssef@cinepass.ma' },
          film: 'Gladiator II',
          cinema: 'Cinema Central',
          dateSeance: new Date('2026-05-03T19:30:00.000Z'),
        },
      ],
    } as any);

    const csv = await service.exportCsv({} as any);

    expect(csv).toContain('Cinéma');
    expect(csv).toContain('Cinema Central');
  });
});
