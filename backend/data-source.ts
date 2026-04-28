// data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

// ── Import all entities ───────────────────────────────────────────────────────
import { Utilisateur }      from './src/utilisateur/entities/utilisateur.entity';
import { Cinema }           from './src/cinema/entities/cinema.entity';
import { Salle }            from './src/salle/entities/salle.entity';
import { Siege }            from './src/siege/entities/siege.entity';
import { Film }             from './src/film/entities/film.entity';
import { Seance }           from './src/seance/entities/seance.entity';
import { Tarif }            from './src/tarif/entities/tarif.entity';
import { Reservation }      from './src/reservation/entities/reservation.entity';
import { ReservationSiege } from './src/reservation/entities/reservation-siege.entity';
import { Paiement }         from './src/paiement/entities/paiement.entity';
import { Notification }     from './src/notification/entities/notification.entity';

export const AppDataSource = new DataSource({
  type:     'postgres',
  host:     process.env.DB_HOST,
  port:     +(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: { rejectUnauthorized: false },

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

  synchronize: false,   // ← never true here — seeds don't modify schema
  logging:     false,
});