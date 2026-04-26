import { Module } from '@nestjs/common';
import { SeanceService } from './seance.service';
import { SeanceController } from './seance.controller';

@Module({
  controllers: [SeanceController],
  providers: [SeanceService],
})
export class SeanceModule {}
