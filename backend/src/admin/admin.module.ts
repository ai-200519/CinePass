import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { ReservationSiege } from 'src/reservation/entities/reservation-siege.entity';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { Seance } from 'src/seance/entities/seance.entity';
import { Film } from 'src/film/entities/film.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      ReservationSiege,
      Paiement,
      Film,
      Seance,
    ]), 
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
