import {
  Armchair,
  ArrowLeft,
  Calendar,
  Clock3,
  DoorOpen,
  Film as FilmIcon,
  Play,
  Star,
  Ticket,
  User,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { selectIsAuthenticated } from '../features/auth/authSelectors';
import { type Film as FilmType, filmsApi } from '../features/films/filmsApi';
import {
  selectFetchFilmsError,
  selectFetchFilmsStatus,
  selectFilms,
} from '../features/films/filmsSelectors';
import { filmsActions } from '../features/films/filmsSlice';
import {
  selectFetchSeancesError,
  selectFetchSeancesStatus,
  selectSeances,
} from '../features/seances/seancesSelectors';
import { seancesActions } from '../features/seances/seancesSlice';

const fallbackPoster =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85';

const formatDuration = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return 'Duree inconnue';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h${String(mins).padStart(2, '0')}` : `${mins}min`;
};

const formatDayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDayLabel = (dayKey: string) => {
  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
};

const formatDateIso = (iso: string) => {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTime = (date: Date) =>
  Number.isFinite(date.getTime())
    ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';

const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60_000);

const initialsFromName = (name: string) => {
  const words = name
    .split(' ')
    .map((w) => w.trim())
    .filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words[words.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase() || '?';
};

const formatReleaseDate = (iso: string) => {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return '-';
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' });
};

const formatStatutLabel = (statut: FilmType['statut'] | undefined) => {
  if (statut === 'EN_COURS') return 'En cours';
  if (statut === 'A_VENIR') return 'A venir';
  return '-';
};

const ratingStars = (rating: number) => {
  const safe = Number.isFinite(rating) ? rating : 0;
  const full = Math.max(0, Math.min(10, Math.floor(safe)));
  return Array.from({ length: 10 }, (_, index) => index < full);
};

const techBadgeStyle = (raw: string) => {
  const t = (raw ?? '').toUpperCase();
  if (t.includes('IMAX')) return { label: raw, className: 'bg-indigo-500/15 text-indigo-200 border-indigo-500/20' };
  if (t.includes('3D')) return { label: raw, className: 'bg-sky-500/15 text-sky-200 border-sky-500/20' };
  return { label: raw, className: 'bg-white/5 text-zinc-200 border-white/10' };
};

const dayStripParts = (dayKey: string) => {
  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
  return { weekday, day, month };
};

const toTrailerEmbedUrl = (rawUrl: string) => {
  const url = rawUrl?.trim();
  if (!url) return '';

  // YouTube: watch?v=..., youtu.be/..., shorts/...
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (youtubeMatch?.[1]) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  // If it already looks embeddable, keep it.
  return url;
};

export default function FilmDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const filmId = Number(id);

  const films = useAppSelector(selectFilms);
  const filmsStatus = useAppSelector(selectFetchFilmsStatus);
  const filmsError = useAppSelector(selectFetchFilmsError);

  const seances = useAppSelector(selectSeances);
  const seancesStatus = useAppSelector(selectFetchSeancesStatus);
  const seancesError = useAppSelector(selectFetchSeancesError);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const filmFromStore = useMemo(() => {
    if (!Number.isFinite(filmId)) return undefined;
    return films.find((f) => f.id === filmId);
  }, [filmId, films]);

  const [filmFromApi, setFilmFromApi] = useState<FilmType | null>(null);
  const [filmLoadError, setFilmLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(filmId)) return;
    if (filmsStatus === 'idle') dispatch(filmsActions.fetchFilmsRequested());
    if (seancesStatus === 'idle') dispatch(seancesActions.fetchSeancesRequested());
  }, [dispatch, filmId, filmsStatus, seancesStatus]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!Number.isFinite(filmId)) return;
      if (filmFromStore) return;

      try {
        setFilmLoadError(null);
        const film = await filmsApi.getById(filmId);
        if (!cancelled) setFilmFromApi(film);
      } catch (error) {
        if (!cancelled) setFilmLoadError((error as Error).message);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [filmFromStore, filmId]);

  const film = filmFromStore ?? filmFromApi;

  const seancesForFilm = useMemo(() => {
    if (!Number.isFinite(filmId)) return [];
    const list = Array.isArray(seances) ? seances : [];
    return list
      .filter((s) => s.film?.id === filmId)
      .slice()
      .sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime());
  }, [filmId, seances]);

  const dayKeys = useMemo(() => {
    const keys = new Set<string>();
    seancesForFilm.forEach((s) => {
      const date = new Date(s.dateHeure);
      if (Number.isFinite(date.getTime())) keys.add(formatDayKey(date));
    });
    return Array.from(keys).sort();
  }, [seancesForFilm]);

  const [selectedDayKey, setSelectedDayKey] = useState<string>('');

  useEffect(() => {
    if (!selectedDayKey && dayKeys.length > 0) setSelectedDayKey(dayKeys[0]);
  }, [dayKeys, selectedDayKey]);

  const seancesForSelectedDay = useMemo(() => {
    if (!selectedDayKey) return [];
    return seancesForFilm.filter((s) => formatDayKey(new Date(s.dateHeure)) === selectedDayKey);
  }, [seancesForFilm, selectedDayKey]);

  const isFilmLoading = filmsStatus === 'loading' || (!film && !filmLoadError && Number.isFinite(filmId));
  const isSeancesLoading = seancesStatus === 'loading';

  const trailerUrl = film?.trailer ? toTrailerEmbedUrl(film.trailer) : '';

  const [animateRating, setAnimateRating] = useState(false);
  useEffect(() => {
    setAnimateRating(false);
    if (!film) return;
    const id = window.setTimeout(() => setAnimateRating(true), 50);
    return () => window.clearTimeout(id);
  }, [film?.id]);

  if (!Number.isFinite(filmId)) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
            <h1 className="text-2xl font-black">Film introuvable</h1>
            <p className="mt-2 text-sm text-zinc-400">Identifiant invalide.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-zinc-950"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinema-bg text-white">
      <Navbar />

      {!isFilmLoading && film && (
        <div className="sticky top-[72px] z-20 border-b border-white/10 bg-cinema-bg/70 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <div className="truncate font-display text-xl tracking-wide text-white sm:text-2xl">
                {film.title}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-400">
                <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1">
                  <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" aria-hidden="true" />
                  {Number.isFinite(film.note) ? `${film.note.toFixed(1)}/10` : '0.0/10'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDuration(film.duration)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('sessions');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="hidden h-10 items-center justify-center rounded-xl bg-cinema-red px-4 text-sm font-black text-white transition hover:brightness-110 sm:inline-flex"
            >
              Reserver
            </button>
          </div>
        </div>
      )}

      <section className="relative isolate overflow-hidden border-b border-white/10">
        <img
          src={film?.poster || fallbackPoster}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(20,20,20,.65)_0%,rgba(20,20,20,.85)_55%,rgba(20,20,20,1)_100%)]" />

        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-bold text-zinc-200 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour
          </button>

          {isFilmLoading && (
            <div className="rounded-lg border border-white/10 bg-zinc-900 p-10 text-center text-zinc-400">
              Chargement du film...
            </div>
          )}

          {!isFilmLoading && (filmsError || filmLoadError || seancesError) && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              {filmsError || filmLoadError || seancesError}
            </div>
          )}

          {!isFilmLoading && !film && (
            <div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
              <h1 className="text-2xl font-black">Film introuvable</h1>
              <p className="mt-2 text-sm text-zinc-400">Ce film n'existe pas ou a ete supprime.</p>
            </div>
          )}

          {!isFilmLoading && film && (
            <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
              <div className="animate-fade-up">
                <div
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-cinema-card/70 p-3 shadow-2xl shadow-black/60 backdrop-blur-xl"
                  title="Affiche du film"
                >
                  <div
                    className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-black/30 transition duration-500 [transform-style:preserve-3d] group-hover:[transform:perspective(900px)_rotateX(4deg)_rotateY(-7deg)_translateY(-6px)]"
                  >
                    <img
                      src={film.poster || fallbackPoster}
                      alt={film.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 animate-fade-up">
                <div className="flex flex-wrap items-center gap-2">
                  {film.genre && (
                    <span
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-zinc-200"
                      title="Genre"
                    >
                      <FilmIcon className="h-3.5 w-3.5 text-cinema-red" aria-hidden="true" />
                      {film.genre}
                    </span>
                  )}
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-zinc-200"
                    title="Classification"
                  >
                    <Users className="h-3.5 w-3.5 text-cinema-red" aria-hidden="true" />
                    Tous publics
                  </span>
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-zinc-200"
                    title="Duree"
                  >
                    <Clock3 className="h-3.5 w-3.5 text-cinema-red" aria-hidden="true" />
                    {formatDuration(film.duration)}
                  </span>
                  {film.director && (
                    <span
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-zinc-200"
                      title="Realisateur"
                    >
                      <User className="h-3.5 w-3.5 text-cinema-red" aria-hidden="true" />
                      {film.director}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
                  {film.title}
                </h1>

                <div
                  className="inline-flex items-center gap-2 rounded-xl bg-black/70 px-3 py-2 text-lg font-black text-amber-300 backdrop-blur"
                  title="Note"
                >
                  <Star className="h-5 w-5 fill-amber-300 text-amber-300" aria-hidden="true" />
                  <span className="text-white">
                    {Number.isFinite(film.note) ? `${film.note.toFixed(1)}` : '0.0'}
                  </span>
                  <span className="text-zinc-300">/10</span>
                </div>

                <p className="max-w-3xl text-lg leading-8 text-zinc-300">
                  {film.description || 'Aucune description disponible.'}
                </p>

                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  <span className="shrink-0 text-xs font-black uppercase tracking-wide text-zinc-500">Casting</span>
                  {film.actors?.length > 0 ? (
                    film.actors.slice(0, 8).map((actor: string) => (
                      <div
                        key={actor}
                        className="inline-flex items-center gap-2"
                        title={actor}
                        aria-label={actor}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-black text-white">
                          {initialsFromName(actor)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm font-bold text-zinc-400">Casting indisponible</span>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      label: 'Date de sortie',
                      value: film.releaseDate ? formatReleaseDate(film.releaseDate) : '-',
                      title: 'Date de sortie officielle',
                    },
                    {
                      label: 'Statut',
                      value: formatStatutLabel(film.statut),
                      title: 'Statut du film',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-cinema-card/60 p-4 backdrop-blur-xl"
                      title={item.title}
                    >
                      <p className="text-xs font-black uppercase tracking-wide text-zinc-500">{item.label}</p>
                      <p className="mt-1 text-sm font-bold text-zinc-100">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('trailer');
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cinema-red px-6 text-sm font-black text-white transition hover:brightness-110"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    Voir la bande-annonce
                  </button>

                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-zinc-200">
                    <Clock3 className="h-4 w-4 text-cinema-red" />
                    {film.isShowing ? "A l'affiche" : 'A venir'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {!isFilmLoading && film && (
        <section className="bg-cinema-bg">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div id="trailer" className="rounded-3xl border border-white/10 bg-cinema-card/60 p-6 backdrop-blur-xl animate-fade-up">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black">Bande-annonce</h2>
                {film.trailer && (
                  <a
                    href={film.trailer}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-zinc-200 transition hover:bg-white/10"
                  >
                    <Play className="h-4 w-4" />
                    Ouvrir
                  </a>
                )}
              </div>

              {trailerUrl ? (
                <div className="mt-4 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <iframe
                    src={trailerUrl}
                    title={`Bande annonce ${film.title}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-400">Aucune bande-annonce disponible.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {!isFilmLoading && film && (
        <section id="sessions" className="bg-cinema-bg">
          <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black tracking-tight animate-fade-up">Choisir une seance</h2>

            <div className="mt-6 rounded-3xl border border-white/10 bg-cinema-card/60 p-6 backdrop-blur-xl animate-fade-up">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {dayKeys.map((key) => {
                  const parts = dayStripParts(key);
                  const selected = selectedDayKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDayKey(key)}
                      className={`shrink-0 snap-start rounded-2xl border px-4 py-3 text-left transition ${
                        selected
                          ? 'border-cinema-red/40 bg-cinema-red/15 text-white'
                          : 'border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10'
                      }`}
                      title={formatDayLabel(key)}
                    >
                      <div className="text-xs font-black uppercase tracking-wide text-zinc-400">
                        {parts.weekday}
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <div className="text-lg font-black leading-none">{parts.day}</div>
                        <div className="text-xs font-bold text-zinc-400">{parts.month}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {isSeancesLoading && (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-3xl border border-white/10 bg-cinema-bg/40 p-6 backdrop-blur-xl animate-pulse"
                    >
                      <div className="h-6 w-32 rounded bg-white/10" />
                      <div className="mt-4 h-12 w-44 rounded bg-white/10" />
                      <div className="mt-3 h-4 w-40 rounded bg-white/10" />
                      <div className="mt-8 h-3 w-full rounded bg-white/10" />
                      <div className="mt-6 h-11 w-40 rounded-xl bg-white/10" />
                    </div>
                  ))}
                </div>
              )}

              {!isSeancesLoading && dayKeys.length === 0 && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-8 text-center text-sm text-zinc-400">
                  Aucune seance disponible pour ce film.
                </div>
              )}

              {!isSeancesLoading && dayKeys.length > 0 && (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {seancesForSelectedDay.map((seance) => {
                    const date = new Date(seance.dateHeure);
                    const startTime = Number.isFinite(date.getTime()) ? formatTime(date) : seance.dateHeure;
                    const endTime = Number.isFinite(date.getTime()) ? formatTime(addMinutes(date, film.duration)) : '';

                    const tech = techBadgeStyle(seance.technologie);
                    const totalSeats =
                      (seance.totalSeats ?? seance.salle?.capaciteTotale ?? null) as number | null;
                    const reservedSeats = (seance.reservedSeats ?? 0) as number;
                    const remainingSeats =
                      (seance.remainingSeats ??
                        (typeof totalSeats === 'number' ? totalSeats - reservedSeats : null)) as
                        | number
                        | null;

                    const safeTotal = typeof totalSeats === 'number' && Number.isFinite(totalSeats) ? totalSeats : null;
                    const safeRemaining =
                      typeof remainingSeats === 'number' && Number.isFinite(remainingSeats)
                        ? Math.max(0, remainingSeats)
                        : null;

                    const ratio =
                      safeTotal && safeTotal > 0 && typeof safeRemaining === 'number'
                        ? safeRemaining / safeTotal
                        : null;

                    const availabilityLabel = (() => {
                      if (seance.statut === 'ANNULEE') return 'Séance annulée';
                      if (seance.statut === 'TERMINEE') return 'Séance terminée';
                      if (ratio === null) return 'Places disponibles';
                      if (safeRemaining !== null && safeRemaining <= Math.max(5, Math.ceil(safeTotal! * 0.1))) {
                        return 'Dernières places';
                      }
                      if (ratio <= 0.35) return 'Places limitées';
                      return 'Nombreuses places';
                    })();

                    const dotColor = (() => {
                      if (seance.statut === 'ANNULEE') return 'bg-red-500';
                      if (seance.statut === 'TERMINEE') return 'bg-zinc-500';
                      if (ratio === null) return 'bg-emerald-500';
                      if (availabilityLabel === 'Dernières places') return 'bg-red-500';
                      if (availabilityLabel === 'Places limitées') return 'bg-amber-500';
                      return 'bg-emerald-500';
                    })();

                    const seatsLine =
                      seance.statut === 'PROGRAMMEE' && safeTotal && typeof safeRemaining === 'number'
                        ? `${safeRemaining}/${safeTotal} places disponibles`
                        : null;

                    const reservedLine =
                      seance.statut === 'PROGRAMMEE' && safeTotal
                        ? `${Math.max(0, reservedSeats)}/${safeTotal}`
                        : null;

                    const reservedPct =
                      seance.statut === 'PROGRAMMEE' && safeTotal && safeTotal > 0
                        ? Math.max(0, Math.min(100, (Math.max(0, reservedSeats) / safeTotal) * 100))
                        : null;

                    const isDisabled = seance.statut !== 'PROGRAMMEE';

                    return (
                      <div
                        key={seance.id_seance}
                        className="rounded-3xl border border-white/10 bg-cinema-bg/40 p-6 backdrop-blur-xl transition hover:border-white/20"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 text-sm font-bold text-zinc-300">
                              <DoorOpen className="h-4 w-4 text-cinema-red" aria-hidden="true" />
                              Salle {seance.salle?.numero ?? '-'}
                            </div>
                            <div className="text-5xl font-black leading-none text-white">
                              {startTime}
                              {endTime && <span className="text-2xl font-bold text-zinc-400"> → {endTime}</span>}
                            </div>
                            <div className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400">
                              <Calendar className="h-4 w-4" aria-hidden="true" />
                              {formatDateIso(seance.dateHeure)}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-black ${tech.className}`}
                              title="Format de projection"
                            >
                              {tech.label}
                            </span>
                            <div className="inline-flex items-center gap-2 text-sm font-bold text-zinc-300">
                              <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                              {availabilityLabel}
                            </div>
                          </div>
                        </div>

                        {reservedLine && reservedPct !== null && (
                          <div className="mt-6">
                            <div className="flex items-center justify-between text-sm font-bold text-zinc-300">
                              <span>Occupation</span>
                              <span className="inline-flex items-center gap-2 rounded-md bg-black/40 px-2 py-1 text-amber-300">
                                <Armchair className="h-4 w-4 text-amber-300" aria-hidden="true" />
                                {reservedLine}
                              </span>
                            </div>
                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-cinema-red transition-[width] duration-700"
                                style={{ width: `${reservedPct}%` }}
                              />
                            </div>
                            {seatsLine && <div className="mt-2 text-sm font-bold text-zinc-400">{seatsLine}</div>}
                          </div>
                        )}

                        <div className="mt-6 flex items-center justify-between gap-3">
                          <div className="text-sm font-bold text-zinc-500">{formatDuration(film.duration)}</div>
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (!isAuthenticated) {
                                navigate('/login');
                                return;
                              }
                              if (isDisabled) return;
                              navigate(`/seances/${seance.id_seance}/seats`, {
                                state: {
                                  seance,
                                  film: {
                                    id: film.id,
                                    title: film.title,
                                    poster: film.poster,
                                    duration: film.duration,
                                  },
                                },
                              });
                            }}
                            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-black text-white transition ${
                              isDisabled
                                ? 'cursor-not-allowed bg-white/10 text-zinc-400'
                                : 'bg-cinema-red hover:brightness-110 animate-pulse-soft'
                            }`}
                          >
                            <Ticket className="h-4 w-4" aria-hidden="true" />
                            Reserver
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isAuthenticated && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                  Connectez-vous pour reserver.
                </div>
              )}
            </div>
          </div>
        </section>
      )}


      <Footer />
    </div>
  );
}
