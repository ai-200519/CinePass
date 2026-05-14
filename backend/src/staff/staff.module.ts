import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Seance } from '../seance/entities/seance.entity';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

@Module({
  imports: [TypeOrmModule.forFeature([Seance, Reservation])],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
