// src/seance/seance.module.ts
import { Module }           from '@nestjs/common';
import { TypeOrmModule }    from '@nestjs/typeorm';
import { SeanceController } from './seance.controller';
import { SeanceService }    from './seance.service';
import { Seance }           from './entities/seance.entity';
import { Film }             from '../film/entities/film.entity';
import { Salle }            from '../salle/entities/salle.entity';
import { Siege }            from '../siege/entities/siege.entity';             
import { ReservationSiege } from '../reservation/entities/reservation-siege.entity'; 
import { Tarif }            from '../tarif/entities/tarif.entity';             

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Seance,
      Film,
      Salle,
      Siege,             
      ReservationSiege,  
      Tarif,             
    ]),
  ],
  controllers: [SeanceController],
  providers:   [SeanceService],
  exports:     [SeanceService],
})
export class SeanceModule {}