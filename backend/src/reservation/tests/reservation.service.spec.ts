import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReservationService } from '../reservation.service';
import { Reservation } from '../entities/reservation.entity';
import { ReservationSiege } from '../entities/reservation-siege.entity';
import { Seance } from '../../seance/entities/seance.entity';
import { Siege } from '../../siege/entities/siege.entity';
import { Tarif } from '../../tarif/entities/tarif.entity';
import { StatutReservation } from '../../common/enums/statut-reservation.enum';

const mockReservationRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
};

const mockReservationSiegeRepo = {};
const mockSeanceRepo = {};
const mockSiegeRepo = {};
const mockTarifRepo = {};

const mockDataSource = {
  createQueryRunner: jest.fn(),
};

describe('ReservationService', () => {
  let service: ReservationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: getRepositoryToken(Reservation), useValue: mockReservationRepo },
        { provide: getRepositoryToken(ReservationSiege), useValue: mockReservationSiegeRepo },
        { provide: getRepositoryToken(Seance), useValue: mockSeanceRepo },
        { provide: getRepositoryToken(Siege), useValue: mockSiegeRepo },
        { provide: getRepositoryToken(Tarif), useValue: mockTarifRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    jest.clearAllMocks();
  });

  it('should throw when seance not found in create', async () => {
    const queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn().mockResolvedValue(null),
      },
    } as any;

    mockDataSource.createQueryRunner.mockReturnValue(queryRunner);

    await expect(service.create({ id_seance: 1, sieges: [] } as any, 1))
      .rejects.toThrow(NotFoundException);

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('should cancel reservation when status is EN_COURS', async () => {
    const reservation = {
      id_reservation: 1,
      reference: 'CP-1',
      statut: StatutReservation.EN_COURS,
      utilisateur: { id_utilisateur: 7 },
    } as any;

    mockReservationRepo.findOne.mockResolvedValue(reservation);
    mockReservationRepo.update.mockResolvedValue({ affected: 1 } as any);

    const result = await service.cancel(1, 7);

    expect(result.statut).toBe(StatutReservation.ANNULEE);
    expect(mockReservationRepo.update).toHaveBeenCalledWith(
      { id_reservation: 1 },
      { statut: StatutReservation.ANNULEE },
    );
  });

  it('should throw when reservation not found in cancel', async () => {
    mockReservationRepo.findOne.mockResolvedValue(null);

    await expect(service.cancel(1, 7)).rejects.toThrow(NotFoundException);
  });

  it('should throw when reservation belongs to another user', async () => {
    mockReservationRepo.findOne.mockResolvedValue({
      id_reservation: 1,
      statut: StatutReservation.EN_COURS,
      utilisateur: { id_utilisateur: 10 },
    } as any);

    await expect(service.cancel(1, 7)).rejects.toThrow(ForbiddenException);
  });

  it('should throw when reservation status is not EN_COURS', async () => {
    mockReservationRepo.findOne.mockResolvedValue({
      id_reservation: 1,
      statut: StatutReservation.PAYEE,
      utilisateur: { id_utilisateur: 7 },
    } as any);

    await expect(service.cancel(1, 7)).rejects.toThrow(BadRequestException);
  });

  it('should return user reservations', async () => {
    const reservations = [
      {
        id_reservation: 1,
        reference: 'CP-1',
        statut: StatutReservation.PAYEE,
        dateReservation: new Date('2026-05-01T10:00:00.000Z'),
        paiement: { montantTotal: 120 },
        seance: {
          film: { title: 'Film A', poster: 'poster.jpg' },
          dateHeure: new Date('2026-05-02T19:30:00.000Z'),
          technologie: '2D',
          salle: { nom: 'Salle 1' },
        },
        reservationSieges: [{}, {}],
      },
    ];

    mockReservationRepo.find.mockResolvedValue(reservations as any);

    const result = await service.findByUser(7);

    expect(result.total).toBe(1);
    expect(result.reservations[0].film).toBe('Film A');
    expect(result.reservations[0].nbSieges).toBe(2);
  });

  it('should return one reservation detail', async () => {
    const reservation = {
      id_reservation: 1,
      reference: 'CP-1',
      statut: StatutReservation.PAYEE,
      dateReservation: new Date('2026-05-01T10:00:00.000Z'),
      utilisateur: { id_utilisateur: 7 },
      paiement: { montantTotal: 120, devise: 'MAD' },
      seance: {
        film: { title: 'Film A', poster: 'poster.jpg', genre: 'Action', duration: 120 },
        dateHeure: new Date('2026-05-02T19:30:00.000Z'),
        technologie: '2D',
        salle: { nom: 'Salle 1' },
      },
      reservationSieges: [
        { siege: { rangee: 'A', numero: 1 }, categorie: 'STANDARD', prixUnitaire: 60 },
      ],
    } as any;

    mockReservationRepo.findOne.mockResolvedValue(reservation);

    const result = await service.findOne(1, 7);

    expect(result.reference).toBe('CP-1');
    expect(result.nbSieges).toBe(1);
    expect(result.film.title).toBe('Film A');
  });

  it('should throw when reservation not found in findOne', async () => {
    mockReservationRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne(1, 7)).rejects.toThrow(NotFoundException);
  });

  it('should throw when reservation belongs to another user in findOne', async () => {
    mockReservationRepo.findOne.mockResolvedValue({
      id_reservation: 1,
      utilisateur: { id_utilisateur: 10 },
    } as any);

    await expect(service.findOne(1, 7)).rejects.toThrow(ForbiddenException);
  });
});
