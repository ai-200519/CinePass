import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarif } from './entities/tarif.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tarif])],
  controllers: [],
  providers: [],
})
export class TarifModule {}
