import { ChevronsUpDown, Filter, MapPin, SlidersHorizontal, Ticket } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import Footer from '../components/Footer';
import FilmSearchBar from '../components/FilmSearchBar';
import MovieCard from '../components/MovieCard';
import Navbar from '../components/Navbar';
import { selectAuthRole } from '../features/auth/authSelectors';
import {
  selectCinemas,
  selectCinemasError,
  selectCinemasFetchStatus,
} from '../features/cinemas/cinemasSelectors';
import { fetchCinemas } from '../features/cinemas/cinemasSlice';
import {
  selectFetchFilmsError,
  selectFetchFilmsStatus,
  selectFilms,
} from '../features/films/filmsSelectors';
import { filmsActions } from '../features/films/filmsSlice';

const fallbackPoster =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85';

const formatDuration = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return 'Duree inconnue';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h${String(mins).padStart(2, '0')}` : `${mins}min`;
};

export default function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const role = useAppSelector(selectAuthRole);
  const films = useAppSelector(selectFilms);
  const filmsStatus = useAppSelector(selectFetchFilmsStatus);
  const filmsError = useAppSelector(selectFetchFilmsError);
  const cinemas = useAppSelector(selectCinemas);
  const cinemasStatus = useAppSelector(selectCinemasFetchStatus);
  const cinemasError = useAppSelector(selectCinemasError);

  useEffect(() => {
    if (role === 'ADMIN') navigate('/admin', { replace: true });
  }, [navigate, role]);

  const [selectedCity, setSelectedCity] = useState('');
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('Tous');

  useEffect(() => {
    if (filmsStatus === 'idle') dispatch(filmsActions.fetchFilmsRequested());
    if (cinemasStatus === 'idle') dispatch(fetchCinemas());
  }, [cinemasStatus, dispatch, filmsStatus]);

  const cities = useMemo(
    () =>
      Array.from(
        new Set(
          cinemas
            .map((cinema) => cinema.ville?.trim())
            .filter((ville): ville is string => Boolean(ville)),
        ),
      ),
    [cinemas],
  );

  useEffect(() => {
    if (!selectedCity && cities.length > 0) setSelectedCity(cities[0]);
  }, [cities, selectedCity]);

  const genres = useMemo(
    () => [
      'Tous',
      ...Array.from(
        new Set(
          films
            .map((film) => film.genre?.trim())
            .filter((genre): genre is string => Boolean(genre)),
        ),
      ),
    ],
    [films],
  );

  const visibleMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return films.filter((movie) => {
      const matchesQuery =
        !normalizedQuery ||
        movie.title.toLowerCase().includes(normalizedQuery) ||
        movie.genre.toLowerCase().includes(normalizedQuery) ||
        movie.director?.toLowerCase().includes(normalizedQuery);
      const matchesGenre = activeGenre === 'Tous' || movie.genre === activeGenre;
      return matchesQuery && matchesGenre;
    });
  }, [activeGenre, query, films]);

  const isLoading = filmsStatus === 'loading' || cinemasStatus === 'loading';
  const cityLabel = selectedCity || 'votre ville';

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <img
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2200&q=85"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,9,11,.98)_0%,rgba(9,9,11,.82)_38%,rgba(9,9,11,.7)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[#09090b] to-transparent" />

        <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="mx-auto max-w-5xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Choisissez votre ville et trouvez la meilleure seance pres de vous.
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
              Selectionnez une ville et explorez le catalogue CinePass disponible.
            </p>

            <div className="mx-auto mt-8 max-w-5xl rounded-lg border border-white/10 bg-white/[0.06] p-3 text-left shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex flex-col gap-3 rounded-md border border-white/10 bg-zinc-950/75 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Votre ville</p>
                    <p className="mt-1 text-sm text-zinc-300">Les villes viennent des cinemas enregistres.</p>
                  </div>
                  <span className="rounded-md bg-white px-2.5 py-1 text-xs font-black text-zinc-950">
                    {visibleMovies.length} films
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                  <label className="relative block">
                    <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-red-400" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      disabled={cities.length === 0}
                      className="h-14 w-full appearance-none rounded-lg border border-white/10 bg-zinc-900 pl-11 pr-11 text-base font-black text-white outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      aria-label="Choisir une ville"
                    >
                      {cities.length === 0 && <option value="">Aucune ville</option>}
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <ChevronsUpDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  </label>
                  <a
                    href="#films"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-sm font-black text-white shadow-xl shadow-red-950/40 transition hover:bg-red-500"
                  >
                    <Ticket className="h-4 w-4" />
                    Voir les films
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Catalogue ── */}
      <section id="films" className="bg-[#09090b]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase text-red-400">
                <Filter className="h-4 w-4" />
                Programme cinema
              </div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Films a l affiche
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                Catalogue charge depuis <span className="font-semibold text-zinc-200">/film/all</span>.
              </p>
            </div>

            {/* ── Filtres : ville + recherche ── */}
            <div className="grid w-full gap-3 lg:w-[520px] lg:grid-cols-[180px_1fr]">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={cities.length === 0}
                className="h-12 rounded-lg border border-white/10 bg-zinc-900 px-4 text-sm font-bold text-white outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                aria-label="Filtrer par ville"
              >
                {cities.length === 0 && <option value="">Aucune ville</option>}
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* 🔍 Barre de recherche avec suggestions */}
              <FilmSearchBar
                value={query}
                onChange={setQuery}
                placeholder="Rechercher un film ou un genre"
                showSuggestions={true}
              />
            </div>
          </div>

          {/* ── Filtres genre ── */}
          <div className="sticky top-20 z-10 mb-8 space-y-4 rounded-lg border border-white/10 bg-zinc-950/90 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <SlidersHorizontal className="h-5 w-5 shrink-0 text-zinc-500" />
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setActiveGenre(genre)}
                  className={`h-10 shrink-0 rounded-lg px-4 text-sm font-bold transition ${
                    activeGenre === genre
                      ? 'bg-white text-zinc-950'
                      : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* ── Compteur ── */}
          <div className="mb-5 flex items-center justify-between text-sm text-zinc-400">
            <span>
              {visibleMovies.length} film{visibleMovies.length > 1 ? 's' : ''} disponible
              {visibleMovies.length > 1 ? 's' : ''}
            </span>
            <span className="hidden sm:inline-flex">Selection cinema: {cityLabel}</span>
          </div>

          {/* ── Erreurs ── */}
          {(filmsError || cinemasError) && (
            <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              {filmsError || cinemasError}
            </div>
          )}

          {/* ── Loading ── */}
          {isLoading && (
            <div className="rounded-lg border border-white/10 bg-zinc-900 p-10 text-center text-zinc-400">
              Chargement du catalogue...
            </div>
          )}

          {/* ── Grille films ── */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {!isLoading &&
              visibleMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  title={movie.title}
                  genre={movie.genre}
                  rating={String(movie.note ?? 0)}
                  image={movie.poster || fallbackPoster}
                  duration={formatDuration(movie.duration)}
                  badge={movie.isShowing ? 'A l affiche' : 'A venir'}
                  format={movie.statut === 'EN_COURS' ? 'Maintenant' : 'Bientot'}
                  language="Catalogue"
                  times={[]}
                  onDetails={() => navigate(`/films/${movie.id}`)}
                />
              ))}
          </div>

          {/* ── Empty state ── */}
          {!isLoading && visibleMovies.length === 0 && (
            <div className="rounded-lg border border-white/10 bg-zinc-900 p-10 text-center">
              <h3 className="text-xl font-black text-white">Aucun film trouve</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Essayez un autre genre, format ou mot cle.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-white/10 bg-zinc-950">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            [String(films.length), 'films au catalogue'],
            [String(cinemas.length), 'cinemas disponibles'],
            ['24/7', 'reservation en ligne'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg bg-white/[0.03] p-5">
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="mt-1 text-sm font-medium text-zinc-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}