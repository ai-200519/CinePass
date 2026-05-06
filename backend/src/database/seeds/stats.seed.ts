import * as bcrypt from 'bcrypt';
import { DataSource, In } from 'typeorm';

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

type CitySeed = {
  ville: string;
  nom: string;
  adresse: string;
  telephone: string;
  latitude: number;
  longitude: number;
};

type FilmSeed = {
  title: string;
  description: string;
  duration: number;
  releaseOffsetDays: number;
  director: string;
  actors: string[];
  genre: string;
  poster: string;
  trailer: string;
  note: number;
  statut: StatutFilm;
};

const citySeeds: CitySeed[] = [
  {
    ville: 'Errachidia',
    nom: 'CinePass Errachidia',
    adresse: 'Avenue Moulay Ali Cherif, Errachidia',
    telephone: '+212535570101',
    latitude: 31.9314,
    longitude: -4.4244,
  },
  {
    ville: 'Casablanca',
    nom: 'CinePass Casablanca',
    adresse: 'Boulevard Zerktouni, Casablanca',
    telephone: '+212522220202',
    latitude: 33.5899,
    longitude: -7.6039,
  },
  {
    ville: 'Rabat',
    nom: 'CinePass Rabat',
    adresse: 'Avenue Mohammed V, Rabat',
    telephone: '+212537730303',
    latitude: 34.0209,
    longitude: -6.8416,
  },
  {
    ville: 'Marrakech',
    nom: 'CinePass Marrakech',
    adresse: 'Avenue Mohammed VI, Marrakech',
    telephone: '+212524440404',
    latitude: 31.6295,
    longitude: -7.9811,
  },
];

const baseFilmSeeds: FilmSeed[] = [
  {
    title: 'Dune: Deuxieme Partie',
    description:
      'Paul Atreides unit his destiny with the Fremen while Arrakis becomes the center of an empire-wide conflict.',
    duration: 166,
    releaseOffsetDays: -45,
    director: 'Denis Villeneuve',
    actors: ['Timothee Chalamet', 'Zendaya', 'Rebecca Ferguson'],
    genre: 'Science-fiction',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGqqc9IQ.jpg',
    trailer: 'https://youtu.be/Way9Dexny3w',
    note: 4.7,
    statut: StatutFilm.EN_COURS,
  },
  {
    title: 'Oppenheimer',
    description:
      'The story of J. Robert Oppenheimer and the scientific race that changed the twentieth century.',
    duration: 180,
    releaseOffsetDays: -150,
    director: 'Christopher Nolan',
    actors: ['Cillian Murphy', 'Emily Blunt', 'Robert Downey Jr.'],
    genre: 'Drame historique',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    trailer: 'https://youtu.be/uYPbbksJxIg',
    note: 4.8,
    statut: StatutFilm.EN_COURS,
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description:
      'Miles Morales crosses the multiverse and discovers what it really means to wear the mask.',
    duration: 140,
    releaseOffsetDays: -300,
    director: 'Joaquim Dos Santos',
    actors: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    genre: 'Animation',
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    trailer: 'https://youtu.be/shW9i6k8cB0',
    note: 4.8,
    statut: StatutFilm.EN_COURS,
  },
  {
    title: 'The Batman',
    description:
      'A young Bruce Wayne follows a trail of corruption through Gotham while a masked killer taunts the city.',
    duration: 176,
    releaseOffsetDays: -260,
    director: 'Matt Reeves',
    actors: ['Robert Pattinson', 'Zoe Kravitz', 'Paul Dano'],
    genre: 'Thriller',
    poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    trailer: 'https://youtu.be/mqqft2x_Aa4',
    note: 4.4,
    statut: StatutFilm.EN_COURS,
  },
  {
    title: 'Inside Out 2',
    description:
      'Riley grows up, and a new wave of emotions takes over headquarters at exactly the wrong time.',
    duration: 96,
    releaseOffsetDays: -18,
    director: 'Kelsey Mann',
    actors: ['Amy Poehler', 'Maya Hawke', 'Phyllis Smith'],
    genre: 'Famille',
    poster: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    trailer: 'https://youtu.be/LEjhY15eCx0',
    note: 4.5,
    statut: StatutFilm.EN_COURS,
  },
  {
    title: 'Mission: Impossible - Dead Reckoning',
    description:
      'Ethan Hunt and his team chase a weapon that could reshape the balance of power.',
    duration: 163,
    releaseOffsetDays: -80,
    director: 'Christopher McQuarrie',
    actors: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames'],
    genre: 'Action',
    poster: 'https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg',
    trailer: 'https://youtu.be/avz06PDqDbM',
    note: 4.3,
    statut: StatutFilm.EN_COURS,
  },
  {
    title: 'Wonka',
    description:
      'A young chocolatier arrives in a city of dreams with recipes, courage, and a little magic.',
    duration: 116,
    releaseOffsetDays: -35,
    director: 'Paul King',
    actors: ['Timothee Chalamet', 'Calah Lane', 'Olivia Colman'],
    genre: 'Comedie musicale',
    poster: 'https://image.tmdb.org/t/p/w500/qhb1qOilapbapxWQn9jtRCMwXJF.jpg',
    trailer: 'https://youtu.be/otNh9bTjXWg',
    note: 4.1,
    statut: StatutFilm.EN_COURS,
  },
  {
    title: 'Avatar: La Voie de l Eau',
    description:
      'The Sully family searches for refuge among the ocean clans of Pandora.',
    duration: 192,
    releaseOffsetDays: 18,
    director: 'James Cameron',
    actors: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
    genre: 'Aventure',
    poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    trailer: 'https://youtu.be/d9MyW72ELq0',
    note: 4.2,
    statut: StatutFilm.A_VENIR,
  },
  {
    title: 'Top Gun: Maverick',
    description:
      'Maverick returns to train a new generation of pilots for a mission that demands everything.',
    duration: 131,
    releaseOffsetDays: -120,
    director: 'Joseph Kosinski',
    actors: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly'],
    genre: 'Action',
    poster: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
    trailer: 'https://youtu.be/giXco2jaZ_4',
    note: 4.6,
    statut: StatutFilm.EN_COURS,
  },
  {
    title: 'Elemental',
    description:
      'In a city where fire, water, earth, and air live together, two opposites discover what connects them.',
    duration: 102,
    releaseOffsetDays: -70,
    director: 'Peter Sohn',
    actors: ['Leah Lewis', 'Mamoudou Athie', 'Ronnie del Carmen'],
    genre: 'Animation',
    poster: 'https://image.tmdb.org/t/p/w500/4Y1WNkd88JXmGfhtWR7dmDAo1T2.jpg',
    trailer: 'https://youtu.be/hXzcyx9V0xw',
    note: 4.0,
    statut: StatutFilm.EN_COURS,
  },
  {
    title: 'Paddington 2',
    description:
      'Paddington searches for the perfect gift and turns an ordinary London adventure into something unforgettable.',
    duration: 103,
    releaseOffsetDays: -95,
    director: 'Paul King',
    actors: ['Ben Whishaw', 'Hugh Grant', 'Sally Hawkins'],
    genre: 'Comedie',
    poster: 'https://image.tmdb.org/t/p/w500/1OJ9vkD5xPt3skC6KguyXAgagRZ.jpg',
    trailer: 'https://youtu.be/52x5HJ9H8DM',
    note: 4.6,
    statut: StatutFilm.EN_COURS,
  },
  {
    title: 'The Super Mario Bros. Movie',
    description:
      'Mario and Luigi enter the Mushroom Kingdom for a colorful rescue mission full of surprises.',
    duration: 92,
    releaseOffsetDays: -60,
    director: 'Aaron Horvath',
    actors: ['Chris Pratt', 'Anya Taylor-Joy', 'Jack Black'],
    genre: 'Animation',
    poster: 'https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg',
    trailer: 'https://youtu.be/TnGl01FkMMo',
    note: 4.1,
    statut: StatutFilm.EN_COURS,
  },
  {
    title: 'Coco',
    description:
      'Miguel follows music, memory, and family history into a bright journey through the Land of the Dead.',
    duration: 105,
    releaseOffsetDays: -130,
    director: 'Lee Unkrich',
    actors: ['Anthony Gonzalez', 'Gael Garcia Bernal', 'Benjamin Bratt'],
    genre: 'Animation',
    poster: 'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',
    trailer: 'https://youtu.be/Rvr68u6k5sI',
    note: 4.7,
    statut: StatutFilm.EN_COURS,
  },
  {
    title: 'The Jungle Book',
    description:
      'Mowgli learns courage and friendship while crossing the jungle with Baloo and Bagheera.',
    duration: 106,
    releaseOffsetDays: -105,
    director: 'Jon Favreau',
    actors: ['Neel Sethi', 'Bill Murray', 'Ben Kingsley'],
    genre: 'Aventure',
    poster: 'https://image.tmdb.org/t/p/w500/9d2JSwI7I8Zz9c4K7p2Uka9kRTu.jpg',
    trailer: 'https://youtu.be/5mkm22yO-bs',
    note: 4.2,
    statut: StatutFilm.EN_COURS,
  },
  {
    title: 'Raya and the Last Dragon',
    description:
      'Raya travels across Kumandra to find the last dragon and restore trust between divided lands.',
    duration: 107,
    releaseOffsetDays: 20,
    director: 'Don Hall',
    actors: ['Kelly Marie Tran', 'Awkwafina', 'Gemma Chan'],
    genre: 'Aventure',
    poster: 'https://image.tmdb.org/t/p/w500/lPsD10PP4rgUGiGR4CCXA6iY0QQ.jpg',
    trailer: 'https://youtu.be/1VIZ89FEjYI',
    note: 4.2,
    statut: StatutFilm.A_VENIR,
  },
];

function startOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
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
  const datePart = toYyyyMmDd(seedDate);
  const idx = String(index).padStart(4, '0');
  return `${prefix}-${datePart}-${idx}`.slice(0, 20);
}

async function cleanupStatsSeed(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    DELETE FROM notification
    WHERE id_reservation IN (
      SELECT id_reservation FROM reservation WHERE reference LIKE 'SEED-%'
    );

    DELETE FROM paiement
    WHERE "referenceTransaction" LIKE 'SEED-TXN-%'
       OR id_reservation IN (
        SELECT id_reservation FROM reservation WHERE reference LIKE 'SEED-%'
      );

    DELETE FROM reservation_siege
    WHERE id_reservation IN (
      SELECT id_reservation FROM reservation WHERE reference LIKE 'SEED-%'
    );

    DELETE FROM reservation
    WHERE reference LIKE 'SEED-%';

    DELETE FROM tarif
    WHERE id_seance IN (
      SELECT s.id_seance
      FROM seance s
      JOIN film f ON f.id = s.id_film
      WHERE f.title LIKE '% - Errachidia'
         OR f.title LIKE '% - Casablanca'
         OR f.title LIKE '% - Rabat'
         OR f.title LIKE '% - Marrakech'
         OR LOWER(f.title) IN ('sex with love', 'fatal conspiracy')
         OR f.title IN (
          'Dune: Deuxieme Partie',
          'Oppenheimer',
          'Spider-Man: Across the Spider-Verse',
          'The Batman',
          'Inside Out 2',
          'Mission: Impossible - Dead Reckoning',
          'Wonka',
          'Avatar: La Voie de l Eau'
        )
    );

    DELETE FROM seance
    WHERE id_film IN (
      SELECT id
      FROM film
      WHERE title LIKE '% - Errachidia'
         OR title LIKE '% - Casablanca'
         OR title LIKE '% - Rabat'
         OR title LIKE '% - Marrakech'
         OR LOWER(title) IN ('sex with love', 'fatal conspiracy')
         OR title IN (
          'Dune: Deuxieme Partie',
          'Oppenheimer',
          'Spider-Man: Across the Spider-Verse',
          'The Batman',
          'Inside Out 2',
          'Mission: Impossible - Dead Reckoning',
          'Wonka',
          'Avatar: La Voie de l Eau'
        )
    );

    DELETE FROM film
    WHERE title LIKE '% - Errachidia'
       OR title LIKE '% - Casablanca'
       OR title LIKE '% - Rabat'
       OR title LIKE '% - Marrakech'
       OR LOWER(title) IN ('sex with love', 'fatal conspiracy')
       OR title IN (
        'Dune: Deuxieme Partie',
        'Oppenheimer',
        'Spider-Man: Across the Spider-Verse',
        'The Batman',
        'Inside Out 2',
        'Mission: Impossible - Dead Reckoning',
        'Wonka',
        'Avatar: La Voie de l Eau',
        'Top Gun: Maverick',
        'Elemental',
        'Paddington 2',
        'The Super Mario Bros. Movie',
        'Coco',
        'The Jungle Book',
        'Raya and the Last Dragon'
      );
  `);
}

export async function seedStats(dataSource: DataSource): Promise<void> {
  await cleanupStatsSeed(dataSource);

  await dataSource.transaction(async (tx) => {
    const cinemaRepo = tx.getRepository(Cinema);
    const filmRepo = tx.getRepository(Film);
    const salleRepo = tx.getRepository(Salle);
    const siegeRepo = tx.getRepository(Siege);
    const seanceRepo = tx.getRepository(Seance);
    const tarifRepo = tx.getRepository(Tarif);
    const userRepo = tx.getRepository(Utilisateur);
    const reservationRepo = tx.getRepository(Reservation);
    const reservationSiegeRepo = tx.getRepository(ReservationSiege);
    const paiementRepo = tx.getRepository(Paiement);

    const now = new Date();
    const today = startOfDay(now);
    const clients = await ensureSeedClients(userRepo);
    const seanceTimes = [
      { hour: 11, minute: 0 },
      { hour: 14, minute: 30 },
      { hour: 17, minute: 45 },
      { hour: 20, minute: 30 },
    ];
    const plannedOffsets = [0, 3, 7];
    const upcomingOffsets = [7, 14];
    let reservationIndex = 1;

    for (let cityIndex = 0; cityIndex < citySeeds.length; cityIndex += 1) {
      const citySeed = citySeeds[cityIndex];
      const cinema = await ensureCinema(cinemaRepo, citySeed);
      const salles = await ensureSallesAndSeats(salleRepo, siegeRepo, cinema);

      const films = await filmRepo.save(
        filmRepo.create(
          baseFilmSeeds.map((filmSeed) => ({
            title: `${filmSeed.title} - ${citySeed.ville}`,
            description: `${filmSeed.description} Disponible a ${citySeed.ville}.`,
            duration: filmSeed.duration,
            releaseDate: addDays(today, filmSeed.releaseOffsetDays),
            director: filmSeed.director,
            actors: filmSeed.actors,
            genre: filmSeed.genre,
            poster: filmSeed.poster,
            trailer: filmSeed.trailer,
            note: filmSeed.note,
            isShowing: filmSeed.statut === StatutFilm.EN_COURS,
            statut: filmSeed.statut,
          })),
        ),
      );

      const siegesBySalleId = new Map<number, Siege[]>();
      for (const salle of salles) {
        const sieges = await siegeRepo.find({
          where: { salle: { id_salle: salle.id_salle } },
          order: { rangee: 'ASC', numero: 'ASC' },
        });
        siegesBySalleId.set(salle.id_salle, sieges);
      }

      for (let filmIndex = 0; filmIndex < films.length; filmIndex += 1) {
        const film = films[filmIndex];
        const offsets =
          film.statut === StatutFilm.A_VENIR ? upcomingOffsets : plannedOffsets;

        for (let i = 0; i < offsets.length; i += 1) {
          const salle = salles[(filmIndex + i) % salles.length];
          const time =
            seanceTimes[(cityIndex + filmIndex + i) % seanceTimes.length];
          const dateHeure = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + offsets[i],
            time.hour,
            time.minute,
            0,
            0,
          );
          const technologie =
            salle.numero === 3
              ? TechnologieSeance.QUATRE_DX
              : salle.numero === 2
                ? TechnologieSeance.TROIS_D
                : i % 3 === 0
                  ? TechnologieSeance.DOLBY
                  : TechnologieSeance.DEUX_D;

          const seance = await seanceRepo.save(
            seanceRepo.create({
              dateHeure,
              technologie,
              statut:
                dateHeure < now
                  ? StatutSeance.TERMINEE
                  : StatutSeance.PROGRAMMEE,
              film,
              salle,
            }),
          );

          await createTarifs(tarifRepo, seance);
          reservationIndex = await createReservations(
            reservationRepo,
            reservationSiegeRepo,
            paiementRepo,
            clients,
            siegesBySalleId.get(salle.id_salle) ?? [],
            seance,
            reservationIndex,
            now,
          );
        }
      }
    }
  });

  console.log(
    'Stats seeded: 4 villes, 60 non-adult films, salles, sieges, seances, tarifs, reservations and payments.',
  );
}

async function ensureCinema(repo: any, citySeed: CitySeed): Promise<Cinema> {
  const existing = await repo.findOne({ where: { ville: citySeed.ville } });
  if (existing) {
    repo.merge(existing, citySeed);
    return repo.save(existing);
  }
  return repo.save(repo.create(citySeed));
}

async function ensureSallesAndSeats(
  salleRepo: any,
  siegeRepo: any,
  cinema: Cinema,
): Promise<Salle[]> {
  const salleSeeds = [
    {
      numero: 1,
      nom: 'Salle Atlas',
      equipements: '2D, Dolby 7.1',
      rows: ['A', 'B', 'C', 'D'],
    },
    {
      numero: 2,
      nom: 'Salle Oasis',
      equipements: '3D, Dolby Atmos',
      rows: ['A', 'B', 'C', 'D'],
    },
    {
      numero: 3,
      nom: 'Salle Premium',
      equipements: '4DX, sieges premium',
      rows: ['A', 'B', 'C'],
    },
  ];
  const salles: Salle[] = [];

  for (const salleSeed of salleSeeds) {
    const salle =
      (await salleRepo.findOne({
        where: {
          numero: salleSeed.numero,
          cinema: { id_cinema: cinema.id_cinema },
        },
      })) ??
      (await salleRepo.save(
        salleRepo.create({
          numero: salleSeed.numero,
          nom: salleSeed.nom,
          capaciteTotale: salleSeed.rows.length * 10,
          equipements: salleSeed.equipements,
          cinema,
        }),
      ));

    salles.push(salle);

    const seatCount = await siegeRepo.count({
      where: { salle: { id_salle: salle.id_salle } },
    });
    if (seatCount > 0) continue;

    const seats: Siege[] = [];
    for (const rangee of salleSeed.rows) {
      for (let numero = 1; numero <= 10; numero += 1) {
        seats.push(
          siegeRepo.create({
            rangee,
            numero,
            categorie:
              rangee === 'A' ? CategorieSiege.VIP : CategorieSiege.STANDARD,
            salle,
          }),
        );
      }
    }
    await siegeRepo.save(seats);
  }

  return salles;
}

async function ensureSeedClients(userRepo: any): Promise<Utilisateur[]> {
  const passwordHash = await bcrypt.hash('client123', 10);
  const emails = Array.from({ length: 12 }, (_, index) => {
    return `seed.client${index + 1}@cinepass.ma`;
  });

  for (let i = 1; i <= 12; i += 1) {
    const email = `seed.client${i}@cinepass.ma`;
    await userRepo
      .createQueryBuilder()
      .insert()
      .into(Utilisateur)
      .values({
        nom: `SeedClient${i}`,
        prenom: 'CinePass',
        email,
        telephone: `+212600000${String(i).padStart(3, '0')}`,
        motDePasse: passwordHash,
        role: Role.CLIENT,
        statut: StatutUtilisateur.ACTIF,
        langue: 'FR',
      })
      .orIgnore()
      .execute();
  }

  return userRepo.find({
    where: { email: In(emails) },
    order: { id_utilisateur: 'ASC' },
  });
}

async function createTarifs(tarifRepo: any, seance: Seance): Promise<void> {
  const isPremium =
    seance.technologie === TechnologieSeance.QUATRE_DX ||
    seance.technologie === TechnologieSeance.DOLBY;
  const basePrice = isPremium
    ? 85
    : seance.technologie === TechnologieSeance.TROIS_D
      ? 70
      : 60;

  await tarifRepo.save(
    tarifRepo.create([
      { seance, typePublic: TypePublic.NORMAL, prix: basePrice },
      { seance, typePublic: TypePublic.ETUDIANT, prix: basePrice - 15 },
      { seance, typePublic: TypePublic.ENFANT, prix: basePrice - 25 },
      { seance, typePublic: TypePublic.SENIOR, prix: basePrice - 20 },
      { seance, typePublic: TypePublic.GROUPE, prix: basePrice - 10 },
    ]),
  );
}

async function createReservations(
  reservationRepo: any,
  reservationSiegeRepo: any,
  paiementRepo: any,
  clients: Utilisateur[],
  sieges: Siege[],
  seance: Seance,
  startIndex: number,
  now: Date,
): Promise<number> {
  if (sieges.length === 0) return startIndex;

  const priceForCategory: Record<CategorieSiege, number> = {
    [CategorieSiege.STANDARD]: 60,
    [CategorieSiege.VIP]: 90,
  };
  let reservationIndex = startIndex;
  const paidReservationCount = 1;

  for (let r = 0; r < paidReservationCount; r += 1) {
    const reservationRef = makeRef('SEED', seance.dateHeure, reservationIndex);
    reservationIndex += 1;
    const reservedSeats = [
      sieges[(r * 2) % sieges.length],
      sieges[(r * 2 + 1) % sieges.length],
    ];
    const reservationTime = new Date(seance.dateHeure);
    reservationTime.setHours(reservationTime.getHours() - 2 - r);

    const savedReservation = await reservationRepo.save(
      reservationRepo.create({
        reference: reservationRef,
        dateReservation: reservationTime,
        statut:
          seance.dateHeure < now
            ? StatutReservation.UTILISEE
            : StatutReservation.PAYEE,
        utilisateur: clients[(reservationIndex + r) % clients.length],
        seance,
        reservationSieges: reservedSeats.map((siege) =>
          reservationSiegeRepo.create({
            siege,
            categorie: siege.categorie,
            prixUnitaire: priceForCategory[siege.categorie],
          }),
        ),
      }),
    );

    await paiementRepo.save(
      paiementRepo.create({
        reservation: savedReservation,
        montantTotal: reservedSeats.reduce(
          (total, siege) => total + priceForCategory[siege.categorie],
          0,
        ),
        devise: 'MAD',
        methode: r % 2 === 0 ? MethodePaiement.STRIPE : MethodePaiement.PAYPAL,
        statut: StatutPaiement.ACCEPTE,
        referenceTransaction: `SEED-TXN-${reservationRef}-${r}`,
        datePaiement: reservationTime,
      }),
    );
  }

  return reservationIndex;
}
