import { Clock, Edit2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectFetchFilmsStatus, selectFilms } from '../../features/films/filmsSelectors';
import { filmsActions } from '../../features/films/filmsSlice';
import { selectSalles, selectSallesFetchStatus } from '../../features/salles/sallesSelectors';
import { fetchSalles } from '../../features/salles/sallesSlice';
import type { CreateSeanceDto, Seance } from '../../features/seances/seancesApi';
import {
  selectCreateSeanceError,
  selectCreateSeanceStatus,
  selectDeleteSeanceError,
  selectDeleteSeanceStatus,
  selectFetchSeancesError,
  selectFetchSeancesStatus,
  selectSeances,
  selectUpdateSeanceError,
  selectUpdateSeanceStatus,
} from '../../features/seances/seancesSelectors';
import { seancesActions } from '../../features/seances/seancesSlice';

interface SeanceForm {
  filmId: number;
  salleId: number;
  date: string;
  heure: string;
  technologie: Seance['technologie'];
  statut: Seance['statut'];
}

const EMPTY_FORM: SeanceForm = {
  filmId: 0,
  salleId: 0,
  date: new Date().toISOString().split('T')[0],
  heure: '14:00',
  technologie: '2D',
  statut: 'PROGRAMMEE',
};

const seanceToForm = (s: Seance): SeanceForm => {
  const dt = new Date(s.dateHeure);
  return {
    filmId: s.film?.id ?? 0,
    salleId: s.salle?.id_salle ?? 0,
    date: dt.toISOString().split('T')[0],
    heure: dt.toTimeString().slice(0, 5),
    technologie: s.technologie,
    statut: s.statut,
  };
};

const formToDto = (form: SeanceForm): CreateSeanceDto => ({
  dateHeure: new Date(`${form.date}T${form.heure}:00`).toISOString(),
  technologie: form.technologie,
  statut: form.statut,
  film: { id: Number(form.filmId) },
  salle: { id_salle: Number(form.salleId) },
});

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

const fmtHeure = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const STATUT_STYLE: Record<Seance['statut'], string> = {
  PROGRAMMEE: 'bg-blue-500/15 text-blue-400',
  EN_COURS: 'bg-amber-500/15 text-amber-400',
  TERMINEE: 'bg-zinc-700/50 text-zinc-400',
  ANNULEE: 'bg-red-500/15 text-red-400',
};

const STATUT_LABEL: Record<Seance['statut'], string> = {
  PROGRAMMEE: 'Programmée',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
};

const TECHNO_LABEL: Record<Seance['technologie'], string> = {
  '2D': '2D',
  '3D': '3D',
  '4DX': '4DX',
  'DOLBY': 'Dolby',
};

function SeanceModal({
  open, onClose, onSave, initial, title, isLoading, error, filmOptions, salleOptions,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: SeanceForm) => void;
  initial: SeanceForm;
  title: string;
  isLoading: boolean;
  error: string | null;
  filmOptions: { id: number; title: string }[];
  salleOptions: { id_salle: number; numero: number; nom: string | null }[];
}) {
  const [form, setForm] = useState(initial);
  useEffect(() => { if (open) setForm(initial); }, [open, initial]);

  if (!open) return null;
  const set = <K extends keyof SeanceForm>(key: K, val: SeanceForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const isValid = form.filmId > 0 && form.salleId > 0 && form.date && form.heure;

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
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Film *</label>
            <select
              value={form.filmId}
              onChange={(e) => set('filmId', Number(e.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
            >
              <option value={0}>— Choisir un film —</option>
              {filmOptions.map((f) => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Salle *</label>
            <select
              value={form.salleId}
              onChange={(e) => set('salleId', Number(e.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
            >
              <option value={0}>— Choisir une salle —</option>
              {salleOptions.map((s) => (
                <option key={s.id_salle} value={s.id_salle}>
                  Salle {s.numero}{s.nom ? ` — ${s.nom}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Heure *</label>
              <input
                type="time"
                value={form.heure}
                onChange={(e) => set('heure', e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Technologie</label>
              <select
                value={form.technologie}
                onChange={(e) => set('technologie', e.target.value as Seance['technologie'])}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              >
                {/* ✅ valeurs alignées avec TechnologieSeance enum backend */}
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="4DX">4DX</option>
                <option value="DOLBY">Dolby</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">Statut</label>
              <select
                value={form.statut}
                onChange={(e) => set('statut', e.target.value as Seance['statut'])}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-red-500/60 transition focus:ring-2"
              >
                <option value="PROGRAMMEE">Programmée</option>
                <option value="TERMINEE">Terminée</option>
                <option value="ANNULEE">Annulée</option>
              </select>
            </div>
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
            onClick={() => onSave(form)}
            disabled={!isValid || isLoading}
            className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-40"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSeancesPage() {
  const dispatch = useAppDispatch();

  const seances = useAppSelector(selectSeances);
  const fetchStatus = useAppSelector(selectFetchSeancesStatus);
  const fetchError = useAppSelector(selectFetchSeancesError);
  const createStatus = useAppSelector(selectCreateSeanceStatus);
  const createError = useAppSelector(selectCreateSeanceError);
  const updateStatus = useAppSelector(selectUpdateSeanceStatus);
  const updateError = useAppSelector(selectUpdateSeanceError);
  const deleteStatus = useAppSelector(selectDeleteSeanceStatus);
  const deleteError = useAppSelector(selectDeleteSeanceError);

  const films = useAppSelector(selectFilms);
  const filmsStatus = useAppSelector(selectFetchFilmsStatus);
  const salles = useAppSelector(selectSalles);
  const sallesStatus = useAppSelector(selectSallesFetchStatus);

  const [filterFilm, setFilterFilm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [modal, setModal] = useState<{ open: boolean; seance: Seance | null }>({ open: false, seance: null });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (fetchStatus === 'idle') dispatch(seancesActions.fetchSeancesRequested());
  }, [dispatch, fetchStatus]);

  useEffect(() => {
    if (filmsStatus === 'idle') dispatch(filmsActions.fetchFilmsRequested());
  }, [dispatch, filmsStatus]);

  useEffect(() => {
    if (sallesStatus === 'idle') dispatch(fetchSalles());
  }, [dispatch, sallesStatus]);

  useEffect(() => {
    if (createStatus === 'succeeded' || updateStatus === 'succeeded') {
      setModal({ open: false, seance: null });
      dispatch(seancesActions.fetchSeancesRequested());
    }
  }, [createStatus, updateStatus, dispatch]);

  const handleSave = (form: SeanceForm) => {
    const dto = formToDto(form);
    if (modal.seance) {
      dispatch(seancesActions.updateSeanceRequested({ id: modal.seance.id_seance, seance: dto }));
    } else {
      dispatch(seancesActions.createSeanceRequested(dto));
    }
  };

  const handleDelete = () => {
    if (deleteId !== null) {
      dispatch(seancesActions.deleteSeanceRequested(deleteId));
      setDeleteId(null);
    }
  };

  const filtered = seances.filter((s) => {
    const matchFilm = filterFilm ? s.film?.id === Number(filterFilm) : true;
    const matchStatut = filterStatut ? s.statut === filterStatut : true;
    const matchDate = filterDate ? s.dateHeure.startsWith(filterDate) : true;
    return matchFilm && matchStatut && matchDate;
  });

  const isModalLoading = createStatus === 'loading' || updateStatus === 'loading';
  const modalError = modal.seance ? updateError : createError;

  const salleOptions = salles.map((s) => ({
    id_salle: s.id_salle,
    numero: s.numero,
    nom: s.nom,
  }));

  return (
    <div className="relative">
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

      {fetchError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-600/10 px-4 py-2 text-sm text-red-400">{fetchError}</div>
      )}
      {deleteError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-600/10 px-4 py-2 text-sm text-red-400">{deleteError}</div>
      )}

      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total séances', value: seances.length, color: 'text-white' },
          { label: 'Programmées', value: seances.filter((s) => s.statut === 'PROGRAMMEE').length, color: 'text-blue-400' },
          { label: 'Terminées', value: seances.filter((s) => s.statut === 'TERMINEE').length, color: 'text-zinc-400' },
          { label: 'Annulées', value: seances.filter((s) => s.statut === 'ANNULEE').length, color: 'text-red-400' },
        ].map((s) => (
          <article key={s.label} className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 shadow-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{s.label}</p>
            <p className={`mt-2 text-3xl font-black tracking-tight ${s.color}`}>{s.value}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
        <select
          value={filterFilm}
          onChange={(e) => setFilterFilm(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-800/70 px-3 py-2.5 text-sm text-white outline-none ring-red-500/60 transition focus:ring-2"
        >
          <option value="">Tous les films</option>
          {films.map((f) => (
            <option key={f.id} value={f.id}>{f.title}</option>
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
          <option value="PROGRAMMEE">Programmée</option>
          <option value="TERMINEE">Terminée</option>
          <option value="ANNULEE">Annulée</option>
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

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 shadow-2xl">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {['Film', 'Date & Heure', 'Salle', 'Technologie', 'Statut', ''].map((h) => (
                <th key={h} className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-widest text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fetchStatus === 'loading' ? (
              <tr><td colSpan={6} className="py-16 text-center text-zinc-500">Chargement des séances...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-zinc-500">Aucune séance trouvée</td></tr>
            ) : (
              filtered.map((seance) => (
                <tr key={seance.id_seance} className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-4 font-semibold text-white">
                    {seance.film?.title ?? <span className="italic text-zinc-500">Film inconnu</span>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-white">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                      <span className="font-semibold">{fmtHeure(seance.dateHeure)}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500">{fmtDate(seance.dateHeure)}</div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {seance.salle ? `Salle ${seance.salle.numero}` : <span className="italic text-zinc-500">Salle inconnue</span>}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-lg bg-white/8 px-2.5 py-1 text-xs font-medium text-zinc-300">
                      {TECHNO_LABEL[seance.technologie]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUT_STYLE[seance.statut]}`}>
                      {STATUT_LABEL[seance.statut]}
                    </span>
                  </td>
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
                        onClick={() => setDeleteId(seance.id_seance)}
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

      <SeanceModal
        open={modal.open}
        onClose={() => setModal({ open: false, seance: null })}
        onSave={handleSave}
        initial={modal.seance ? seanceToForm(modal.seance) : EMPTY_FORM}
        title={modal.seance ? 'Modifier la séance' : 'Nouvelle séance'}
        isLoading={isModalLoading}
        error={modalError}
        filmOptions={films.map((f) => ({ id: f.id, title: f.title }))}
        salleOptions={salleOptions}
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
                onClick={handleDelete}
                disabled={deleteStatus === 'loading'}
                className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {deleteStatus === 'loading' ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

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