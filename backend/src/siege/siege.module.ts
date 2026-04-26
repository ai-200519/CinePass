import { Module } from '@nestjs/common';
import { SiegeService } from './siege.service';
import { SiegeController } from './siege.controller';

@Module({
  controllers: [SiegeController],
  providers: [SiegeService],
})
export class SiegeModule {}
