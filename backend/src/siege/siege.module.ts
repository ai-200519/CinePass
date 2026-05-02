import { Module } from '@nestjs/common';
import { SiegeService } from './siege.service';
import { SiegeController } from './siege.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Siege } from './entities/siege.entity';
import { Salle } from 'src/salle/entities/salle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Siege, Salle])],
  controllers: [SiegeController],
  providers: [SiegeService],
})
export class SiegeModule { }
