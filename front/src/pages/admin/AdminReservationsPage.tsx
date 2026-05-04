import { useEffect, useState, useMemo } from 'react';
import {
  Search, Ticket, Trash2, X, ChevronDown, ChevronUp, Eye,
  Calendar, User, Film, MapPin, CreditCard,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchReservations,
  updateReservationStatut,
  deleteReservation,
} from '../../features/reservations/reservationsSlice';
import {
  selectReservations,
  selectReservationsFetchStatus,
  selectReservationsFetchError,
  selectUpdateReservationState,
  selectDeleteReservationState,
} from '../../features/reservations/reservationsSelectors';
import type { Reservation, StatutReservation } from '../../features/reservations/reservationsApi';

// ─── Constantes & Helpers ─────────────────────────────────────────────────────
const STATUTS: StatutReservation[] = ['EN_COURS', 'PAYEE', 'ANNULEE', 'EXPIREE'];

const STATUT_META: Record<StatutReservation, { label: string; classes: string; dot: string }> = {
  EN_COURS: { label: 'En cours', classes: 'bg-amber-400/15 text-amber-300', dot: 'bg-amber-400' },
  PAYEE:    { label: 'Payée',    classes: 'bg-emerald-400/15 text-emerald-400', dot: 'bg-emerald-400' },
  ANNULEE:  { label: 'Annulée',  classes: 'bg-red-500/15 text-red-400', dot: 'bg-red-400' },
  EXPIREE:  { label: 'Expirée',  classes: 'bg-zinc-700/60 text-zinc-400', dot: 'bg-zinc-500' },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const totalPrix = (reservation: Reservation) =>
  reservation.reservationSieges?.reduce((sum, rs) => sum + Number(rs.prixUnitaire), 0) ?? 0;

// ─── Badge Statut ─────────────────────────────────────────────────────────────
function StatutBadge({ statut }: { statut: StatutReservation }) {
  const meta = STATUT_META[statut];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

// ─── Modal Détail ─────────────────────────────────────────────────────────────
function DetailModal({
  reservation,
  onClose,
  onChangeStatut,
  isUpdating,
}: {
  reservation: Reservation;
  onClose: () => void;
  onChangeStatut: (statut: StatutReservation) => void;
  isUpdating: boolean;
}) {
  const sieges = reservation.reservationSieges ?? [];
  const total = totalPrix(reservation);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600/15 text-red-400">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Réservation</p>
              <p className="font-black tracking-tight text-white">{reservation.reference}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-5" style={{ maxHeight: '70vh' }}>
          {/* Statut */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-800/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Statut actuel :</span>
              <StatutBadge statut={reservation.statut} />
            </div>
            <select
              defaultValue=""
              disabled={isUpdating}
              onChange={(e) => e.target.value && onChangeStatut(e.target.value as StatutReservation)}
              className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-1.5 text-xs text-white outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              <option value="" disabled>Changer…</option>
              {STATUTS.filter((s) => s !== reservation.statut).map((s) => (
                <option key={s} value={s}>{STATUT_META[s].label}</option>
              ))}
            </select>
          </div>

          {/* Séance */}
          <div className="rounded-2xl border border-white/10 bg-zinc-800/40 p-4 space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Séance</p>
            <div className="flex items-center gap-3">
              {reservation.seance?.film?.poster ? (
                <img
                  src={reservation.seance.film.poster}
                  alt={reservation.seance.film.title}
                  className="h-16 w-12 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-12 items-center justify-center rounded-xl bg-red-600/15 text-red-400">
                  <Film className="h-5 w-5" />
                </div>
              )}
              <div>
                <p className="font-semibold text-white">{reservation.seance?.film?.title ?? '-'}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {reservation.seance?.dateHeure ? formatDateTime(reservation.seance.dateHeure) : '-'}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                  <MapPin className="h-3.5 w-3.5" />
                  Salle {reservation.seance?.salle?.nom ?? `#${reservation.seance?.salle?.numero}`}
                </p>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="rounded-2xl border border-white/10 bg-zinc-800/40 p-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Client</p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-700 text-zinc-300">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-white">
                  {reservation.utilisateur?.prenom} {reservation.utilisateur?.nom}
                </p>
                <p className="text-xs text-zinc-400">{reservation.utilisateur?.email}</p>
              </div>
            </div>
          </div>

          {/* Sièges */}
          {sieges.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-zinc-800/40 p-4 space-y-3">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Sièges ({sieges.length})</p>
              <div className="space-y-2">
                {sieges.map((rs) => (
                  <div key={rs.id_reservation_siege} className="flex justify-between text-sm">
                    <span className="text-zinc-300">
                      Rangée {rs.siege?.rangee} — Siège {rs.siege?.numero}
                      <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-xs text-zinc-400">
                        {rs.categorie}
                      </span>
                    </span>
                    <span className="font-semibold text-white">{Number(rs.prixUnitaire).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 font-semibold">
                <span className="flex items-center gap-1.5">Total</span>
                <span className="text-lg">{total.toFixed(2)} €</span>
              </div>
            </div>
          )}

          <p className="text-xs text-zinc-500">
            Réservée le {formatDate(reservation.dateReservation)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Suppression ────────────────────────────────────────────────────────
function DeleteModal({
  reservation,
  onClose,
  onConfirm,
  isLoading,
}: {
  reservation: Reservation;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/15 text-red-400">
          <Trash2 className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-black">Supprimer cette réservation ?</h3>
        <p className="mt-1 text-sm font-medium text-zinc-300">{reservation.reference}</p>
        <p className="mt-2 text-sm text-zinc-400">Cette action est irréversible.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:bg-white/5"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            {isLoading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page Principale ─────────────────────────────────────────────────────────
export default function AdminReservationsPage() {
  const dispatch = useAppDispatch();

  const reservationsRaw = useAppSelector(selectReservations);
  const fetchStatus = useAppSelector(selectReservationsFetchStatus);
  const fetchError = useAppSelector(selectReservationsFetchError);
  const updateState = useAppSelector(selectUpdateReservationState);
  const deleteState = useAppSelector(selectDeleteReservationState);

  // Protection renforcée contre les erreurs de type
  const reservations = useMemo(() => {
    return Array.isArray(reservationsRaw) ? reservationsRaw : [];
  }, [reservationsRaw]);

  // États UI
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<StatutReservation | ''>('');
  const [filterDebut, setFilterDebut] = useState('');
  const [filterFin, setFilterFin] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [detailRes, setDetailRes] = useState<Reservation | null>(null);
  const [deleteRes, setDeleteRes] = useState<Reservation | null>(null);

  // Stats
  const stats = useMemo(() => {
    const payees = reservations.filter(r => r.statut === 'PAYEE');
    return {
      total: reservations.length,
      payees: payees.length,
      enCours: reservations.filter(r => r.statut === 'EN_COURS').length,
      annulees: reservations.filter(r => r.statut === 'ANNULEE').length,
      revenu: payees.reduce((sum, r) => sum + totalPrix(r), 0),
    };
  }, [reservations]);

  // Fetch initial
  useEffect(() => {
    if (fetchStatus === 'idle') {
      dispatch(fetchReservations());
    }
  }, [dispatch, fetchStatus]);

  const handleApplyFilters = () => {
    dispatch(fetchReservations({
      statut: filterStatut || undefined,
      dateDebut: filterDebut || undefined,
      dateFin: filterFin || undefined,
    }));
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilterStatut('');
    setFilterDebut('');
    setFilterFin('');
    dispatch(fetchReservations());
  };

  // Filtrage local
  const filteredReservations = useMemo(() => {
    if (!search.trim()) return reservations;

    const q = search.toLowerCase();
    return reservations.filter((r) =>
      r.reference.toLowerCase().includes(q) ||
      r.utilisateur?.email?.toLowerCase().includes(q) ||
      `${r.utilisateur?.prenom ?? ''} ${r.utilisateur?.nom ?? ''}`.toLowerCase().includes(q) ||
      r.seance?.film?.title?.toLowerCase().includes(q)
    );
  }, [reservations, search]);

  const handleChangeStatut = async (id: number, statut: StatutReservation) => {
    try {
      await dispatch(updateReservationStatut({ id, dto: { statut } })).unwrap();
      setDetailRes(prev => prev?.id_reservation === id ? { ...prev, statut } : prev);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteRes) return;
    try {
      await dispatch(deleteReservation(deleteRes.id_reservation)).unwrap();
      setDeleteRes(null);
      if (detailRes?.id_reservation === deleteRes.id_reservation) setDetailRes(null);
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = fetchStatus === 'loading';

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Réservations</h1>
          <p className="mt-1 text-zinc-400">Suivi et gestion des réservations</p>
        </div>
        <button
          onClick={() => dispatch(fetchReservations())}
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-white/20 hover:text-white"
        >
          ↻ Actualiser
        </button>
      </div>

      {/* Erreurs */}
      {(fetchError || updateState.error || deleteState.error) && (
        <div className="rounded-xl border border-red-500/30 bg-red-600/10 px-4 py-3 text-sm text-red-400">
          {fetchError || updateState.error || deleteState.error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Payées', value: stats.payees, color: 'text-emerald-400' },
          { label: 'En cours', value: stats.enCours, color: 'text-amber-300' },
          { label: 'Annulées', value: stats.annulees, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <article key={label} className="rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{label}</p>
            <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
          </article>
        ))}

        <article className="col-span-2 rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-4 sm:col-span-4 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Revenu (payées)</p>
          <p className="mt-1 text-2xl font-black text-white">{stats.revenu.toFixed(2)} €</p>
        </article>
      </div>

      {/* Recherche + Filtres */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher référence, client, film..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-10 py-3 text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm hover:bg-white/5"
          >
            Filtres {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <button
            onClick={handleApplyFilters}
            className="rounded-2xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500"
          >
            Appliquer
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-xs text-zinc-500">Statut</label>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value as StatutReservation | '')}
                className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm"
              >
                <option value="">Tous les statuts</option>
                {STATUTS.map(s => (
                  <option key={s} value={s}>{STATUT_META[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-xs text-zinc-500">Du</label>
              <input type="date" value={filterDebut} onChange={e => setFilterDebut(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="block mb-1 text-xs text-zinc-500">Au</label>
              <input type="date" value={filterFin} onChange={e => setFilterFin(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm" />
            </div>
          </div>
        )}

        <button onClick={handleResetFilters} className="mt-4 text-sm text-zinc-400 hover:text-white underline">
          Réinitialiser les filtres
        </button>
      </div>

      {/* Tableau des réservations */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-widest text-zinc-500">
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Séance</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center text-zinc-400">Chargement des réservations...</td></tr>
              ) : filteredReservations.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-zinc-400">Aucune réservation trouvée</td></tr>
              ) : (
                filteredReservations.map((res) => (
                  <tr key={res.id_reservation} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono">{res.reference}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p>{res.utilisateur.prenom} {res.utilisateur.nom}</p>
                        <p className="text-xs text-zinc-500">{res.utilisateur.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{res.seance.film.title}</div>
                      <div className="text-xs text-zinc-500">{formatDateTime(res.seance.dateHeure)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatutBadge statut={res.statut} />
                    </td>
                    <td className="px-6 py-4 font-semibold">{totalPrix(res).toFixed(2)} €</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setDetailRes(res)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => setDeleteRes(res)} className="p-2 hover:bg-white/10 rounded-lg text-red-400 hover:text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {detailRes && (
        <DetailModal
          reservation={detailRes}
          onClose={() => setDetailRes(null)}
          onChangeStatut={(statut) => handleChangeStatut(detailRes.id_reservation, statut)}
          isUpdating={updateState.status === 'loading'}
        />
      )}

      {deleteRes && (
        <DeleteModal
          reservation={deleteRes}
          onClose={() => setDeleteRes(null)}
          onConfirm={handleDelete}
          isLoading={deleteState.status === 'loading'}
        />
      )}
    </div>
  );
}