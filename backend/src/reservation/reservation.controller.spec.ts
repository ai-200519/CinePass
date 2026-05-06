import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';

describe('ReservationController', () => {
  let controller: ReservationController;

  const mockReservationService = {
    create: jest.fn(),
    findByUser: jest.fn(),
    findOne: jest.fn(),
    cancel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        { provide: ReservationService, useValue: mockReservationService },
      ],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create reservation for current user', async () => {
    const dto = { id_seance: 1, sieges: [{ id_siege: 10, typePublic: 'NORMAL' }] } as any;
    const user = { id_utilisateur: 7 } as any;
    const result = { id_reservation: 1, reference: 'CP-1' } as any;
    mockReservationService.create.mockResolvedValue(result);

    await expect(controller.create(dto, user)).resolves.toEqual(result);
    expect(mockReservationService.create).toHaveBeenCalledWith(dto, 7);
  });

  it('should return reservations for current user', async () => {
    const user = { id_utilisateur: 7 } as any;
    const result = { total: 1, reservations: [] } as any;
    mockReservationService.findByUser.mockResolvedValue(result);

    await expect(controller.findMesReservations(user)).resolves.toEqual(result);
    expect(mockReservationService.findByUser).toHaveBeenCalledWith(7);
  });

  it('should return reservation details for current user', async () => {
    const user = { id_utilisateur: 7 } as any;
    const result = { id_reservation: 1 } as any;
    mockReservationService.findOne.mockResolvedValue(result);

    await expect(controller.findOne(1, user)).resolves.toEqual(result);
    expect(mockReservationService.findOne).toHaveBeenCalledWith(1, 7);
  });

  it('should cancel a reservation for current user', async () => {
    const user = { id_utilisateur: 7 } as any;
    const result = { statut: 'ANNULEE' } as any;
    mockReservationService.cancel.mockResolvedValue(result);

    await expect(controller.cancel(1, user)).resolves.toEqual(result);
    expect(mockReservationService.cancel).toHaveBeenCalledWith(1, 7);
  });
});
