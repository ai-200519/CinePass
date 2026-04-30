import { Armchair, ChevronRight, Search, Smartphone, Ticket } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import Navbar from '../components/Navbar';

const movies = [
  {
    id: 'ombres-du-passe',
    title: 'Les Ombres du Passé',
    genre: 'Thriller',
    rating: '4.6',
    image:
      'https://images.unsplash.com/photo-1619347903021-4d286ec4e8f1?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'royaume-des-etoiles',
    title: 'Royaume des Étoiles',
    genre: 'Fantaisie',
    rating: '4.7',
    image:
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'apocalypse-stellaire',
    title: 'Apocalypse Stellaire',
    genre: 'Science-Fiction',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'la-derniere-seance',
    title: 'La Dernière Séance',
    genre: 'Drame',
    rating: '4.5',
    image:
      'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'legende-urbaine',
    title: 'Légende Urbaine',
    genre: 'Action',
    rating: '4.4',
    image:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=80',
  },
];

const seancesDuJour = [
  {
    title: 'Apocalypse Stellaire',
    salle: 'Salle 1',
    duration: '2h28',
    format: 'IMAX',
    time: '14:00',
    date: '2026-03-17',
    status: 'Places limitées',
    available: 45,
    total: 120,
    statusColor: 'orange' as const,
  },
  {
    title: 'Apocalypse Stellaire',
    salle: 'Salle 1',
    duration: '2h28',
    format: 'IMAX',
    time: '17:30',
    date: '2026-03-17',
    status: 'Dernières places',
    available: 12,
    total: 120,
    statusColor: 'red' as const,
  },
  {
    title: 'Apocalypse Stellaire',
    salle: 'Salle 2',
    duration: '2h28',
    format: '3D',
    time: '20:45',
    date: '2026-03-17',
    status: 'Dernières places',
    available: 5,
    total: 80,
    statusColor: 'red' as const,
  },
  {
    title: 'Les Ombres du Passé',
    salle: 'Salle 3',
    duration: '2h05',
    format: '2D',
    time: '15:15',
    date: '2026-03-17',
    status: 'Nombreuses places',
    available: 67,
    total: 100,
    statusColor: 'green' as const,
  },
  {
    title: 'Les Ombres du Passé',
    salle: 'Salle 3',
    duration: '2h05',
    format: '2D',
    time: '19:00',
    date: '2026-03-17',
    status: 'Places limitées',
    available: 23,
    total: 100,
    statusColor: 'orange' as const,
  },
  {
    title: 'Les Ombres du Passé',
    salle: 'Salle 4',
    duration: '2h05',
    format: '2D',
    time: '21:30',
    date: '2026-03-17',
    status: 'Dernières places',
    available: 8,
    total: 60,
    statusColor: 'red' as const,
  },
];

function SeanceCard({
  title,
  salle,
  duration,
  format,
  time,
  date,
  status,
  available,
  total,
  statusColor,
}: (typeof seancesDuJour)[number]) {
  const dotClass =
    statusColor === 'green'
      ? 'bg-emerald-400'
      : statusColor === 'orange'
        ? 'bg-orange-400'
        : 'bg-red-500';

  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900/70 to-zinc-950 p-8 shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />

      <span className="absolute right-6 top-6 rounded-full border border-red-500/25 bg-red-600/10 px-3 py-1 text-xs font-semibold tracking-wide text-red-500">
        {format}
      </span>

      <div className="relative">
        <h3 className="pr-16 text-2xl font-bold tracking-tight">{title}</h3>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          <span className="inline-flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-zinc-400"
              aria-hidden="true"
            >
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
              <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
            </svg>
            {salle}
          </span>

          <span className="inline-flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-zinc-400"
              aria-hidden="true"
            >
              <path d="M12 6v6l4 2" />
              <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
            </svg>
            {duration}
          </span>
        </div>

        <div className="mt-10 flex items-center justify-between gap-6">
          <div className="flex items-center gap-7">
            <div>
              <div className="text-4xl font-extrabold leading-none tracking-tight">{time}</div>
              <div className="mt-2 text-sm text-zinc-500">{date}</div>
            </div>

            <div className="h-12 w-px bg-white/10" aria-hidden="true" />

            <div className="flex items-start gap-3">
              <span className={`mt-1.5 h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
              <div className="w-40 text-sm">
                <div className="font-medium text-zinc-200">{status}</div>
                <div className="mt-1.5 text-zinc-400">
                  {available}/{total} places disponibles
                </div>
              </div>
            </div>
          </div>

          <button className="rounded-xl bg-red-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-red-500">
            Réserver
          </button>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const defaultDate = '2026-03-17';
  const selectedMovieTitle = useMemo(
    () => movies.find((movie) => movie.id === selectedMovie)?.title ?? '',
    [selectedMovie],
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden md:h-[600px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1757186202331-e72fee53815f?w=1920&h=800&fit=crop"
            alt="Cinema"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>

        <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 max-w-4xl px-4 text-3xl font-bold text-white md:mb-6 md:text-5xl lg:text-6xl">
            Réservez vos places en quelques clics
          </h1>
          <p className="mb-8 max-w-2xl px-4 text-base text-zinc-400 md:mb-12 md:text-xl">
            Choisissez votre film, votre séance, et payez en ligne en toute simplicité.
          </p>

          <form
            className="w-full max-w-4xl rounded-xl border border-white/10 bg-zinc-900 p-4 shadow-2xl md:p-6"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
              <select
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 text-sm text-white outline-none ring-red-500/50 focus:ring-2"
              >
                <option value="" disabled>
                  Ville
                </option>
                <option value="paris">Paris</option>
                <option value="lyon">Lyon</option>
                <option value="marseille">Marseille</option>
                <option value="toulouse">Toulouse</option>
              </select>

              <select
                value={selectedMovie}
                onChange={(event) => setSelectedMovie(event.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 text-sm text-white outline-none ring-red-500/50 focus:ring-2"
                aria-label="Film"
              >
                <option value="" disabled>
                  Film
                </option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="h-11 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 text-sm text-white outline-none ring-red-500/50 focus:ring-2"
                defaultValue={defaultDate}
              />

              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 text-sm font-semibold text-white transition hover:from-red-800 hover:to-red-600"
                aria-label="Rechercher"
              >
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </button>
            </div>

            {/* Keeps layout consistent with the provided design while remaining no-op for now */}
            <div className="sr-only" aria-live="polite">
              {selectedCity || selectedMovieTitle ? `Recherche: ${selectedCity} ${selectedMovieTitle}` : ''}
            </div>
          </form>
        </div>
      </section>

      {/* Films à l'affiche */}
      <section id="films" className="bg-zinc-950">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">Films à l'affiche</h2>
            <Link
              to="/films"
              className="flex items-center gap-2 font-medium text-red-500 transition hover:text-red-600"
            >
              Voir tout
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                genre={movie.genre}
                rating={movie.rating}
                image={movie.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Séances du jour */}
      <section className="bg-zinc-950">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-4xl font-extrabold text-white">Séances du jour</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {seancesDuJour.map((seance) => (
              <SeanceCard
                key={`${seance.title}-${seance.salle}-${seance.time}-${seance.format}`}
                {...seance}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi CinePass */}
      <section className="bg-zinc-950">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">Pourquoi CinePass ?</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-800">
                <Ticket className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">Réservation rapide</h3>
              <p className="text-zinc-400">
                Réservez vos billets en quelques clics depuis votre ordinateur ou smartphone
              </p>
            </article>

            <article className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-800">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">Confirmation instantanée</h3>
              <p className="text-zinc-400">
                Recevez votre billet par email ou SMS immédiatement après votre paiement
              </p>
            </article>

            <article className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-800">
                <Armchair className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">Choix de vos sièges</h3>
              <p className="text-zinc-400">
                Sélectionnez vos places préférées directement sur le plan de la salle
              </p>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
