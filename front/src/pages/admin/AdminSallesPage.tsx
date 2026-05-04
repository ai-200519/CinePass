import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createSalle, deleteSalle, fetchSalles, updateSalle } from '../../features/salles/sallesSlice';
import {
  selectSalles,
  selectSallesError,
  selectSallesFetchStatus,
  selectSallesDeleteState,
  selectSallesUpdateState,
  selectSallesCreateState,
} from '../../features/salles/sallesSelectors';
import type { Salle, CreateSalleDto, UpdateSalleDto } from '../../features/salles/sallesApi';

const emptyFormState = {
  id: 0,
  nom: '',
  numero: '',
  capaciteTotale: '',
  equipements: '',
};

type SalleFormState = typeof emptyFormState;

const toFormState = (salle: Salle): SalleFormState => ({
  id: salle.id_salle,
  nom: salle.nom ?? '',
  numero: salle.numero.toString(),
  capaciteTotale: salle.capaciteTotale.toString(),
  equipements: salle.equipements ?? '',
});

export default function AdminSallesPage() {
  const dispatch = useAppDispatch();
  const salles = useAppSelector(selectSalles);
  const fetchStatus = useAppSelector(selectSallesFetchStatus);
  const fetchError = useAppSelector(selectSallesError);
  const updateState = useAppSelector(selectSallesUpdateState);
  const deleteState = useAppSelector(selectSallesDeleteState);
  const createState = useAppSelector(selectSallesCreateState);

  const [editingSalleId, setEditingSalleId] = useState<number | null>(null);
  const [formState, setFormState] = useState<SalleFormState>(emptyFormState);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // ✅ Ajout du champ id_cinema dans l'état du formulaire
  const [addForm, setAddForm] = useState({
    nom: '',
    numero: '',
    capaciteTotale: '',
    equipements: '',
    id_cinema: '',
  });
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (fetchStatus === 'idle') {
      dispatch(fetchSalles());
    }
  }, [dispatch, fetchStatus]);

  const startEditing = (salle: Salle) => {
    setLocalError(null);
    setEditingSalleId(salle.id_salle);
    setFormState(toFormState(salle));
  };

  const cancelEditing = () => {
    setLocalError(null);
    setEditingSalleId(null);
    setFormState(emptyFormState);
  };

  const handleFormChange = (key: keyof SalleFormState, value: string) => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  const handleCreate = async () => {
    setAddError(null);
    const numero = Number(addForm.numero);
    const capaciteTotale = Number(addForm.capaciteTotale);

    // ✅ Validation de id_cinema
    const id_cinema = Number(addForm.id_cinema);

    if (!addForm.nom.trim()) { setAddError('Le nom est requis.'); return; }
    if (Number.isNaN(numero) || numero <= 0) { setAddError('Le numéro doit être un entier valide.'); return; }
    if (Number.isNaN(capaciteTotale) || capaciteTotale <= 0) { setAddError('La capacité doit être un entier valide.'); return; }
    if (Number.isNaN(id_cinema) || id_cinema <= 0) { setAddError("L'ID du cinéma est requis et doit être valide."); return; }

    // ✅ Ajout de id_cinema dans le payload
    const payload: CreateSalleDto = {
      numero,
      nom: addForm.nom.trim(),
      capaciteTotale,
      equipements: addForm.equipements.trim() || undefined,
      id_cinema,
    };

    try {
      await dispatch(createSalle(payload)).unwrap();
      setShowAddModal(false);
      // ✅ Reset complet incluant id_cinema
      setAddForm({ nom: '', numero: '', capaciteTotale: '', equipements: '', id_cinema: '' });
    } catch {
      // l'erreur est gérée par le slice
    }
  };

  const handleSave = async () => {
    setLocalError(null);

    if (editingSalleId === null) {
      return;
    }

    const numero = Number(formState.numero);
    const capaciteTotale = Number(formState.capaciteTotale);

    if (!formState.nom.trim()) {
      setLocalError('Le nom de la salle est requis.');
      return;
    }

    if (Number.isNaN(numero) || numero <= 0) {
      setLocalError('Le numéro de salle doit être un entier valide.');
      return;
    }

    if (Number.isNaN(capaciteTotale) || capaciteTotale <= 0) {
      setLocalError('La capacité totale doit être un entier valide.');
      return;
    }

    const payload: UpdateSalleDto = {
      numero,
      nom: formState.nom.trim(),
      capaciteTotale,
      equipements: formState.equipements.trim() || null,
    };

    try {
      await dispatch(updateSalle({ id: editingSalleId, data: payload })).unwrap();
      cancelEditing();
    } catch {
      // l'erreur est gérée par le slice
    }
  };

  const handleDelete = async (salleId: number, salleName: string | null, numero: number) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer la salle ${salleName ?? `#${numero}`} ?`)) {
      return;
    }

    try {
      await dispatch(deleteSalle(salleId)).unwrap();
    } catch {
      // l'erreur est gérée par le slice
    }
  };

  const isLoading = fetchStatus === 'loading';
  const isActionLoading = updateState.status === 'loading' || deleteState.status === 'loading' || createState.status === 'loading';

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Salles</h1>
          <p className="mt-2 text-zinc-400">Gestion des salles</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowAddModal(true); setAddError(null); }}
          className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
        >
          + Ajouter une salle
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

      {createState.status === 'failed' && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {createState.error}
        </div>
      )}

      <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-950/80 shadow-sm">
        <table className="min-w-full divide-y divide-zinc-800 text-left text-sm">
          <thead className="bg-zinc-950">
            <tr>
              <th className="px-4 py-3 font-semibold text-zinc-300">ID</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Numéro</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Nom</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Capacité</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Équipements</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                  Chargement...
                </td>
              </tr>
            ) : salles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                  Aucune salle trouvée.
                </td>
              </tr>
            ) : (
              salles.map((salle) => {
                const isEditing = editingSalleId === salle.id_salle;
                return (
                  <tr key={salle.id_salle} className="border-b border-zinc-800">
                    <td className="px-4 py-4 text-zinc-300">{salle.id_salle}</td>
                    <td className="px-4 py-4 text-zinc-300">
                      {isEditing ? (
                        <input
                          type="number"
                          aria-label="Numéro de la salle"
                          placeholder="Num"
                          value={formState.numero}
                          onChange={(event) => handleFormChange('numero', event.target.value)}
                          className="w-20 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                        />
                      ) : (
                        salle.numero
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {isEditing ? (
                        <input
                          type="text"
                          aria-label="Nom de la salle"
                          placeholder="Nom"
                          value={formState.nom}
                          onChange={(event) => handleFormChange('nom', event.target.value)}
                          className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                        />
                      ) : (
                        salle.nom ?? '-'
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {isEditing ? (
                        <input
                          type="number"
                          aria-label="Capacité totale"
                          placeholder="Capacité"
                          value={formState.capaciteTotale}
                          onChange={(event) => handleFormChange('capaciteTotale', event.target.value)}
                          className="w-24 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                        />
                      ) : (
                        salle.capaciteTotale
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {isEditing ? (
                        <input
                          type="text"
                          aria-label="Équipements"
                          placeholder="Équipements"
                          value={formState.equipements}
                          onChange={(event) => handleFormChange('equipements', event.target.value)}
                          className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                        />
                      ) : (
                        salle.equipements ?? '-'
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {isEditing ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-100 transition hover:bg-zinc-800"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={updateState.status === 'loading'}
                            className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
                          >
                            {updateState.status === 'loading' ? 'Enregistrement...' : 'Enregistrer'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(salle)}
                            className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-100 transition hover:bg-zinc-800"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(salle.id_salle, salle.nom, salle.numero)}
                            disabled={deleteState.status === 'loading'}
                            className="rounded-full border border-red-700 bg-red-700/10 px-3 py-1 text-sm text-red-200 transition hover:bg-red-700/20 disabled:cursor-not-allowed disabled:opacity-50"
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

      {isActionLoading && (
        <div className="mt-4 rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-blue-700">
          Action en cours, patientez...
        </div>
      )}

      {/* Modal Ajouter une salle */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-zinc-100">Ajouter une salle</h2>

            {addError && (
              <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {addError}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Nom *</label>
                <input
                  type="text"
                  placeholder="Ex: Salle Lumière"
                  value={addForm.nom}
                  onChange={(e) => setAddForm((f) => ({ ...f, nom: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Numéro *</label>
                <input
                  type="number"
                  placeholder="Ex: 1"
                  value={addForm.numero}
                  onChange={(e) => setAddForm((f) => ({ ...f, numero: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Capacité *</label>
                <input
                  type="number"
                  placeholder="Ex: 120"
                  value={addForm.capaciteTotale}
                  onChange={(e) => setAddForm((f) => ({ ...f, capaciteTotale: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Équipements</label>
                <input
                  type="text"
                  placeholder="Ex: 3D, Dolby Atmos"
                  value={addForm.equipements}
                  onChange={(e) => setAddForm((f) => ({ ...f, equipements: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* ✅ Nouveau champ id_cinema */}
              <div>
                <label className="mb-1 block text-sm text-zinc-400">ID Cinéma *</label>
                <input
                  type="number"
                  placeholder="Ex: 1"
                  value={addForm.id_cinema}
                  onChange={(e) => setAddForm((f) => ({ ...f, id_cinema: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setAddError(null);
                  setAddForm({ nom: '', numero: '', capaciteTotale: '', equipements: '', id_cinema: '' });
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-100 transition hover:bg-zinc-800"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={createState.status === 'loading'}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {createState.status === 'loading' ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}