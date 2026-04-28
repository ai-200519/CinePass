import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';

// Entities
import { Utilisateur }      from './utilisateur/entities/utilisateur.entity';
import { Cinema }           from './cinema/entities/cinema.entity';
import { Salle }            from './salle/entities/salle.entity';
import { Siege }            from './siege/entities/siege.entity';
import { Film }             from './film/entities/film.entity';
import { Seance }           from './seance/entities/seance.entity';
import { Tarif }            from './tarif/entities/tarif.entity';
import { Reservation }      from './reservation/entities/reservation.entity';
import { ReservationSiege } from './reservation/entities/reservation-siege.entity';
import { Paiement }         from './paiement/entities/paiement.entity';
import { Notification }     from './notification/entities/notification.entity';

import { UtilisateurModule } from './utilisateur/utilisateur.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...getDatabaseConfig(config),
        entities: [
          Utilisateur,
          Cinema,
          Salle,
          Siege,
          Film,
          Seance,
          Tarif,
          Reservation,
          ReservationSiege,
          Paiement,
          Notification,
        ],
      }),
    }),
    UtilisateurModule,
    AuthModule,
  ],
})
export class AppModule {}