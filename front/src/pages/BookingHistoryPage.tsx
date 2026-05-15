import { Calendar, Clock, DoorOpen, Download, Filter, Search, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import {
  reservationsApi,
  type ReservationSummary,
} from '../features/reservations/reservationsapi';

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUT_LABELS: Record<string, string> = {
  EN_COURS: 'En cours',
  PAYEE: 'Payée',
  VALIDEE: 'Validée',
  UTILISEE: 'Utilisée',
  ANNULEE: 'Annulée',
  EXPIREE: 'Expirée',
};

const STATUT_STYLES: Record<string, string> = {
  EN_COURS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PAYEE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  VALIDEE: 'bg-green-500/10 text-green-400 border-green-500/20',
  UTILISEE: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  ANNULEE: 'bg-red-500/10 text-red-400 border-red-500/20',
  EXPIREE: 'bg-zinc-700/30 text-zinc-500 border-zinc-700/30',
};

const ALL_STATUTS = ['EN_COURS', 'PAYEE', 'VALIDEE', 'UTILISEE', 'ANNULEE', 'EXPIREE'];

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

// ─── Component ───────────────────────────────────────────────────────────────
export default function BookingHistoryPage() {
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatut, setActiveStatut] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    reservationsApi
      .getMine()
      .then((data) => setReservations(data.reservations))
      .catch((e: any) => setError(e?.response?.data?.message || e?.message || 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = reservations.filter((r) => {
    const matchStatut = activeStatut === 'ALL' || r.statut === activeStatut;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.film?.toLowerCase().includes(q) ||
      r.reference?.toLowerCase().includes(q) ||
      r.salle?.toLowerCase().includes(q);
    return matchStatut && matchSearch;
  });

  // ── Counts per statut ─────────────────────────────────────────────────────
  const counts = reservations.reduce<Record<string, number>>((acc, r) => {
    acc[r.statut] = (acc[r.statut] ?? 0) + 1;
    return acc;
  }, {});

  // ── Ticket accessible? ────────────────────────────────────────────────────
  const canViewTicket = (statut: string) =>
    ['PAYEE', 'VALIDEE', 'UTILISEE'].includes(statut);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-red-400">Mon compte</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">Historique des réservations</h1>
          <p className="mt-2 text-sm font-bold text-zinc-400">
            {reservations.length} réservation{reservations.length !== 1 ? 's' : ''} au total
          </p>
        </div>

        {/* ── Search + Filter bar ── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un film, une référence…"
              className="h-10 w-full rounded-xl border border-white/10 bg-zinc-900 pl-9 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
            />
          </div>

          {/* Statut tabs */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-white/8 bg-zinc-900 p-1">
            <Filter className="ml-1 h-3.5 w-3.5 shrink-0 text-zinc-600" />
            <button
              onClick={() => setActiveStatut('ALL')}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-black transition ${
                activeStatut === 'ALL'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Tous ({reservations.length})
            </button>
            {ALL_STATUTS.filter((s) => counts[s]).map((s) => (
              <button
                key={s}
                onClick={() => setActiveStatut(s)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-black transition ${
                  activeStatut === s
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {STATUT_LABELS[s]} ({counts[s]})
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-200">
            {error}
          </div>
        )}

        {/* ── List ── */}
        {loading ? (
          <div className="flex h-48 items-center justify-center text-zinc-500">
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-white/8 bg-zinc-950 text-zinc-400">
            <Ticket className="h-8 w-8 opacity-30" />
            <p className="font-bold">Aucune réservation trouvée.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((res) => (
              <article
                key={res.id_reservation}
                className="group overflow-hidden rounded-2xl border border-white/8 bg-zinc-950 transition hover:border-white/15"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Poster */}
                  <div className="relative h-40 w-full shrink-0 overflow-hidden bg-zinc-900 md:h-auto md:w-36">
                    {res.poster ? (
                      <img
                        src={res.poster}
                        alt={res.film}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-700">
                        <Ticket className="h-8 w-8" />
                      </div>
                    )}
                    {/* Statut overlay on mobile */}
                    <div className="absolute left-3 top-3 md:hidden">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${
                          STATUT_STYLES[res.statut] ?? 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {STATUT_LABELS[res.statut] ?? res.statut}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black leading-tight">{res.film}</h2>
                        <p className="mt-0.5 text-sm font-bold text-red-400">{res.reference}</p>
                      </div>
                      {/* Statut badge — desktop */}
                      <span
                        className={`hidden shrink-0 rounded-full border px-3 py-1 text-xs font-black md:inline-flex ${
                          STATUT_STYLES[res.statut] ?? 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {STATUT_LABELS[res.statut] ?? res.statut}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-zinc-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-red-400" />
                        {formatDateOnly(res.dateSeance)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-red-400" />
                        {formatTime(res.dateSeance)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <DoorOpen className="h-4 w-4 text-red-400" />
                        {res.salle}
                        {res.technologie ? ` · ${res.technologie}` : ''}
                      </span>
                      <span className="text-zinc-500">
                        {res.nbSieges} siège{res.nbSieges > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 flex items-center justify-between border-t border-white/6 pt-4">
                      <p className="text-xs text-zinc-600">
                        Réservé le {formatDateTime(res.dateSeance)}
                      </p>

                      {canViewTicket(res.statut) && (
                        <Link
                          to={`/reservations/${res.id_reservation}/ticket`}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:border-red-500/40 hover:bg-red-600/10 hover:text-red-300"
                        >
                          <Download className="h-4 w-4" />
                          Voir le billet
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}