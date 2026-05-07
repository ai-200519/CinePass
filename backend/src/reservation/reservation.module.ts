// src/reservation/reservation.module.ts
import { Module }               from '@nestjs/common';
import { TypeOrmModule }        from '@nestjs/typeorm';
import { ReservationController } from './reservation.controller';
import { ReservationService }   from './reservation.service';
import { Reservation }          from './entities/reservation.entity';
import { ReservationSiege }     from './entities/reservation-siege.entity';
import { Seance }               from '../seance/entities/seance.entity';
import { Siege }                from '../siege/entities/siege.entity';
import { Tarif }                from '../tarif/entities/tarif.entity';
import { ExpirationScheduler } from './scheduler/expiration.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      ReservationSiege,
      Seance,
      Siege,
      Tarif,
    ]),
  ],
  controllers: [ReservationController],
  providers:   [ReservationService, ExpirationScheduler,],
  exports:     [ReservationService],
})
export class ReservationModule {}