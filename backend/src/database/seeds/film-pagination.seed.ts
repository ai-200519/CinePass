import { DataSource, In } from 'typeorm';
import { AppDataSource } from '../../../data-source';
import { Cinema } from '../../cinema/entities/cinema.entity';
import { StatutFilm } from '../../common/enums/statut-film.enum';
import { StatutSeance } from '../../common/enums/statut-seance.enum';
import { TechnologieSeance } from '../../common/enums/technologie-seance.enum';
import { Film } from '../../film/entities/film.entity';
import { Salle } from '../../salle/entities/salle.entity';
import { Seance } from '../../seance/entities/seance.entity';

const FILMS_PER_CITY = 50;
const TITLE_PREFIX = 'Pagination Test';

type CitySeed = {
  ville: string;
  nom: string;
  adresse: string;
  telephone: string;
  latitude: number;
  longitude: number;
};

type FilmTemplate = {
  title: string;
  genre: string;
  director: string;
  actors: string[];
  duration: number;
  poster: string;
  trailer: string;
  note: number;
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

const familyFilmTemplates: FilmTemplate[] = [
  {
    title: 'Raya and the Last Dragon',
    genre: 'Aventure',
    director: 'Don Hall',
    actors: ['Kelly Marie Tran', 'Awkwafina', 'Gemma Chan'],
    duration: 107,
    poster: 'https://image.tmdb.org/t/p/w500/lPsD10PP4rgUGiGR4CCXA6iY0QQ.jpg',
    trailer: 'https://youtu.be/1VIZ89FEjYI',
    note: 4.2,
  },
  {
    title: 'The Jungle Book',
    genre: 'Aventure',
    director: 'Jon Favreau',
    actors: ['Neel Sethi', 'Bill Murray', 'Ben Kingsley'],
    duration: 106,
    poster: 'https://image.tmdb.org/t/p/w500/vOipe2myi26UDwP978hsYOrnUWC.jpg',
    trailer: 'https://youtu.be/5mkm22yO-bs',
    note: 4.2,
  },
  {
    title: 'Coco',
    genre: 'Animation',
    director: 'Lee Unkrich',
    actors: ['Anthony Gonzalez', 'Gael Garcia Bernal', 'Benjamin Bratt'],
    duration: 105,
    poster: 'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',
    trailer: 'https://youtu.be/Rvr68u6k5sI',
    note: 4.7,
  },
  {
    title: 'The Super Mario Bros. Movie',
    genre: 'Animation',
    director: 'Aaron Horvath',
    actors: ['Chris Pratt', 'Anya Taylor-Joy', 'Charlie Day'],
    duration: 92,
    poster: 'https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg',
    trailer: 'https://youtu.be/TnGl01FkMMo',
    note: 4.1,
  },
  {
    title: 'Paddington 2',
    genre: 'Comedie',
    director: 'Paul King',
    actors: ['Ben Whishaw', 'Hugh Grant', 'Sally Hawkins'],
    duration: 104,
    poster: 'https://image.tmdb.org/t/p/w500/1OJ9vkD5xPt3skC6KguyXAgagRZ.jpg',
    trailer: 'https://youtu.be/52x5HJ9H8DM',
    note: 4.6,
  },
  {
    title: 'Elemental',
    genre: 'Animation',
    director: 'Peter Sohn',
    actors: ['Leah Lewis', 'Mamoudou Athie', 'Ronnie del Carmen'],
    duration: 101,
    poster: 'https://image.tmdb.org/t/p/w500/4Y1WNkd88JXmGfhtWR7dmDAo1T2.jpg',
    trailer: 'https://youtu.be/hXzcyx9V0xw',
    note: 4.0,
  },
  {
    title: 'Moana',
    genre: 'Aventure',
    director: 'Ron Clements',
    actors: ['Aulii Cravalho', 'Dwayne Johnson', 'Rachel House'],
    duration: 107,
    poster: 'https://image.tmdb.org/t/p/w500/9tzN8sPbyod2dsa0lwuvrwBDWra.jpg',
    trailer: 'https://youtu.be/LKFuXETZUsI',
    note: 4.4,
  },
  {
    title: 'Zootopia',
    genre: 'Comedie',
    director: 'Byron Howard',
    actors: ['Ginnifer Goodwin', 'Jason Bateman', 'Idris Elba'],
    duration: 109,
    poster: 'https://image.tmdb.org/t/p/w500/hlK0e0wAQ3VLuJcsfIYPvb4JVud.jpg',
    trailer: 'https://youtu.be/jWM0ct-OLsM',
    note: 4.4,
  },
  {
    title: 'Inside Out',
    genre: 'Animation',
    director: 'Pete Docter',
    actors: ['Amy Poehler', 'Phyllis Smith', 'Bill Hader'],
    duration: 95,
    poster: 'https://image.tmdb.org/t/p/w500/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg',
    trailer: 'https://youtu.be/yRUAzGQ3nSY',
    note: 4.5,
  },
  {
    title: 'The Lego Movie',
    genre: 'Action',
    director: 'Phil Lord',
    actors: ['Chris Pratt', 'Elizabeth Banks', 'Will Arnett'],
    duration: 100,
    poster: 'https://image.tmdb.org/t/p/w500/lbctonEnewCYZ4FYoTZhs8cidAl.jpg',
    trailer: 'https://youtu.be/fZ_JOBCLF-I',
    note: 4.0,
  },
];

const titleAdjectives = [
  'Atlas',
  'Oasis',
  'Galaxy',
  'Sunny',
  'Brave',
  'Magic',
  'Golden',
  'Crystal',
  'Blue',
  'Happy',
];

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildFilmsForCity(ville: string) {
  return Array.from({ length: FILMS_PER_CITY }, (_, index) => {
    const template = familyFilmTemplates[index % familyFilmTemplates.length];
    const adjective = titleAdjectives[index % titleAdjectives.length];
    const number = String(index + 1).padStart(2, '0');
    const statut = index % 5 === 0 ? StatutFilm.A_VENIR : StatutFilm.EN_COURS;

    return {
      title: `${TITLE_PREFIX} ${number}: ${adjective} ${template.title} - ${ville}`,
      description: `Film familial non-adulte cree pour tester la pagination du catalogue a ${ville}.`,
      duration: template.duration + (index % 4) * 4,
      releaseDate: addDays(startOfDay(new Date()), statut === StatutFilm.A_VENIR ? index + 7 : -index - 1),
      director: template.director,
      actors: template.actors,
      genre: template.genre,
      poster: template.poster,
      trailer: template.trailer,
      note: Math.min(5, Number((template.note + (index % 3) * 0.1).toFixed(1))),
      isShowing: statut === StatutFilm.EN_COURS,
      statut,
    };
  });
}

async function ensureCinema(repo: any, citySeed: CitySeed): Promise<Cinema> {
  const existing = await repo.findOne({ where: { ville: citySeed.ville } });
  if (existing) {
    repo.merge(existing, citySeed);
    return repo.save(existing);
  }
  return repo.save(repo.create(citySeed));
}

async function ensureSalle(repo: any, cinema: Cinema): Promise<Salle> {
  const existing = await repo.findOne({
    where: { numero: 1, cinema: { id_cinema: cinema.id_cinema } },
  });
  if (existing) return existing;

  return repo.save(
    repo.create({
      numero: 1,
      nom: 'Salle Pagination',
      capaciteTotale: 120,
      equipements: '2D, Dolby 7.1',
      cinema,
    }),
  );
}

async function ensureSeance(
  repo: any,
  film: Film,
  salle: Salle,
  index: number,
): Promise<void> {
  const existing = await repo.findOne({
    where: { film: { id: film.id }, salle: { id_salle: salle.id_salle } },
  });
  if (existing) return;

  const dateHeure = addDays(startOfDay(new Date()), (index % 21) + 1);
  dateHeure.setHours(10 + (index % 5) * 2, index % 2 === 0 ? 0 : 30, 0, 0);

  await repo.save(
    repo.create({
      dateHeure,
      technologie:
        index % 4 === 0
          ? TechnologieSeance.TROIS_D
          : index % 6 === 0
            ? TechnologieSeance.DOLBY
            : TechnologieSeance.DEUX_D,
      statut: StatutSeance.PROGRAMMEE,
      film,
      salle,
    }),
  );
}

export async function seedPaginationFilms(dataSource: DataSource): Promise<void> {
  await dataSource.transaction(async (tx) => {
    const cinemaRepo = tx.getRepository(Cinema);
    const filmRepo = tx.getRepository(Film);
    const salleRepo = tx.getRepository(Salle);
    const seanceRepo = tx.getRepository(Seance);

    for (const citySeed of citySeeds) {
      const cinema = await ensureCinema(cinemaRepo, citySeed);
      const salle = await ensureSalle(salleRepo, cinema);
      const seedFilms = buildFilmsForCity(citySeed.ville);
      const existingFilms = await filmRepo.find({
        where: { title: In(seedFilms.map((film) => film.title)) },
      });
      const existingByTitle = new Map(
        existingFilms.map((film) => [film.title, film]),
      );

      for (let index = 0; index < seedFilms.length; index += 1) {
        const seedFilm = seedFilms[index];
        const existing = existingByTitle.get(seedFilm.title);
        const film = existing
          ? await filmRepo.save(filmRepo.merge(existing, seedFilm))
          : await filmRepo.save(filmRepo.create(seedFilm));

        await ensureSeance(seanceRepo, film, salle, index);
      }
    }
  });

  console.log(
    `Pagination film seed completed: ${FILMS_PER_CITY} non-adult films per ville (${FILMS_PER_CITY * citySeeds.length} films total).`,
  );
}

async function runPaginationFilmSeed() {
  console.log('Starting pagination film seed...');

  try {
    await AppDataSource.initialize();
    await seedPaginationFilms(AppDataSource);
  } catch (error) {
    console.error('Pagination film seed error:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  }
}

if (require.main === module) {
  void runPaginationFilmSeed();
}
