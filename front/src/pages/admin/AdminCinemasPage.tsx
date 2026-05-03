import { useEffect, useState } from 'react';
import { Building2, Plus, Trash2, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createCinema, deleteCinema, fetchCinemas, updateCinema } from '../../features/cinemas/cinemasSlice';
import {
  selectCinemas,
  selectCinemasError,
  selectCinemasFetchStatus,
  selectCinemasCreateState,
  selectCinemasUpdateState,
  selectCinemasDeleteState,
} from '../../features/cinemas/cinemasSelectors';
import type { Cinema, CreateCinemaDto, UpdateCinemaDto } from '../../features/cinemas/cinemasApi';

const emptyFormState = {
  id_cinema: 0,
  nom: '',
  adresse: '',
  ville: '',
  telephone: '',
  latitude: '',
  longitude: '',
};

type CinemaFormState = typeof emptyFormState;

const toFormState = (cinema: Cinema): CinemaFormState => ({
  id_cinema: cinema.id_cinema,
  nom: cinema.nom,
  adresse: cinema.adresse ?? '',
  ville: cinema.ville ?? '',
  telephone: cinema.telephone ?? '',
  latitude: cinema.latitude?.toString() ?? '',
  longitude: cinema.longitude?.toString() ?? '',
});

export default function AdminCinemasPage() {
  const dispatch = useAppDispatch();
  const cinemas = useAppSelector(selectCinemas);
  const fetchStatus = useAppSelector(selectCinemasFetchStatus);
  const fetchError = useAppSelector(selectCinemasError);
  const createState = useAppSelector(selectCinemasCreateState);
  const updateState = useAppSelector(selectCinemasUpdateState);
  const deleteState = useAppSelector(selectCinemasDeleteState);

  const [editingCinemaId, setEditingCinemaId] = useState<number | null>(null);
  const [formState, setFormState] = useState<CinemaFormState>(emptyFormState);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<Omit<CinemaFormState, 'id_cinema'>>({
    nom: '',
    adresse: '',
    ville: '',
    telephone: '',
    latitude: '',
    longitude: '',
  });
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (fetchStatus === 'idle') {
      dispatch(fetchCinemas());
    }
  }, [dispatch, fetchStatus]);

  const startEditing = (cinema: Cinema) => {
    setLocalError(null);
    setEditingCinemaId(cinema.id_cinema);
    setFormState(toFormState(cinema));
  };

  const cancelEditing = () => {
    setLocalError(null);
    setEditingCinemaId(null);
    setFormState(emptyFormState);
  };

  const handleFormChange = (key: keyof CinemaFormState, value: string) => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  const handleAddChange = (key: keyof Omit<CinemaFormState, 'id_cinema'>, value: string) => {
    setAddForm((current) => ({ ...current, [key]: value }));
  };

  const parseNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleCreate = async () => {
    setAddError(null);

    if (!addForm.nom.trim()) {
      setAddError('Le nom du cinéma est requis.');
      return;
    }

    const payload: CreateCinemaDto = {
      nom: addForm.nom.trim(),
      adresse: addForm.adresse.trim() || undefined,
      ville: addForm.ville.trim() || undefined,
      telephone: addForm.telephone.trim() || undefined,
      latitude: parseNumber(addForm.latitude),
      longitude: parseNumber(addForm.longitude),
    };

    try {
      await dispatch(createCinema(payload)).unwrap();
      setShowAddModal(false);
      setAddForm({ nom: '', adresse: '', ville: '', telephone: '', latitude: '', longitude: '' });
    } catch {
      // erreur gérée via le slice
    }
  };

  const handleSave = async () => {
    setLocalError(null);
    if (editingCinemaId === null) return;

    if (!formState.nom.trim()) {
      setLocalError('Le nom du cinéma est requis.');
      return;
    }

    const payload: UpdateCinemaDto = {
      nom: formState.nom.trim(),
      adresse: formState.adresse.trim() || null,
      ville: formState.ville.trim() || null,
      telephone: formState.telephone.trim() || null,
      latitude: parseNumber(formState.latitude),
      longitude: parseNumber(formState.longitude),
    };

    try {
      await dispatch(updateCinema({ id: editingCinemaId, data: payload })).unwrap();
      cancelEditing();
    } catch {
      // erreur gérée via le slice
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le cinéma « ${nom} » ?`)) {
      return;
    }

    try {
      await dispatch(deleteCinema(id)).unwrap();
    } catch {
      // erreur gérée via le slice
    }
  };

  const isLoading = fetchStatus === 'loading';
  const isActionLoading =
    createState.status === 'loading' || updateState.status === 'loading' || deleteState.status === 'loading';

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Cinémas</h1>
          <p className="mt-2 text-zinc-400">Gestion des cinémas</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAddModal(true);
            setAddError(null);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
        >
          <Plus className="h-4 w-4" />
          Ajouter un cinéma
        </button>
      </div>

      {fetchError && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {fetchError}
        </div>
      )}

      {localError && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {localError}
        </div>
      )}

      {createState.status === 'failed' && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {createState.error}
        </div>
      )}
      {updateState.status === 'failed' && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {updateState.error}
        </div>
      )}
      {deleteState.status === 'failed' && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {deleteState.error}
        </div>
      )}

      <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-950/80 shadow-sm">
        <table className="min-w-full divide-y divide-zinc-800 text-left text-sm">
          <thead className="bg-zinc-950">
            <tr>
              <th className="px-4 py-3 font-semibold text-zinc-300">ID</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Nom</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Adresse</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Ville</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Téléphone</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Latitude</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Longitude</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {isLoading ? (
              <tr>
                <td className="px-4 py-8 text-zinc-400" colSpan={8}>
                  Chargement des cinémas...
                </td>
              </tr>
            ) : cinemas.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-zinc-400" colSpan={8}>
                  Aucun cinéma trouvé.
                </td>
              </tr>
            ) : (
              cinemas.map((cinema) => {
                const isEditing = editingCinemaId === cinema.id_cinema;
                return (
                  <tr key={cinema.id_cinema} className="border-b border-zinc-800">
                    <td className="px-4 py-4 text-zinc-300">{cinema.id_cinema}</td>
                    <td className="px-4 py-4 text-zinc-300 w-40">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formState.nom}
                          onChange={(event) => handleFormChange('nom', event.target.value)}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                        />
                      ) : (
                        cinema.nom
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-300 w-56">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formState.adresse}
                          onChange={(event) => handleFormChange('adresse', event.target.value)}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                        />
                      ) : (
                        cinema.adresse || '-'
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-300 w-36">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formState.ville}
                          onChange={(event) => handleFormChange('ville', event.target.value)}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                        />
                      ) : (
                        cinema.ville || '-'
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-300 w-36">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formState.telephone}
                          onChange={(event) => handleFormChange('telephone', event.target.value)}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                        />
                      ) : (
                        cinema.telephone || '-'
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-300 w-28">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formState.latitude}
                          onChange={(event) => handleFormChange('latitude', event.target.value)}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                        />
                      ) : (
                        cinema.latitude?.toFixed(6) ?? '-'
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-300 w-28">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formState.longitude}
                          onChange={(event) => handleFormChange('longitude', event.target.value)}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                        />
                      ) : (
                        cinema.longitude?.toFixed(6) ?? '-'
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={isActionLoading}
                            className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                          >
                            Enregistrer
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(cinema)}
                            className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cinema.id_cinema, cinema.nom)}
                            className="rounded-full border border-red-500 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-100"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(event) => event.target === event.currentTarget && setShowAddModal(false)}
        >
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">Ajouter un cinéma</h2>
                <p className="text-sm text-zinc-400">Créez un nouveau cinéma disponible dans le système.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 transition hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addError && (
              <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
                {addError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Nom *</label>
                <input
                  type="text"
                  value={addForm.nom}
                  onChange={(event) => handleAddChange('nom', event.target.value)}
                  placeholder="Nom du cinéma"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Téléphone</label>
                <input
                  type="text"
                  value={addForm.telephone}
                  onChange={(event) => handleAddChange('telephone', event.target.value)}
                  placeholder="Téléphone"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Adresse</label>
                <input
                  type="text"
                  value={addForm.adresse}
                  onChange={(event) => handleAddChange('adresse', event.target.value)}
                  placeholder="Adresse"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Ville</label>
                <input
                  type="text"
                  value={addForm.ville}
                  onChange={(event) => handleAddChange('ville', event.target.value)}
                  placeholder="Ville"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Latitude</label>
                  <input
                    type="text"
                    value={addForm.latitude}
                    onChange={(event) => handleAddChange('latitude', event.target.value)}
                    placeholder="Latitude"
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Longitude</label>
                  <input
                    type="text"
                    value={addForm.longitude}
                    onChange={(event) => handleAddChange('longitude', event.target.value)}
                    placeholder="Longitude"
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={createState.status === 'loading'}
                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {createState.status === 'loading' ? 'Création...' : 'Créer le cinéma'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
