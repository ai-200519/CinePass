import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';

// Entities
import { AuthModule } from './auth/auth.module'
import { UtilisateurModule } from './utilisateur/utilisateur.module';
import { CinemaModule } from './cinema/cinema.module';
import { SalleModule } from './salle/salle.module';
import { SiegeModule } from './siege/siege.module';
import { FilmModule } from './film/film.module';
import { SeanceModule } from './seance/seance.module';
import { TarifModule } from './tarif/tarif.module';
import { ReservationModule } from './reservation/reservation.module';
import { PaiementModule } from './paiement/paiement.module';
import { NotificationModule } from './notification/notification.module';
import { AdminModule } from './admin/admin.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule/dist/schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        ssl: configService.get<string>('DB_SSL') === 'true',
      }),
    }),
    ScheduleModule.forRoot(),    
    AuthModule, UtilisateurModule, CinemaModule, SalleModule, SiegeModule, FilmModule, SeanceModule, TarifModule, ReservationModule, PaiementModule, NotificationModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

