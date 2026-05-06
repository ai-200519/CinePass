import { Armchair, ArrowLeft, Calendar, DoorOpen, Info, Ticket } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { filmsApi, type Film } from '../features/films/filmsApi';
import { seancesApi, type Seance } from '../features/seances/seancesApi';

type SeatKind = 'available' | 'occupied' | 'vip';

type Seat = {
  row: string;
  col: number;
  kind: SeatKind;
};

type SeatSelectionNavState = {
  film?: Pick<Film, 'id' | 'title' | 'poster' | 'duration'>;
  seance?: Seance;
};

const ROWS = Array.from({ length: 12 }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));
const COLS = Array.from({ length: 12 }, (_, i) => i + 1);

const BASE_PRICE = 15.5;
const VIP_SURCHARGE = 3;
const MAX_SELECTION = 8;

const CURRENCY_LABEL = 'DH';

function mulberry32(seed: number) {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function formatDateFr(iso: string) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatTimeFr(iso: string) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return '';
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatMoney(amount: number) {
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function seatKey(seat: Seat) {
  return `${seat.row}${seat.col}`;
}

function isVipCenterBlock(rowLabel: string, col: number) {
  // VIP zone centered like the reference (rows E–F, cols 5–8)
  return (rowLabel === 'E' || rowLabel === 'F') && col >= 5 && col <= 8;
}

function buildSeatMatrix(seed: number) {
  const rng = mulberry32(seed || 1);
  const matrix: Array<Array<Seat | null>> = [];

  // 1) start with a full grid
  for (let r = 0; r < ROWS.length; r++) {
    const rowLabel = ROWS[r];
    const row: Array<Seat | null> = [];

    for (let c = 0; c < COLS.length; c++) {
      const colNum = COLS[c];
      const kind: SeatKind = isVipCenterBlock(rowLabel, colNum) ? 'vip' : 'available';
      row.push({ row: rowLabel, col: colNum, kind });
    }

    matrix.push(row);
  }

  // 2) mark some seats occupied (deterministic per seed), never VIP
  let occupiedPlaced = 0;
  const targetOccupied = 14;
  let safety = 0;
  while (occupiedPlaced < targetOccupied && safety < 2000) {
    safety += 1;
    const rr = Math.floor(rng() * ROWS.length);
    const cc = Math.floor(rng() * COLS.length);
    const seat = matrix[rr][cc];
    if (!seat) continue;
    if (seat.kind === 'vip') continue;
    if (seat.kind === 'occupied') continue;
    // bias: fewer occupied in the very front rows
    if (rr <= 1 && rng() < 0.65) continue;
    matrix[rr][cc] = { ...seat, kind: 'occupied' };
    occupiedPlaced += 1;
  }

  return matrix;
}

export default function SeatSelectionPage() {
  const { id } = useParams();
  const seanceId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state || {}) as SeatSelectionNavState;

  const [seance, setSeance] = useState<Seance | null>(navState.seance ?? null);
  const [film, setFilm] = useState<SeatSelectionNavState['film'] | null>(navState.film ?? null);
  const [loading, setLoading] = useState(!navState.seance || !navState.film);
  const [error, setError] = useState<string | null>(null);

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!Number.isFinite(seanceId)) {
        setError('Séance invalide.');
        setLoading(false);
        return;
      }

      // If we already have both, nothing to fetch
      if (navState.seance && navState.film) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedSeance = navState.seance ?? (await seancesApi.getById(seanceId));
        const fetchedFilm = navState.film ?? (await filmsApi.getById(fetchedSeance.film.id));
        if (cancelled) return;
        setSeance(fetchedSeance);
        setFilm({
          id: fetchedFilm.id,
          title: fetchedFilm.title,
          poster: fetchedFilm.poster,
          duration: fetchedFilm.duration,
        });
        setError(null);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.response?.data?.message || e?.message || 'Erreur de chargement.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [navState.film, navState.seance, seanceId]);

  const seatMatrix = useMemo(() => buildSeatMatrix(Number.isFinite(seanceId) ? seanceId : 1), [seanceId]);

  const selectedSeats = useMemo(() => {
    const seats: Seat[] = [];
    for (const row of seatMatrix) {
      for (const seat of row) {
        if (!seat) continue;
        if (selectedKeys.has(seatKey(seat))) seats.push(seat);
      }
    }
    return seats;
  }, [seatMatrix, selectedKeys]);

  const vipSelectedCount = selectedSeats.filter((s) => s.kind === 'vip').length;
  const seatCount = selectedSeats.length;
  const vipSupplement = vipSelectedCount * VIP_SURCHARGE;
  const total = seatCount * BASE_PRICE + vipSupplement;

  const bannerTime = seance ? formatTimeFr(seance.dateHeure) : '';
  const bannerDate = seance ? formatDateFr(seance.dateHeure) : '';

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm font-bold text-zinc-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li>Film</li>
            <li className="text-zinc-600">›</li>
            <li>Séance</li>
            <li className="text-zinc-600">›</li>
            <li className="text-white">Sièges</li>
            <li className="text-zinc-600">›</li>
            <li>Paiement</li>
          </ol>
        </nav>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-black text-zinc-200 transition hover:bg-white/10"
                aria-label="Retour"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Retour
              </button>

              <div className="h-12 w-px bg-white/10" />

              <div className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                  {film?.poster ? (
                    <img src={film.poster} alt={film.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-500">
                      <Ticket className="h-5 w-5" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-2xl font-black text-white">{film?.title || '—'}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm font-bold text-zinc-400">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      {bannerDate || '--/--/----'}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="inline-flex items-center gap-2">
                      <Info className="h-4 w-4" aria-hidden="true" />
                      {bannerTime || '--:--'}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="inline-flex items-center gap-2">
                      <DoorOpen className="h-4 w-4" aria-hidden="true" />
                      Salle {seance?.salle?.numero ?? '-'}
                    </span>
                    <span className="rounded-full bg-[#E50914]/15 px-3 py-1 text-xs font-black text-[#E50914]">
                      {seance?.technologie || '2D'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {loading && <div className="text-sm font-bold text-zinc-400">Chargement…</div>}
            {error && !loading && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[7fr_3fr]">
          {/* Seat Map */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mx-auto mb-5 max-w-2xl">
              <div className="relative flex justify-center">
                <div className="absolute -top-2 h-10 w-[88%] rounded-[999px] bg-white/10 blur-xl" />
                <div className="h-8 w-[88%] rounded-[999px] border-t-2 border-white/25" />
              </div>
              <div className="mt-2 text-center text-xs font-black tracking-[0.2em] text-zinc-400">ÉCRAN</div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="space-y-3">
                  {ROWS.map((rowLabel, rowIdx) => (
                    <div key={rowLabel} className="grid grid-cols-[22px_1fr] items-center gap-4">
                      <div className="text-xs font-black text-zinc-500">{rowLabel}</div>
                      <div className="grid grid-cols-12 gap-2">
                        {COLS.map((colNum, colIdx) => {
                          const seat = seatMatrix[rowIdx][colIdx];
                          if (!seat) {
                            return <div key={`${rowLabel}${colNum}`} className="h-9 w-9" />;
                          }

                          const key = seatKey(seat);
                          const isSelected = selectedKeys.has(key);
                          const isOccupied = seat.kind === 'occupied';
                          const isVip = seat.kind === 'vip';

                          const baseClasses =
                            'h-9 w-9 rounded-lg border text-xs font-black outline-none transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out';

                          const kindClasses = isSelected
                            ? 'bg-[#E50914] border-[#E50914] shadow-[0_0_0_0_rgba(0,0,0,0)]'
                            : isOccupied
                              ? 'bg-[#1a1a1a] border-[#2a2a2a] opacity-70 cursor-not-allowed'
                              : isVip
                                ? 'bg-[#1f1f1f] border-[#f5c542]'
                                : 'bg-[#1f1f1f] border-[#2f2f2f]';

                          const hoverClasses = !isOccupied
                            ? 'hover:scale-[1.04] active:scale-[0.97]'
                            : '';

                          const tooltip = `${rowLabel}${colNum}${isVip ? ' - VIP' : ''}`;

                          return (
                            <button
                              key={key}
                              type="button"
                              title={tooltip}
                              disabled={isOccupied}
                              onClick={() => {
                                if (isOccupied) return;

                                setSelectedKeys((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(key)) {
                                    next.delete(key);
                                    return next;
                                  }

                                  if (next.size >= MAX_SELECTION) {
                                    setToast(`Maximum ${MAX_SELECTION} sièges.`);
                                    return prev;
                                  }

                                  next.add(key);
                                  return next;
                                });
                              }}
                              className={`${baseClasses} ${kindClasses} ${hoverClasses} animate-seat-in`}
                              style={{ animationDelay: `${rowIdx * 40 + colIdx * 12}ms` }}
                              aria-label={tooltip}
                            >
                              {isSelected ? (
                                <span className="flex h-full w-full flex-col items-center justify-center leading-none">
                                  <Armchair className="h-4 w-4 text-white" aria-hidden="true" />
                                  <span className="mt-0.5 text-[9px] font-black text-white/95">{rowLabel}{colNum}</span>
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-zinc-400">
              <div className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-[#2f2f2f] bg-[#1f1f1f]" />
                Disponible
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-[#E50914] bg-[#E50914]" />
                Sélectionné
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-[#2a2a2a] bg-[#1a1a1a]" />
                Occupé
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded border-2 border-[#f5c542] bg-[#1f1f1f]" />
                VIP (+3 {CURRENCY_LABEL})
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="h-fit self-start rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-black">Votre sélection</h2>

            {seatCount === 0 ? (
              <div className="mt-10 flex flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                  <Armchair className="h-8 w-8 text-zinc-300" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold text-zinc-400">Sélectionnez vos sièges pour continuer</p>
              </div>
            ) : (
              <div className="mt-6">
                <div className="text-sm font-bold text-zinc-400">Sièges sélectionnés:</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSeats
                    .slice()
                    .sort((a, b) => seatKey(a).localeCompare(seatKey(b)))
                    .map((s) => {
                      const vip = s.kind === 'vip';
                      return (
                        <span
                          key={seatKey(s)}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${
                            vip
                              ? 'border-[#f5c542]/30 bg-[#f5c542]/10 text-[#f5c542]'
                              : 'border-[#E50914]/25 bg-[#E50914]/15 text-[#E50914]'
                          }`}
                        >
                          <Armchair className="h-3.5 w-3.5" aria-hidden="true" />
                          {seatKey(s)}
                        </span>
                      );
                    })}
                </div>

                <div className="mt-6 space-y-2 text-sm font-bold text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>Nombre de places:</span>
                    <span className="text-white">{seatCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Prix unitaire:</span>
                    <span className="text-white">{formatMoney(BASE_PRICE)} {CURRENCY_LABEL}</span>
                  </div>
                  {vipSelectedCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Supplément VIP:</span>
                      <span className="text-white">+{formatMoney(vipSupplement)} {CURRENCY_LABEL}</span>
                    </div>
                  )}

                  <div className="mt-4 h-px bg-white/10" />

                  <div className="flex items-center justify-between pt-3 text-lg font-black">
                    <span>Total:</span>
                    <span className="text-[#E50914]">{formatMoney(total)} {CURRENCY_LABEL}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={seatCount === 0}
                  className={`mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-black text-white transition ${
                    seatCount === 0
                      ? 'cursor-not-allowed bg-white/10 text-zinc-400'
                      : 'bg-[#E50914] hover:brightness-110'
                  }`}
                >
                  Continuer vers le paiement
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="animate-snackbar-in rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm font-black text-white backdrop-blur-xl">
            {toast}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
