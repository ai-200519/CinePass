import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaiementService } from './paiement.service';
import { PaiementController } from './paiement.controller';
import { Paiement } from './entities/paiement.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { ReservationModule } from '../reservation/reservation.module';
import { StripeGateway } from './gateways/stripe.gateway';

@Module({
  imports: [
    ConfigModule,
    ReservationModule,
    TypeOrmModule.forFeature([Paiement, Reservation]),
  ],
  controllers: [PaiementController],
  providers: [PaiementService, StripeGateway],
})
export class PaiementModule {}
