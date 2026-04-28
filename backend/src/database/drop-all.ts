// src/database/drop-all.ts
import * as dotenv from 'dotenv';
dotenv.config();

import { Client } from 'pg';

async function dropAll() {
  const client = new Client({
    host:     process.env.DB_HOST,
    port:     +process.env.DB_PORT,
    user:     process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('✅ Connected to Neon');

  await client.query(`
    DROP TABLE IF EXISTS notification        CASCADE;
    DROP TABLE IF EXISTS paiement            CASCADE;
    DROP TABLE IF EXISTS reservation_siege   CASCADE;
    DROP TABLE IF EXISTS reservation         CASCADE;
    DROP TABLE IF EXISTS tarif               CASCADE;
    DROP TABLE IF EXISTS seance              CASCADE;
    DROP TABLE IF EXISTS film                CASCADE;
    DROP TABLE IF EXISTS siege               CASCADE;
    DROP TABLE IF EXISTS salle               CASCADE;
    DROP TABLE IF EXISTS cinema              CASCADE;
    DROP TABLE IF EXISTS utilisateur         CASCADE;
    DROP TABLE IF EXISTS migrations          CASCADE;

    DROP TYPE IF EXISTS role_utilisateur     CASCADE;
    DROP TYPE IF EXISTS statut_utilisateur   CASCADE;
    DROP TYPE IF EXISTS statut_film          CASCADE;
    DROP TYPE IF EXISTS statut_seance        CASCADE;
    DROP TYPE IF EXISTS technologie_seance   CASCADE;
    DROP TYPE IF EXISTS categorie_siege      CASCADE;
    DROP TYPE IF EXISTS statut_siege         CASCADE;
    DROP TYPE IF EXISTS statut_reservation   CASCADE;
    DROP TYPE IF EXISTS methode_paiement     CASCADE;
    DROP TYPE IF EXISTS statut_paiement      CASCADE;
    DROP TYPE IF EXISTS type_notification    CASCADE;
    DROP TYPE IF EXISTS statut_notification  CASCADE;
  `);

  console.log('✅ All tables and types dropped');
  await client.end();
}

dropAll();