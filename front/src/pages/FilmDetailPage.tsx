import { Clock3, Play, Star, Ticket } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { selectIsAuthenticated } from '../features/auth/authSelectors';
import { type Film, filmsApi } from '../features/films/filmsApi';
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

const formatDayTabLabel = (dayKey: string) => {
  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString('fr-FR', { weekday: 'short' });
  return `${weekday.replace('.', '')} ${String(date.getDate()).padStart(2, '0')}`;
};

const formatDateIso = (iso: string) => {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const technologieLabel = (t: string) => (t === 'TROIS_D' ? '3D' : t === 'DEUX_D' ? '2D' : t);

const ratingStars = (rating: number) => {
  const safe = Number.isFinite(rating) ? rating : 0;
  const full = Math.max(0, Math.min(5, Math.floor(safe)));
  return Array.from({ length: 5 }, (_, index) => index < full);
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

  const [filmFromApi, setFilmFromApi] = useState<Film | null>(null);
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
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-white px-4 text-sm font-black text-zinc-950"
            >
              Retour
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <section className="relative isolate overflow-hidden border-b border-white/10">
        <img
          src={film?.poster || fallbackPoster}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30 blur-sm"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,9,11,.98)_0%,rgba(9,9,11,.86)_45%,rgba(9,9,11,.98)_100%)]" />

        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-bold text-zinc-200 transition hover:bg-white/10"
          >
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
            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-800">
                  <img
                    src={film.poster || fallbackPoster}
                    alt={film.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {film.genre && (
                      <span className="rounded-full bg-red-600/15 px-3 py-1 text-xs font-black text-red-300">
                        {film.genre}
                      </span>
                    )}
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
                      Tous publics
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-zinc-300">
                      {formatDuration(film.duration)}
                    </span>
                    {film.director && (
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-zinc-300">
                        {film.director}
                      </span>
                    )}
                  </div>

                  <h1 className="text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl">
                    {film.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center gap-1.5">
                      {ratingStars(film.note).map((filled, idx) => (
                        <Star
                          key={idx}
                          className={`h-6 w-6 ${filled ? 'fill-red-500 text-red-500' : 'text-zinc-700'}`}
                        />
                      ))}
                    </div>
                    <div className="text-2xl font-black text-white">
                      {Number.isFinite(film.note) ? film.note.toFixed(1) : '0.0'}
                    </div>
                  </div>

                  <p className="max-w-3xl text-lg leading-8 text-zinc-300">
                    {film.description || 'Aucune description disponible.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('trailer');
                        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-black text-white transition hover:bg-red-500"
                    >
                      <Play className="h-4 w-4 fill-white" />
                      Voir la bande-annonce
                    </button>

                    <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-zinc-200">
                      <Clock3 className="h-4 w-4 text-red-400" />
                      {film.isShowing ? "A l'affiche" : 'A venir'}
                    </span>
                  </div>

                  {film.actors?.length > 0 && (
                    <p className="text-sm text-zinc-400">
                      <span className="font-bold text-zinc-200">Acteurs:</span> {film.actors.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {!isFilmLoading && film && (
        <section className="bg-zinc-950">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div id="trailer" className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
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
        <section className="bg-zinc-950">
          <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black tracking-tight">Choisir une seance</h2>

            <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-900 p-6">
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {dayKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDayKey(key)}
                    className={`h-12 shrink-0 rounded-xl px-6 text-sm font-black transition ${
                      selectedDayKey === key
                        ? 'bg-red-600 text-white'
                        : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    {formatDayTabLabel(key)}
                  </button>
                ))}
              </div>

              {isSeancesLoading && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-8 text-center text-sm text-zinc-400">
                  Chargement des seances...
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
                    const timeLabel = Number.isFinite(date.getTime())
                      ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      : seance.dateHeure;

                    const tech = technologieLabel(seance.technologie);
                    const statusLabel =
                      seance.statut === 'ANNULEE'
                        ? 'Seance annulee'
                        : seance.statut === 'TERMINEE'
                          ? 'Seance terminee'
                          : seance.statut === 'EN_COURS'
                            ? 'Places limitees'
                            : 'Nombreuses places';

                    const dotColor =
                      seance.statut === 'ANNULEE'
                        ? 'bg-red-500'
                        : seance.statut === 'EN_COURS'
                          ? 'bg-amber-500'
                          : seance.statut === 'TERMINEE'
                            ? 'bg-zinc-500'
                            : 'bg-emerald-500';

                    return (
                      <div
                        key={seance.id_seance}
                        className="rounded-3xl border border-white/10 bg-zinc-950 p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-2xl font-black text-white">{film.title}</div>
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                              <span>Salle {seance.salle?.numero ?? '-'}</span>
                              <span>{formatDuration(film.duration)}</span>
                            </div>
                          </div>
                          <span className="rounded-full bg-red-600/15 px-3 py-1 text-xs font-black text-red-300">
                            {tech}
                          </span>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div>
                            <div className="text-5xl font-black leading-none">{timeLabel}</div>
                            <div className="mt-2 text-sm font-bold text-zinc-500">{formatDateIso(seance.dateHeure)}</div>
                          </div>

                          <div className="flex flex-col items-start gap-4 sm:items-end">
                            <div className="inline-flex items-center gap-2 text-sm font-bold text-zinc-300">
                              <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                              {statusLabel}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (!isAuthenticated) {
                                  navigate('/login');
                                  return;
                                }
                                // Page de reservation pas encore branchee.
                                alert('Reservation bientot disponible.');
                              }}
                              className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-6 text-sm font-black text-white transition hover:bg-red-500"
                            >
                              Reserver
                            </button>
                          </div>
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
