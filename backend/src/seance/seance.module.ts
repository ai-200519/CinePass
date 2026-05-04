import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from '../film/entities/film.entity';
import { Salle } from '../salle/entities/salle.entity';
import { Seance } from './entities/seance.entity';
import { SeanceController } from './seance.controller';
import { SeanceService } from './seance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Seance, Film, Salle])],
  controllers: [SeanceController],
  providers: [SeanceService],
})
export class SeanceModule {}
