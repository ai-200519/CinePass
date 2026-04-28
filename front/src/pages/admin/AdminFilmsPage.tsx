import { useState } from 'react';
import { Edit2, Film, Plus, Search, Star, Trash2, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FilmData {
  id: number;
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

const GENRES = ['Action', 'Animation', 'Aventure', 'Comédie', 'Documentaire', 'Drame', 'Horreur', 'Romance', 'Thriller'];

const MOCK_FILMS: FilmData[] = [
  { id: 1, titre: 'Apocalypse Stellaire', genre: 'Sci-Fi', duree: 138, realisateur: 'Luc Martin', annee: 2024, synopsis: 'Une expédition spatiale tourne au cauchemar aux confins de la galaxie.', affiche: 'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&w=300&q=80', statut: 'actif', note: 8.4 },
  { id: 2, titre: 'Les Ombres du Passé', genre: 'Thriller', duree: 112, realisateur: 'Sophie Renard', annee: 2024, synopsis: 'Un détective rouvre une affaire classée qui cache de lourds secrets.', affiche: 'https://images.unsplash.com/photo-1619347903021-4d286ec4e8f1?auto=format&fit=crop&w=300&q=80', statut: 'actif', note: 7.9 },
  { id: 3, titre: 'Royaume des Étoiles', genre: 'Fantaisie', duree: 155, realisateur: 'Karim Youssef', annee: 2023, synopsis: 'Un jeune héros part à la conquête d\'un royaume oublié entre les étoiles.', affiche: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=300&q=80', statut: 'actif', note: 8.1 },
  { id: 4, titre: 'La Dernière Séance', genre: 'Drame', duree: 98, realisateur: 'Claire Dubois', annee: 2023, synopsis: 'Un cinéma de quartier menacé de fermeture et ses habitants qui se mobilisent.', affiche: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=300&q=80', statut: 'inactif', note: 7.5 },
  { id: 5, titre: 'Légende Urbaine', genre: 'Action', duree: 120, realisateur: 'Marc Fontaine', annee: 2024, synopsis: 'Un ancien combattant doit protéger sa ville contre une organisation criminelle.', affiche: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80', statut: 'actif', note: 7.2 },
];

const EMPTY: Omit<FilmData, 'id'> = {
  titre: '', genre: 'Action', duree: 90, realisateur: '',
  annee: new Date().getFullYear(), synopsis: '', affiche: '', statut: 'actif', note: 7.0,
};

// ─── Composant Modal ──────────────────────────────────────────────────────────
function FilmModal({
  open,
  onClose,
  onSave,
  initial,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<FilmData, 'id'>) => void;
  initial: Omit<FilmData, 'id'>;
  title: string;
}) {
  const [form, setForm] = useState(initial);

  // Sync when modal reopens with different data
  if (!open) return null;

  const set = (key: keyof typeof form, val: unknown) =>
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

        <div className="space-y-4">
          {/* Titre */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
              Titre *
            </label>
            <input
              type="text"
              value={form.titre}
              onChange={(e) => set('titre', e.target.value)}
              placeholder="Titre du film"
              className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-600 outline-none ring-red-500/60 transition focus:ring-2"
            />
          </div>

          {/* Réalisateur + Année */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Réalisateur *
              </label>
              <input
                type="text"
                value={form.realisateur}
                onChange={(e) => set('realisateur', e.target.value)}
                placeholder="Nom"
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-600 outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Année
              </label>
              <input
                type="number"
                value={form.annee}
                onChange={(e) => set('annee', Number(e.target.value))}
                min={1900}
                max={2100}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>
          </div>

          {/* Genre + Durée */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Genre
              </label>
              <select
                value={form.genre}
                onChange={(e) => set('genre', e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              >
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Durée (min)
              </label>
              <input
                type="number"
                value={form.duree}
                onChange={(e) => set('duree', Number(e.target.value))}
                min={1}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>
          </div>

          {/* Note + Statut */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Note (/10)
              </label>
              <input
                type="number"
                value={form.note}
                onChange={(e) => set('note', Number(e.target.value))}
                min={0}
                max={10}
                step={0.1}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Statut
              </label>
              <select
                value={form.statut}
                onChange={(e) => set('statut', e.target.value as FilmData['statut'])}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>

          {/* URL Affiche */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
              URL de l'affiche
            </label>
            <input
              type="text"
              value={form.affiche}
              onChange={(e) => set('affiche', e.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-600 outline-none ring-red-500/60 transition focus:ring-2"
            />
          </div>

          {/* Synopsis */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
              Synopsis
            </label>
            <textarea
              value={form.synopsis}
              onChange={(e) => set('synopsis', e.target.value)}
              rows={3}
              placeholder="Description..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-600 outline-none ring-red-500/60 transition focus:ring-2"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            Annuler
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            disabled={!form.titre.trim() || !form.realisateur.trim()}
            className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AdminFilmsPage() {
  const [films, setFilms] = useState<FilmData[]>(MOCK_FILMS);
  const [search, setSearch] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [modal, setModal] = useState<{ open: boolean; film: FilmData | null }>({ open: false, film: null });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = films.filter((f) => {
    const q = search.toLowerCase();
    return (
      (f.titre.toLowerCase().includes(q) || f.realisateur.toLowerCase().includes(q)) &&
      (filterGenre ? f.genre === filterGenre : true) &&
      (filterStatut ? f.statut === filterStatut : true)
    );
  });

  const handleSave = (data: Omit<FilmData, 'id'>) => {
    if (modal.film) {
      setFilms((prev) => prev.map((f) => (f.id === modal.film!.id ? { ...data, id: modal.film!.id } : f)));
    } else {
      setFilms((prev) => [...prev, { ...data, id: Math.max(0, ...prev.map((f) => f.id)) + 1 }]);
    }
  };

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

      {/* ── Stats ── */}
      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total', value: films.length, color: 'text-white' },
          { label: 'Actifs', value: films.filter((f) => f.statut === 'actif').length, color: 'text-emerald-400' },
          { label: 'Inactifs', value: films.filter((f) => f.statut === 'inactif').length, color: 'text-zinc-400' },
          { label: 'Note moy.', value: `${(films.reduce((a, f) => a + f.note, 0) / films.length).toFixed(1)}/10`, color: 'text-amber-400' },
        ].map((s) => (
          <article
            key={s.label}
            className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 shadow-2xl"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{s.label}</p>
            <p className={`mt-2 text-3xl font-black tracking-tight ${s.color}`}>{s.value}</p>
          </article>
        ))}
      </section>

      {/* ── Filtres ── */}
      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un film ou réalisateur..."
            className="w-full rounded-xl border border-white/10 bg-zinc-800/70 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none ring-red-500/60 transition focus:ring-2"
          />
        </div>
        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-800/70 px-3 py-2.5 text-sm text-white outline-none ring-red-500/60 transition focus:ring-2"
        >
          <option value="">Tous les genres</option>
          {GENRES.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-800/70 px-3 py-2.5 text-sm text-white outline-none ring-red-500/60 transition focus:ring-2"
        >
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
                <th
                  key={h}
                  className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-widest text-zinc-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-zinc-500">
                  Aucun film trouvé
                </td>
              </tr>
            ) : (
              filtered.map((film) => (
                <tr
                  key={film.id}
                  className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]"
                >
                  {/* Film */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {film.affiche ? (
                        <img
                          src={film.affiche}
                          alt={film.titre}
                          className="h-12 w-9 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-9 items-center justify-center rounded-lg bg-red-600/15 text-red-400">
                          <Film className="h-4 w-4" aria-hidden="true" />
                        </div>
                      )}
                      <span className="font-semibold text-white">{film.titre}</span>
                    </div>
                  </td>
                  {/* Genre */}
                  <td className="px-4 py-4">
                    <span className="rounded-lg bg-white/8 px-2.5 py-1 text-xs font-medium text-zinc-300">
                      {film.genre}
                    </span>
                  </td>
                  {/* Durée */}
                  <td className="px-4 py-4 text-zinc-400">
                    {Math.floor(film.duree / 60)}h{String(film.duree % 60).padStart(2, '0')}
                  </td>
                  {/* Réalisateur */}
                  <td className="px-4 py-4 text-zinc-300">{film.realisateur}</td>
                  {/* Année */}
                  <td className="px-4 py-4 text-zinc-500">{film.annee}</td>
                  {/* Note */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                      <span className="font-semibold text-white">{film.note}</span>
                    </div>
                  </td>
                  {/* Statut */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() =>
                        setFilms((prev) =>
                          prev.map((f) =>
                            f.id === film.id
                              ? { ...f, statut: f.statut === 'actif' ? 'inactif' : 'actif' }
                              : f
                          )
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition
                        ${film.statut === 'actif'
                          ? 'bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25'
                          : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'
                        }`}
                    >
                      {film.statut === 'actif' ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  {/* Actions */}
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
        initial={modal.film ? (({ id, ...rest }) => rest)(modal.film) : EMPTY}
        title={modal.film ? 'Modifier le film' : 'Ajouter un film'}
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
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setFilms((prev) => prev.filter((f) => f.id !== deleteId));
                  setDeleteId(null);
                }}
                className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Supprimer
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