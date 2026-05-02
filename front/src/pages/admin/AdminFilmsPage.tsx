import { useEffect, useState } from 'react';
import { Edit2, Film, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { filmsActions } from '../../features/films/filmsSlice';
import {
  selectFilms,
  selectFetchFilmsStatus,
  selectFetchFilmsError,
  selectCreateFilmStatus,
  selectCreateFilmError,
  selectUpdateFilmStatus,
  selectUpdateFilmError,
  selectDeleteFilmStatus,
  selectDeleteFilmError,
} from '../../features/films/filmsSelectors';
import type { Film as FilmType, CreateFilmDto, UpdateFilmDto } from '../../features/films/filmsApi';

// ─── Types locaux (UI) ────────────────────────────────────────────────────────
interface FilmForm {
  titre: string;
  genre: string;
  duree: number;
  realisateur: string;
  annee: number;
  synopsis: string;
  affiche: string;
  statut: 'actif' | 'inactif';
  note: number;
}

const GENRES = ['Action', 'Animation', 'Aventure', 'Comédie', 'Documentaire', 'Drame', 'Horreur', 'Romance', 'Sci-Fi', 'Thriller', 'Fantaisie'];

const EMPTY_FORM: FilmForm = {
  titre: '', genre: 'Action', duree: 90, realisateur: '',
  annee: new Date().getFullYear(), synopsis: '', affiche: '', statut: 'actif', note: 7.0,
};

// Convertit un Film du store en FilmForm pour le modal
const filmToForm = (film: FilmType): FilmForm => ({
  titre: film.title,
  genre: film.genre,
  duree: film.duration,
  realisateur: film.director,
  annee: film.releaseDate ? new Date(film.releaseDate).getFullYear() : new Date().getFullYear(),
  synopsis: film.description,
  affiche: film.poster,
  statut: film.isShowing ? 'actif' : 'inactif',
  note: film.note,
});

// Convertit un FilmForm en DTO backend
const formToDto = (form: FilmForm): CreateFilmDto => ({
  title: form.titre,
  description: form.synopsis || '',
  duration: form.duree,
  releaseDate: new Date(form.annee, 0, 1),
  director: form.realisateur,
  actors: [],
  genre: form.genre,
  poster: form.affiche || '',
  trailer: '',
  note: form.note,
  isShowing: form.statut === 'actif',
});

// ─── Modal ────────────────────────────────────────────────────────────────────
function FilmModal({
  open, onClose, onSave, initial, title, isLoading, error,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: FilmForm) => void;
  initial: FilmForm;
  title: string;
  isLoading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState(initial);
  useEffect(() => { if (open) setForm(initial); }, [open, initial]);

  if (!open) return null;
  const set = (key: keyof FilmForm, val: unknown) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 transition hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-600/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Titre *</label>
            <input type="text" value={form.titre} onChange={(e) => set('titre', e.target.value)}
              placeholder="Titre du film"
              className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-600 outline-none ring-red-500/60 transition focus:ring-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Réalisateur *</label>
              <input type="text" value={form.realisateur} onChange={(e) => set('realisateur', e.target.value)}
                placeholder="Nom"
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-600 outline-none ring-red-500/60 transition focus:ring-2" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Année</label>
              <input type="number" value={form.annee} onChange={(e) => set('annee', Number(e.target.value))}
                min={1900} max={2100}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Genre</label>
              <select value={form.genre} onChange={(e) => set('genre', e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2">
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Durée (min)</label>
              <input type="number" value={form.duree} onChange={(e) => set('duree', Number(e.target.value))} min={1}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Note (/10)</label>
              <input type="number" value={form.note} onChange={(e) => set('note', Number(e.target.value))}
                min={0} max={10} step={0.1}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Statut</label>
              <select value={form.statut} onChange={(e) => set('statut', e.target.value as FilmForm['statut'])}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2">
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">URL de l'affiche</label>
            <input type="text" value={form.affiche} onChange={(e) => set('affiche', e.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-600 outline-none ring-red-500/60 transition focus:ring-2" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Synopsis</label>
            <textarea value={form.synopsis} onChange={(e) => set('synopsis', e.target.value)}
              rows={3} placeholder="Description..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-600 outline-none ring-red-500/60 transition focus:ring-2" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose}
            className="rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white">
            Annuler
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.titre.trim() || !form.realisateur.trim() || isLoading}
            className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-40">
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AdminFilmsPage() {
  const dispatch = useAppDispatch();
  const films = useAppSelector(selectFilms);
  const fetchStatus = useAppSelector(selectFetchFilmsStatus);
  const fetchError = useAppSelector(selectFetchFilmsError);
  const createStatus = useAppSelector(selectCreateFilmStatus);
  const createError = useAppSelector(selectCreateFilmError);
  const updateStatus = useAppSelector(selectUpdateFilmStatus);
  const updateError = useAppSelector(selectUpdateFilmError);
  const deleteStatus = useAppSelector(selectDeleteFilmStatus);
  const deleteError = useAppSelector(selectDeleteFilmError);

  const [search, setSearch] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [modal, setModal] = useState<{ open: boolean; film: FilmType | null }>({ open: false, film: null });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (fetchStatus === 'idle') {
      dispatch(filmsActions.fetchFilmsRequested());
    }
  }, [dispatch, fetchStatus]);

  // Fermer le modal quand create/update réussit
  useEffect(() => {
    if (createStatus === 'succeeded' || updateStatus === 'succeeded') {
      setModal({ open: false, film: null });
    }
  }, [createStatus, updateStatus]);

  const handleSave = (form: FilmForm) => {
    const dto = formToDto(form);
    if (modal.film) {
      const updateDto = dto;
      dispatch(filmsActions.updateFilmRequested({ id: modal.film.id, film: updateDto }));
    } else {
      dispatch(filmsActions.createFilmRequested(dto));
    }
  };

  const handleToggleStatut = (film: FilmType) => {
    dispatch(filmsActions.updateFilmRequested({
      id: film.id,
      film: { isShowing: !film.isShowing },
    }));
  };

  const handleDelete = () => {
    if (deleteId !== null) {
      dispatch(filmsActions.deleteFilmRequested(deleteId));
      setDeleteId(null);
    }
  };

  const filtered = films.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = f.title.toLowerCase().includes(q) || f.director.toLowerCase().includes(q);
    const matchGenre = filterGenre ? f.genre === filterGenre : true;
    const matchStatut = filterStatut
      ? filterStatut === 'actif' ? f.isShowing : !f.isShowing
      : true;
    return matchSearch && matchGenre && matchStatut;
  });

  const isModalLoading = createStatus === 'loading' || updateStatus === 'loading';
  const modalError = modal.film ? updateError : createError;

  return (
    <div className="relative">
      {/* ── Header ── */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Films</h1>
          <p className="mt-2 text-zinc-400">
            {films.length} film{films.length > 1 ? 's' : ''} au catalogue
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, film: null })}
          className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ajouter un film
        </button>
      </header>

      {/* ── Erreurs globales ── */}
      {fetchError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-600/10 px-4 py-2 text-sm text-red-400">
          {fetchError}
        </div>
      )}
      {deleteError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-600/10 px-4 py-2 text-sm text-red-400">
          {deleteError}
        </div>
      )}

      {/* ── Stats ── */}
      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total', value: films.length, color: 'text-white' },
          { label: 'Actifs', value: films.filter((f) => f.isShowing).length, color: 'text-emerald-400' },
          { label: 'Inactifs', value: films.filter((f) => !f.isShowing).length, color: 'text-zinc-400' },
          {
            label: 'Note moy.',
            value: films.length > 0 ? `${(films.reduce((a, f) => a + f.note, 0) / films.length).toFixed(1)}/10` : '-',
            color: 'text-amber-400',
          },
        ].map((s) => (
          <article key={s.label} className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 shadow-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{s.label}</p>
            <p className={`mt-2 text-3xl font-black tracking-tight ${s.color}`}>{s.value}</p>
          </article>
        ))}
      </section>

      {/* ── Filtres ── */}
      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un film ou réalisateur..."
            className="w-full rounded-xl border border-white/10 bg-zinc-800/70 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none ring-red-500/60 transition focus:ring-2" />
        </div>
        <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-800/70 px-3 py-2.5 text-sm text-white outline-none ring-red-500/60 transition focus:ring-2">
          <option value="">Tous les genres</option>
          {GENRES.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-800/70 px-3 py-2.5 text-sm text-white outline-none ring-red-500/60 transition focus:ring-2">
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 shadow-2xl">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {['Film', 'Genre', 'Durée', 'Réalisateur', 'Année', 'Note', 'Statut', ''].map((h) => (
                <th key={h} className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-widest text-zinc-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fetchStatus === 'loading' ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-zinc-500">Chargement des films...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-zinc-500">Aucun film trouvé</td>
              </tr>
            ) : (
              filtered.map((film) => (
                <tr key={film.id} className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {film.poster ? (
                        <img src={film.poster} alt={film.title} className="h-12 w-9 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-12 w-9 items-center justify-center rounded-lg bg-red-600/15 text-red-400">
                          <Film className="h-4 w-4" aria-hidden="true" />
                        </div>
                      )}
                      <span className="font-semibold text-white">{film.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-lg bg-white/8 px-2.5 py-1 text-xs font-medium text-zinc-300">{film.genre}</span>
                  </td>
                  <td className="px-4 py-4 text-zinc-400">
                    {Math.floor(film.duration / 60)}h{String(film.duration % 60).padStart(2, '0')}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{film.director}</td>
                  <td className="px-4 py-4 text-zinc-500">
                    {film.releaseDate ? new Date(film.releaseDate).getFullYear() : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                      <span className="font-semibold text-white">{film.note}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggleStatut(film)}
                      disabled={updateStatus === 'loading'}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-50
                        ${film.isShowing
                          ? 'bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25'
                          : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'
                        }`}
                    >
                      {film.isShowing ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModal({ open: true, film })}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/20 hover:text-white"
                        title="Modifier"
                      >
                        <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setDeleteId(film.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10 text-red-400 transition hover:bg-red-600/20"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal Créer / Modifier ── */}
      <FilmModal
        open={modal.open}
        onClose={() => setModal({ open: false, film: null })}
        onSave={handleSave}
        initial={modal.film ? filmToForm(modal.film) : EMPTY_FORM}
        title={modal.film ? 'Modifier le film' : 'Ajouter un film'}
        isLoading={isModalLoading}
        error={modalError}
      />

      {/* ── Modal Supprimer ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/15 text-red-400">
              <Trash2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-black">Supprimer ce film ?</h3>
            <p className="mt-2 text-sm text-zinc-400">Cette action est irréversible.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setDeleteId(null)}
                className="rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white">
                Annuler
              </button>
              <button onClick={handleDelete} disabled={deleteStatus === 'loading'}
                className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50">
                {deleteStatus === 'loading' ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setModal({ open: true, film: null })}
        className="fixed bottom-8 right-8 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl transition hover:bg-red-500"
        aria-label="Ajouter un film"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}