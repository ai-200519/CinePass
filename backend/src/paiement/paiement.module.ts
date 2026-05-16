import { Module }             from '@nestjs/common';
import { TypeOrmModule }      from '@nestjs/typeorm';
import { PaiementController } from './paiement.controller';
import { PaiementService }    from './paiement.service';
import { StripeGateway }      from './gateways/stripe.gateway';
import { Paiement }           from './entities/paiement.entity';
import { Reservation }        from '../reservation/entities/reservation.entity';
import { ReservationModule }  from '../reservation/reservation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paiement, Reservation]),
    ReservationModule,  
  ],
  controllers: [PaiementController],
  providers: [
    PaiementService,
    StripeGateway,
  ],
  exports: [PaiementService],
})
export class PaiementModule {}