import * as bcrypt from 'bcrypt';
import { DataSource, Like } from 'typeorm';

import { Cinema } from '../../cinema/entities/cinema.entity';
import { Film } from '../../film/entities/film.entity';
import { Paiement } from '../../paiement/entities/paiement.entity';
import { ReservationSiege } from '../../reservation/entities/reservation-siege.entity';
import { Reservation } from '../../reservation/entities/reservation.entity';
import { Salle } from '../../salle/entities/salle.entity';
import { Seance } from '../../seance/entities/seance.entity';
import { Siege } from '../../siege/entities/siege.entity';
import { Tarif, TypePublic } from '../../tarif/entities/tarif.entity';
import { Utilisateur } from '../../utilisateur/entities/utilisateur.entity';

import { CategorieSiege } from '../../common/enums/categorie-siege.enum';
import { MethodePaiement } from '../../common/enums/methode-paiement.enum';
import { Role } from '../../common/enums/role.enum';
import { StatutFilm } from '../../common/enums/statut-film.enum';
import { StatutPaiement } from '../../common/enums/statut-paiement.enum';
import { StatutReservation } from '../../common/enums/statut-reservation.enum';
import { StatutSeance } from '../../common/enums/statut-seance.enum';
import { StatutUtilisateur } from '../../common/enums/statut-utilisateur.enum';
import { TechnologieSeance } from '../../common/enums/technologie-seance.enum';

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toYyyyMmDd(date: Date): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function makeRef(prefix: string, seedDate: Date, index: number): string {
  // Reservation.reference has max length 20
  // e.g. SEED-20260505-0001 (18 chars)
  const datePart = toYyyyMmDd(seedDate);
  const idx = String(index).padStart(4, '0');
  return `${prefix}-${datePart}-${idx}`.slice(0, 20);
}

export async function seedStats(dataSource: DataSource): Promise<void> {
  const reservationRepo = dataSource.getRepository(Reservation);
  const filmRepo = dataSource.getRepository(Film);

  const alreadySeededReservation = await reservationRepo.findOne({
    where: { reference: Like('SEED-%') },
  });
  const alreadySeededFilm = await filmRepo.findOne({
    where: { title: Like('Seed:%') },
  });

  if (alreadySeededReservation || alreadySeededFilm) {
    console.log('⏭️  Stats seed already present — skipping');
    return;
  }

  await dataSource.transaction(async (tx) => {
    const filmRepoTx = tx.getRepository(Film);
    const reservationRepoTx = tx.getRepository(Reservation);
    const reservationSiegeRepoTx = tx.getRepository(ReservationSiege);

    const cinemaRepo = tx.getRepository(Cinema);
    const salleRepo = tx.getRepository(Salle);
    const siegeRepo = tx.getRepository(Siege);
    const seanceRepo = tx.getRepository(Seance);
    const tarifRepo = tx.getRepository(Tarif);
    const userRepo = tx.getRepository(Utilisateur);
    const paiementRepo = tx.getRepository(Paiement);

    const cinema = await cinemaRepo.findOne({ where: { id_cinema: 1 } });
    if (!cinema) {
      throw new Error('Cinema (id_cinema=1) not found. Run seedCinema first.');
    }

    const now = new Date();
    const today = startOfDay(now);

    // 1) Films
    const films = await filmRepoTx.save(
      filmRepoTx.create([
        {
          title: 'Dune: Deuxième Partie',
          description: 'Un voyage épique sur Arrakis.',
          duration: 166,
          releaseDate: addDays(today, -45),
          director: 'Denis Villeneuve',
          actors: ['Timothée Chalamet', 'Zendaya'],
          genre: 'Science-fiction',
          poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGqqc9IQ.jpg',
          trailer: 'https://youtu.be/Way9Dexny3w',
          note: 4.6,
          isShowing: true,
          statut: StatutFilm.EN_COURS,
        },
        {
          title: 'Oppenheimer',
          description: 'Le destin d’un scientifique et d’une époque.',
          duration: 180,
          releaseDate: addDays(today, -150),
          director: 'Christopher Nolan',
          actors: ['Cillian Murphy', 'Emily Blunt'],
          genre: 'Drame',
          poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
          trailer: 'https://youtu.be/uYPbbksJxIg',
          note: 4.7,
          isShowing: true,
          statut: StatutFilm.EN_COURS,
        },
        {
          title: 'Spider-Man: Across the Spider-Verse',
          description: 'Plusieurs mondes. Un seul héros.',
          duration: 140,
          releaseDate: addDays(today, -300),
          director: 'Joaquim Dos Santos',
          actors: ['Shameik Moore', 'Hailee Steinfeld'],
          genre: 'Animation',
          poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
          trailer: 'https://youtu.be/shW9i6k8cB0',
          note: 4.8,
          isShowing: true,
          statut: StatutFilm.EN_COURS,
        },
        {
          title: 'Le Royaume des Chats',
          description: 'Une aventure familiale pleine de magie.',
          duration: 102,
          releaseDate: addDays(today, -20),
          director: 'Hiroyuki Morita',
          actors: ['Chizuru Ikewaki'],
          genre: 'Famille',
          poster: 'https://image.tmdb.org/t/p/w500/avHPvJwEK2Yn7Pee4p7k0o5WkXF.jpg',
          trailer: 'https://youtu.be/Gp-H_YOcYTM',
          note: 4.1,
          isShowing: true,
          statut: StatutFilm.EN_COURS,
        },
        {
          title: 'Mission: Impossible - Dead Reckoning Part One',
          description: 'Action, suspense, et missions impossibles.',
          duration: 135,
          releaseDate: addDays(today, -10),
          director: 'Christopher McQuarrie',
          actors: ['Tom Cruise'],
          genre: 'Action',
          poster: 'https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg',
          trailer: 'https://youtu.be/avz06PDqDbM',
          note: 4.3,
          isShowing: true,
          statut: StatutFilm.EN_COURS,
        },
      ]),
    );

    // 2) Salles + Sieges (ensure at least 3 rooms with seats)
    const salleNumbers = [1, 2, 3];
    const salles: Salle[] = [];

    for (const numero of salleNumbers) {
      const existingSalle = await salleRepo.findOne({
        where: {
          numero,
          cinema: { id_cinema: cinema.id_cinema },
        },
      });

      const salle =
        existingSalle ??
        (await salleRepo.save(
          salleRepo.create({
            numero,
            nom: `Salle ${numero}`,
            capaciteTotale: 40,
            equipements: numero === 2 ? '3D, Dolby' : '2D',
            cinema,
          }),
        ));

      salles.push(salle);

      const seatCount = await siegeRepo.count({
        where: { salle: { id_salle: salle.id_salle } },
      });

      if (seatCount > 0) continue;

      const rangees = ['A', 'B', 'C', 'D', 'E'];
      const siegesToCreate: Siege[] = [];
      for (const rangee of rangees) {
        for (let seatNumber = 1; seatNumber <= 8; seatNumber += 1) {
          const categorie =
            rangee === 'A' || rangee === 'B' ? CategorieSiege.VIP : CategorieSiege.STANDARD;
          siegesToCreate.push(
            siegeRepo.create({
              rangee,
              numero: seatNumber,
              categorie,
              salle,
            }),
          );
        }
      }
      await siegeRepo.save(siegesToCreate);
    }

    const siegesBySalleId = new Map<number, Siege[]>();
    for (const salle of salles) {
      const sieges = await siegeRepo.find({
        where: { salle: { id_salle: salle.id_salle } },
        order: { rangee: 'ASC', numero: 'ASC' },
      });
      siegesBySalleId.set(salle.id_salle, sieges);
    }

    // 3) Seances (spread across last 90 days and today)
    const seanceTimes = [
      { hour: 14, minute: 0 },
      { hour: 17, minute: 30 },
      { hour: 20, minute: 0 },
    ];

    const seances: Seance[] = [];
    let filmIndex = 0;
    for (const film of films) {
      // 20 seances per film: past 90 days up to today
      const salle = salles[filmIndex % salles.length];
      const techno = filmIndex % 2 === 0 ? TechnologieSeance.DEUX_D : TechnologieSeance.TROIS_D;

      for (let i = 0; i < 20; i++) {
        const offset = Math.floor(Math.random() * 90) - 89; // -89 to 0
        const t = seanceTimes[(filmIndex + i) % seanceTimes.length];
        const dateHeure = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + offset,
          t.hour,
          t.minute,
          0,
          0,
        );

        // Always add at least one seance on 'today' for each film
        if (i === 19) {
          dateHeure.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
        }

        const isPast = dateHeure < new Date();

        const seance = await seanceRepo.save(
          seanceRepo.create({
            dateHeure,
            technologie: techno,
            statut: isPast ? StatutSeance.TERMINEE : StatutSeance.PROGRAMMEE,
            film,
            salle,
          }),
        );
        seances.push(seance);
      }

      filmIndex += 1;
    }

    // 4) Tarifs for each seance
    for (const seance of seances) {
      const existingTarifs = await tarifRepo.count({
        where: { seance: { id_seance: seance.id_seance } },
      });
      if (existingTarifs > 0) continue;

      await tarifRepo.save(
        tarifRepo.create([
          { seance, typePublic: TypePublic.NORMAL, prix: 60 },
          { seance, typePublic: TypePublic.ETUDIANT, prix: 45 },
          { seance, typePublic: TypePublic.ENFANT, prix: 35 },
          { seance, typePublic: TypePublic.SENIOR, prix: 40 },
        ]),
      );
    }

    // 5) Clients
    const clientPasswordHash = await bcrypt.hash('client123', 10);
    const clients: Utilisateur[] = [];
    for (let i = 1; i <= 10; i += 1) {
      const email = `seed.client${i}@cinepass.ma`;
      const existing = await userRepo.findOne({ where: { email } });
      if (existing) {
        clients.push(existing);
        continue;
      }
      const created = await userRepo.save(
        userRepo.create({
          nom: `SeedClient${i}`,
          prenom: 'CinePass',
          email,
          telephone: `+2126000000${String(i).padStart(2, '0')}`,
          motDePasse: clientPasswordHash,
          role: Role.CLIENT,
          statut: StatutUtilisateur.ACTIF,
          langue: 'FR',
        }),
      );
      clients.push(created);
    }

    // 6) Reservations + Paiements
    const priceForCategory: Record<CategorieSiege, number> = {
      [CategorieSiege.STANDARD]: 60,
      [CategorieSiege.VIP]: 80,
    };

    let reservationIndex = 1;
    for (let seanceIndex = 0; seanceIndex < seances.length; seanceIndex += 1) {
      const seance = seances[seanceIndex];
      const salle = seance.salle;
      const sieges = siegesBySalleId.get(salle.id_salle) ?? [];
      if (sieges.length === 0) continue;

      // 6 paid reservations per seance
      for (let r = 0; r < 6; r += 1) {
        const utilisateur = clients[(seanceIndex * 3 + r) % clients.length];
        const reservationRef = makeRef('SEED', seance.dateHeure, reservationIndex);
        reservationIndex += 1;

        const seat1 = sieges[(r * 2) % sieges.length];
        const seat2 = sieges[(r * 2 + 1) % sieges.length];

        // Reservation time: a few hours/days before the seance
        const reservationTime = new Date(seance.dateHeure);
        reservationTime.setHours(reservationTime.getHours() - 2 - (r % 48));

        const reservation = reservationRepoTx.create({
          reference: reservationRef,
          dateReservation: reservationTime,
          statut: StatutReservation.PAYEE,
          utilisateur,
          seance,
          reservationSieges: [
            reservationSiegeRepoTx.create({
              siege: seat1,
              categorie: seat1.categorie,
              prixUnitaire: priceForCategory[seat1.categorie],
            }),
            reservationSiegeRepoTx.create({
              siege: seat2,
              categorie: seat2.categorie,
              prixUnitaire: priceForCategory[seat2.categorie],
            }),
          ],
        });

        const savedReservation = await reservationRepoTx.save(reservation);

        const montantTotal =
          priceForCategory[seat1.categorie] + priceForCategory[seat2.categorie];

        await paiementRepo.save(
          paiementRepo.create({
            reservation: savedReservation,
            montantTotal,
            devise: 'MAD',
            methode: r % 2 === 0 ? MethodePaiement.STRIPE : MethodePaiement.PAYPAL,
            statut: StatutPaiement.ACCEPTE,
            referenceTransaction: `SEED-TXN-${reservationRef}-${r}`,
            datePaiement: reservationTime, // Paid roughly at the same time
          }),
        );
      }

      // 1 unpaid reservation per seance (to give status variety)
      const pendingUser = clients[(seanceIndex * 7) % clients.length];
      const pendingRef = makeRef('SEED', seance.dateHeure, reservationIndex);
      reservationIndex += 1;
      const pendingSeat = sieges[(seanceIndex * 5) % sieges.length];
      const pendingTime = new Date(seance.dateHeure);
      pendingTime.setHours(pendingTime.getHours() - 1);

      await reservationRepoTx.save(
        reservationRepoTx.create({
          reference: pendingRef,
          dateReservation: pendingTime,
          statut: seance.dateHeure < new Date() ? StatutReservation.ANNULEE : StatutReservation.EN_COURS,
          utilisateur: pendingUser,
          seance,
          reservationSieges: [
            reservationSiegeRepoTx.create({
              siege: pendingSeat,
              categorie: pendingSeat.categorie,
              prixUnitaire: priceForCategory[pendingSeat.categorie],
            }),
          ],
        }),
      );
    }
  });

  console.log(
    '✅ Stats seeded: films/salles/sieges/seances/tarifs + paid reservations (this week) — clients: seed.clientX@cinepass.ma / client123',
  );
}
