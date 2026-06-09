import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationSiege } from 'src/reservation/entities/reservation-siege.entity';
import { Salle } from 'src/salle/entities/salle.entity';
import { Siege } from './entities/siege.entity';
import { SiegeController } from './siege.controller';
import { SiegeService } from './siege.service';

@Module({
  imports: [TypeOrmModule.forFeature([Siege, Salle, ReservationSiege])],
  controllers: [SiegeController],
  providers: [SiegeService],
})
export class SiegeModule { }
