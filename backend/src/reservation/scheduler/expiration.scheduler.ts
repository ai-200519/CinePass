// src/reservation/scheduler/expiration.scheduler.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationService } from '../reservation.service';

@Injectable()
export class ExpirationScheduler {

  private readonly logger = new Logger(ExpirationScheduler.name);

  constructor(
    private readonly reservationService: ReservationService,
  ) {}

  // Runs every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiration(): Promise<void> {
    this.logger.debug('⏰ Checking for expired reservations...');
    await this.reservationService.expireOldReservations();
  }
}