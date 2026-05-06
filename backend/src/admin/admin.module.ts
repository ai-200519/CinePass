import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../reservation/entities/reservation.entity';
import { ReservationSiege } from '../reservation/entities/reservation-siege.entity';
import { Paiement } from '../paiement/entities/paiement.entity';
import { Seance } from '../seance/entities/seance.entity';
import { Film } from '../film/entities/film.entity';
import { Cinema } from '../cinema/entities/cinema.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      ReservationSiege,
      Paiement,
      Film,
      Seance,
      Cinema,
    ]), 
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
