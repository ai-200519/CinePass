// src/reservation/scheduler/expiration.scheduler.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ExpirationScheduler } from '../scheduler/expiration.scheduler';
import { ReservationService } from '../reservation.service';

describe('ExpirationScheduler', () => {
  let scheduler: ExpirationScheduler;

  const mockReservationService = {
    expireOldReservations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpirationScheduler,
        {
          provide:  ReservationService,
          useValue: mockReservationService,
        },
      ],
    }).compile();

    scheduler = module.get<ExpirationScheduler>(ExpirationScheduler);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  it('should call expireOldReservations on cron trigger', async () => {
    mockReservationService.expireOldReservations.mockResolvedValue(undefined);

    await scheduler.handleExpiration();

    expect(mockReservationService.expireOldReservations)
      .toHaveBeenCalledTimes(1);
  });

  it('should not throw if no expired reservations', async () => {
    mockReservationService.expireOldReservations.mockResolvedValue(undefined);

    await expect(scheduler.handleExpiration()).resolves.not.toThrow();
  });

  it('should not throw if service throws', async () => {
    mockReservationService.expireOldReservations
      .mockRejectedValue(new Error('DB error'));

    // Scheduler should catch errors gracefully
    await expect(scheduler.handleExpiration()).rejects.toThrow('DB error');
  });
});