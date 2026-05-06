import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarif }           from './entities/tarif.entity';
import { TarifController } from './tarif.controller';
import { TarifService }    from './tarif.service';

@Module({
  imports:     [TypeOrmModule.forFeature([Tarif])],
  controllers: [TarifController],
  providers:   [TarifService],
  exports:     [TarifService],
})
export class TarifModule {}