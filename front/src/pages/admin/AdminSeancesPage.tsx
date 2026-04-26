import { useState } from 'react';
import { Clock, Edit2, Plus, Trash2, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Langue = 'VF' | 'VO' | 'VOSTFR';
type StatutSeance = 'programmée' | 'en cours' | 'terminée' | 'annulée';

interface Seance {
  id: number;
  filmId: number;
  filmTitre: string;
  salle: string;
  date: string;
  heure: string;
  placesTotal: number;
  placesDisponibles: number;
  prix: number;
  langue: Langue;
  statut: StatutSeance;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const FILMS_OPTIONS = [
  { id: 1, titre: 'Apocalypse Stellaire' },
  { id: 2, titre: 'Les Ombres du Passé' },
  { id: 3, titre: 'Royaume des Étoiles' },
  { id: 4, titre: 'La Dernière Séance' },
  { id: 5, titre: 'Légende Urbaine' },
];

const SALLES = ['Salle 1', 'Salle 2', 'Salle 3', 'Salle 4', 'Salle IMAX'];

const MOCK_SEANCES: Seance[] = [
  { id: 1, filmId: 1, filmTitre: 'Apocalypse Stellaire', salle: 'Salle 1', date: '2026-04-28', heure: '14:00', placesTotal: 120, placesDisponibles: 45, prix: 10.5, langue: 'VF', statut: 'programmée' },
  { id: 2, filmId: 1, filmTitre: 'Apocalypse Stellaire', salle: 'Salle 2', date: '2026-04-28', heure: '20:30', placesTotal: 80, placesDisponibles: 12, prix: 12.0, langue: 'VO', statut: 'programmée' },
  { id: 3, filmId: 2, filmTitre: 'Les Ombres du Passé', salle: 'Salle 1', date: '2026-04-29', heure: '18:00', placesTotal: 120, placesDisponibles: 0, prix: 10.5, langue: 'VF', statut: 'programmée' },
  { id: 4, filmId: 3, filmTitre: 'Royaume des Étoiles', salle: 'Salle 3', date: '2026-04-27', heure: '16:15', placesTotal: 60, placesDisponibles: 60, prix: 9.0, langue: 'VOSTFR', statut: 'terminée' },
  { id: 5, filmId: 5, filmTitre: 'Légende Urbaine', salle: 'Salle 2', date: '2026-04-30', heure: '21:00', placesTotal: 80, placesDisponibles: 80, prix: 11.0, langue: 'VF', statut: 'annulée' },
];

const EMPTY: Omit<Seance, 'id'> = {
  filmId: 1, filmTitre: 'Apocalypse Stellaire', salle: 'Salle 1',
  date: new Date().toISOString().split('T')[0], heure: '14:00',
  placesTotal: 120, placesDisponibles: 120, prix: 10.5, langue: 'VF', statut: 'programmée',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

const STATUT_STYLE: Record<StatutSeance, string> = {
  programmée: 'bg-blue-500/15 text-blue-400',
  'en cours': 'bg-emerald-500/15 text-emerald-400',
  terminée: 'bg-zinc-700/50 text-zinc-400',
  annulée: 'bg-red-500/15 text-red-400',
};

const LANGUE_STYLE: Record<Langue, string> = {
  VF: 'bg-red-600/15 text-red-400',
  VO: 'bg-violet-500/15 text-violet-400',
  VOSTFR: 'bg-teal-500/15 text-teal-400',
};

// ─── Modal ────────────────────────────────────────────────────────────────────
function SeanceModal({
  open,
  onClose,
  onSave,
  initial,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Seance, 'id'>) => void;
  initial: Omit<Seance, 'id'>;
  title: string;
}) {
  const [form, setForm] = useState(initial);
  if (!open) return null;

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
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
          {/* Film */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
              Film *
            </label>
            <select
              value={form.filmId}
              onChange={(e) => {
                const id = Number(e.target.value);
                const film = FILMS_OPTIONS.find((f) => f.id === id);
                setForm((p) => ({ ...p, filmId: id, filmTitre: film?.titre ?? '' }));
              }}
              className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
            >
              {FILMS_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>{f.titre}</option>
              ))}
            </select>
          </div>

          {/* Date + Heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Heure *
              </label>
              <input
                type="time"
                value={form.heure}
                onChange={(e) => set('heure', e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>
          </div>

          {/* Salle + Langue */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Salle
              </label>
              <select
                value={form.salle}
                onChange={(e) => set('salle', e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              >
                {SALLES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Langue
              </label>
              <select
                value={form.langue}
                onChange={(e) => set('langue', e.target.value as Langue)}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              >
                <option value="VF">VF</option>
                <option value="VO">VO</option>
                <option value="VOSTFR">VOSTFR</option>
              </select>
            </div>
          </div>

          {/* Places + Prix */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Places total
              </label>
              <input
                type="number"
                value={form.placesTotal}
                onChange={(e) => set('placesTotal', Number(e.target.value))}
                min={1}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Disponibles
              </label>
              <input
                type="number"
                value={form.placesDisponibles}
                onChange={(e) => set('placesDisponibles', Number(e.target.value))}
                min={0}
                max={form.placesTotal}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Prix (€)
              </label>
              <input
                type="number"
                value={form.prix}
                onChange={(e) => set('prix', Number(e.target.value))}
                min={0}
                step={0.5}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
              Statut
            </label>
            <select
              value={form.statut}
              onChange={(e) => set('statut', e.target.value as StatutSeance)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
            >
              <option value="programmée">Programmée</option>
              <option value="en cours">En cours</option>
              <option value="terminée">Terminée</option>
              <option value="annulée">Annulée</option>
            </select>
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
            className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AdminSeancesPage() {
  const [seances, setSeances] = useState<Seance[]>(MOCK_SEANCES);
  const [filterFilm, setFilterFilm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [modal, setModal] = useState<{ open: boolean; seance: Seance | null }>({ open: false, seance: null });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = seances.filter((s) =>
    (filterFilm ? s.filmId === Number(filterFilm) : true) &&
    (filterStatut ? s.statut === filterStatut : true) &&
    (filterDate ? s.date === filterDate : true)
  );

  const placesVendues = seances.reduce((acc, s) => acc + (s.placesTotal - s.placesDisponibles), 0);
  const totalPlaces = seances.reduce((acc, s) => acc + s.placesTotal, 0);

  const handleSave = (data: Omit<Seance, 'id'>) => {
    if (modal.seance) {
      setSeances((prev) => prev.map((s) => (s.id === modal.seance!.id ? { ...data, id: modal.seance!.id } : s)));
    } else {
      setSeances((prev) => [...prev, { ...data, id: Math.max(0, ...prev.map((s) => s.id)) + 1 }]);
    }
  };

  return (
    <div className="relative">
      {/* ── Header ── */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Séances</h1>
          <p className="mt-2 text-zinc-400">
            {seances.length} séance{seances.length > 1 ? 's' : ''} planifiées
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, seance: null })}
          className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouvelle séance
        </button>
      </header>

      {/* ── Stats ── */}
      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total séances', value: seances.length, color: 'text-white' },
          { label: 'Programmées', value: seances.filter((s) => s.statut === 'programmée').length, color: 'text-blue-400' },
          { label: 'Places vendues', value: placesVendues, color: 'text-emerald-400' },
          {
            label: 'Taux remplissage',
            value: totalPlaces > 0 ? `${Math.round((placesVendues / totalPlaces) * 100)}%` : '–',
            color: 'text-amber-400',
          },
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
        <select
          value={filterFilm}
          onChange={(e) => setFilterFilm(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-800/70 px-3 py-2.5 text-sm text-white outline-none ring-red-500/60 transition focus:ring-2"
        >
          <option value="">Tous les films</option>
          {FILMS_OPTIONS.map((f) => (
            <option key={f.id} value={f.id}>{f.titre}</option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-800/70 px-3 py-2.5 text-sm text-white outline-none ring-red-500/60 transition focus:ring-2"
        />
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-800/70 px-3 py-2.5 text-sm text-white outline-none ring-red-500/60 transition focus:ring-2"
        >
          <option value="">Tous statuts</option>
          <option value="programmée">Programmée</option>
          <option value="en cours">En cours</option>
          <option value="terminée">Terminée</option>
          <option value="annulée">Annulée</option>
        </select>
        {(filterFilm || filterDate || filterStatut) && (
          <button
            onClick={() => { setFilterFilm(''); setFilterDate(''); setFilterStatut(''); }}
            className="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-zinc-400 transition hover:text-white"
          >
            Effacer
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 shadow-2xl">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {['Film', 'Date & Heure', 'Salle', 'Remplissage', 'Prix', 'Langue', 'Statut', ''].map((h) => (
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
                  Aucune séance trouvée
                </td>
              </tr>
            ) : (
              filtered.map((seance) => {
                const tauxOcc = Math.round(
                  ((seance.placesTotal - seance.placesDisponibles) / seance.placesTotal) * 100
                );
                return (
                  <tr
                    key={seance.id}
                    className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]"
                  >
                    {/* Film */}
                    <td className="px-4 py-4">
                      <span className="font-semibold text-white">{seance.filmTitre}</span>
                    </td>
                    {/* Date & Heure */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-white">
                        <Clock className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                        <span className="font-semibold">{seance.heure}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-500">{fmtDate(seance.date)}</div>
                    </td>
                    {/* Salle */}
                    <td className="px-4 py-4 text-zinc-300">{seance.salle}</td>
                    {/* Remplissage */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full transition-all ${
                              tauxOcc === 100 ? 'bg-red-500' : tauxOcc > 70 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${tauxOcc}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400">
                          {seance.placesDisponibles}/{seance.placesTotal}
                        </span>
                      </div>
                    </td>
                    {/* Prix */}
                    <td className="px-4 py-4 font-semibold text-white">
                      {seance.prix.toFixed(2)} €
                    </td>
                    {/* Langue */}
                    <td className="px-4 py-4">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${LANGUE_STYLE[seance.langue]}`}>
                        {seance.langue}
                      </span>
                    </td>
                    {/* Statut */}
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUT_STYLE[seance.statut]}`}>
                        {seance.statut}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal({ open: true, seance })}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/20 hover:text-white"
                          title="Modifier"
                        >
                          <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => setDeleteId(seance.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10 text-red-400 transition hover:bg-red-600/20"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modals ── */}
      <SeanceModal
        open={modal.open}
        onClose={() => setModal({ open: false, seance: null })}
        onSave={handleSave}
        initial={modal.seance ? (({ id, ...rest }) => rest)(modal.seance) : EMPTY}
        title={modal.seance ? 'Modifier la séance' : 'Nouvelle séance'}
      />

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/15 text-red-400">
              <Trash2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-black">Supprimer cette séance ?</h3>
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
                  setSeances((prev) => prev.filter((s) => s.id !== deleteId));
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
        onClick={() => setModal({ open: true, seance: null })}
        className="fixed bottom-8 right-8 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl transition hover:bg-red-500"
        aria-label="Nouvelle séance"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}