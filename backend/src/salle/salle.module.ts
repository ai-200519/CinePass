import { Module } from '@nestjs/common';
import { SalleService } from './salle.service';
import { SalleController } from './salle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salle } from './entities/salle.entity';
import { Cinema } from 'src/cinema/entities/cinema.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Salle, Cinema])],
  controllers: [SalleController],
  providers: [SalleService],
})
export class SalleModule { }
