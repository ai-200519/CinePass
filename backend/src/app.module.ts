import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
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

@Module({
  imports: [AuthModule, UtilisateurModule, CinemaModule, SalleModule, SiegeModule, FilmModule, SeanceModule, TarifModule, ReservationModule, PaiementModule, NotificationModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
