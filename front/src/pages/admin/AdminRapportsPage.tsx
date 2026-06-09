import {
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Download,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { adminStatsApi } from '../../services/adminStatsApi';
import { http } from '../../services/http';

type DatePreset = 'week' | 'month' | 'year' | 'custom';
type RevenueGranularity = 'week' | 'month' | 'year';

type ActivityStatus =
  | 'PAYEE'
  | 'VALIDEE'
  | 'UTILISEE'
  | 'ANNULEE'
  | 'EXPIREE'
  | 'EN_COURS'
  | string;

type ActivityRow = {
  id: number;
  utilisateur: string;
  film: string;
  sieges: string;
  montant: number;
  statut: ActivityStatus;
  date: string; // ISO
};

const CARD_CLASS =
  'rounded-2xl bg-[#1F1F1F] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfWeekSunday(d: Date) {
  const start = startOfWeekMonday(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfMonth(d: Date) {
  const date = new Date(d.getFullYear(), d.getMonth(), 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfMonth(d: Date) {
  const date = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  date.setHours(23, 59, 59, 999);
  return date;
}

function startOfYear(d: Date) {
  const date = new Date(d.getFullYear(), 0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfYear(d: Date) {
  const date = new Date(d.getFullYear(), 11, 31);
  date.setHours(23, 59, 59, 999);
  return date;
}

function parsePercent(percent: string | null | undefined) {
  const raw = String(percent ?? '').replace('%', '').trim();
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function statusLabel(status: ActivityStatus) {
  switch (status) {
    case 'PAYEE':
      return 'Payée';
    case 'VALIDEE':
      return 'Validée';
    case 'UTILISEE':
      return 'Utilisée';
    case 'ANNULEE':
      return 'Annulée';
    case 'EXPIREE':
      return 'Expirée';
    case 'EN_COURS':
      return 'En cours';
    default:
      return status;
  }
}

function formatMoneyDh(n: number) {
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} DH`;
}

function formatDateTimeFr(iso: string) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Array<Record<string, string | number | null | undefined>>) {
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>()),
  );

  const escape = (value: string) => {
    if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
      return `"${value.replaceAll('"', '""')}"`;
    }
    return value;
  };

  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(
      headers
        .map((h) => {
          const v = row[h];
          if (v === null || v === undefined) return '';
          return escape(String(v));
        })
        .join(','),
    );
  }
  return lines.join('\n');
}

function Skeleton({ className }: { className: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white/5 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.10),transparent)] animate-[shimmer_1.2s_infinite]" />
    </div>
  );
}

function useStaggeredShow(count: number, stepMs = 100) {
  const [shown, setShown] = useState<boolean[]>(() => Array.from({ length: count }, () => false));
  useEffect(() => {
    const timers: number[] = [];
    setShown(Array.from({ length: count }, () => false));
    for (let i = 0; i < count; i++) {
      timers.push(window.setTimeout(() => {
        setShown((prev) => {
          const next = prev.slice();
          next[i] = true;
          return next;
        });
      }, i * stepMs));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [count, stepMs]);
  return shown;
}

function statusBadge(status: ActivityStatus) {
  if (status === 'PAYEE' || status === 'VALIDEE' || status === 'UTILISEE') {
    return 'bg-emerald-500/15 text-emerald-300';
  }
  if (status === 'EN_COURS') return 'bg-amber-500/15 text-amber-300';
  return 'bg-[#E50914]/15 text-[#E50914]';
}

function occupancyBarColor(p: number) {
  if (p >= 75) return '#10b981';
  if (p >= 50) return '#f59e0b';
  return '#E50914';
}

const fallbackPoster =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=85';

type RevenuePoint = { label: string; revenue: number; paiements: number };
type OccupancyPoint = { name: string; value: number };
type DonutPoint = { name: string; value: number; color: string };
type RadarPoint = { genre: string; value: number };

type AdminReservationsResponse = {
  total: number;
  reservations: Array<{
    id: number;
    reference: string;
    statut: string;
    dateReservation: string;
    montant: number;
    client: { nom?: string; prenom?: string; email?: string };
    film?: string;
    cinema?: string;
    dateSeance?: string;
  }>;
};

type SortKey = keyof Pick<ActivityRow, 'id' | 'utilisateur' | 'film' | 'sieges' | 'montant' | 'statut' | 'date'>;
type SortDir = 'asc' | 'desc';

function compareValues(a: string | number, b: string | number) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'fr', { sensitivity: 'base' });
}

export default function AdminRapportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<DatePreset>('week');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [revGranularity, setRevGranularity] = useState<RevenueGranularity>('week');

  const [revenus, setRevenus] = useState<Awaited<ReturnType<typeof adminStatsApi.revenus>> | null>(null);
  const [films, setFilms] = useState<Awaited<ReturnType<typeof adminStatsApi.films>> | null>(null);
  const [seances, setSeances] = useState<Awaited<ReturnType<typeof adminStatsApi.seances>> | null>(null);
  const [reservationsStats, setReservationsStats] = useState<Awaited<ReturnType<typeof adminStatsApi.reservations>> | null>(null);
  const [activityRows, setActivityRows] = useState<ActivityRow[]>([]);

  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const shown = useStaggeredShow(5, 100);

  const range = useMemo(() => {
    const now = new Date();
    const fallback = { from: toYmd(startOfWeekMonday(now)), to: toYmd(endOfWeekSunday(now)) };

    if (preset === 'week') return fallback;
    if (preset === 'month') return { from: toYmd(startOfMonth(now)), to: toYmd(endOfMonth(now)) };
    if (preset === 'year') return { from: toYmd(startOfYear(now)), to: toYmd(endOfYear(now)) };
    // custom
    const from = customFrom || customTo;
    const to = customTo || customFrom;
    if (!from || !to) return fallback;
    return { from, to };
  }, [customFrom, customTo, preset]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      adminStatsApi.revenus({ dateDebut: range.from, dateFin: range.to }),
      adminStatsApi.films({ dateDebut: range.from, dateFin: range.to, limit: 50 }),
      adminStatsApi.seances({ dateDebut: range.from, dateFin: range.to, limit: 200 }),
      adminStatsApi.reservations({ dateDebut: range.from, dateFin: range.to }),
      http
        .get<AdminReservationsResponse>('/admin/reservations', {
          params: { dateDebut: range.from, dateFin: range.to },
        })
        .then((r) => r.data),
    ])
      .then(([rev, filmsRes, seancesRes, resStats, resList]) => {
        if (cancelled) return;
        setRevenus(rev);
        setFilms(filmsRes);
        setSeances(seancesRes);
        setReservationsStats(resStats);

        const rows: ActivityRow[] = (resList.reservations ?? []).slice(0, 60).map((r) => {
          const prenom = r.client?.prenom?.trim() ?? '';
          const nom = r.client?.nom?.trim() ?? '';
          const utilisateur = `${prenom} ${nom}`.trim() || r.client?.email || '—';
          return {
            id: r.id,
            utilisateur,
            film: r.film || '—',
            sieges: '—',
            montant: Number(r.montant ?? 0),
            statut: String(r.statut ?? ''),
            date: r.dateReservation,
          };
        });
        setActivityRows(rows);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message ? String(e.message) : 'Erreur lors du chargement des rapports');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range.from, range.to]);

  useEffect(() => {
    setPage(1);
  }, [sortKey, sortDir]);

  const occupancyBySalle = useMemo<OccupancyPoint[]>(() => {
    const list = seances?.seances ?? [];
    const agg = new Map<string, { sum: number; count: number }>();
    for (const s of list) {
      const name = s.salle ?? '—';
      const p = parsePercent(s.tauxRemplissage);
      const prev = agg.get(name) ?? { sum: 0, count: 0 };
      agg.set(name, { sum: prev.sum + p, count: prev.count + 1 });
    }
    return Array.from(agg.entries())
      .map(([name, v]) => ({ name, value: v.count ? Math.round(v.sum / v.count) : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [seances]);

  const occAvg = useMemo(() => {
    return occupancyBySalle.length
      ? Math.round(occupancyBySalle.reduce((sum, d) => sum + d.value, 0) / occupancyBySalle.length)
      : 0;
  }, [occupancyBySalle]);

  const topFilms = useMemo(() => {
    const list = (films?.films ?? []).slice().sort((a, b) => b.nbReservations - a.nbReservations);
    return list.slice(0, 5).map((f) => ({
      title: f.title,
      genre: f.genre || '—',
      tickets: f.nbReservations,
      poster: f.poster || fallbackPoster,
      ca: f.chiffreAffaires,
    }));
  }, [films]);

  const topTicketsMax = topFilms[0]?.tickets ?? 1;

  const reservationsDonut = useMemo<DonutPoint[]>(() => {
    const colors = ['#E50914', '#fb7185', '#f59e0b', '#10b981', '#f5c542', '#a78bfa'];
    const list = reservationsStats?.parStatut ?? [];
    return list
      .slice()
      .sort((a, b) => b.count - a.count)
      .map((s, idx) => ({ name: statusLabel(s.statut), value: s.count, color: colors[idx % colors.length] }));
  }, [reservationsStats]);

  const donutTotal = useMemo(() => reservationsDonut.reduce((sum, d) => sum + d.value, 0), [reservationsDonut]);

  const radarByGenre = useMemo<RadarPoint[]>(() => {
    const list = films?.films ?? [];
    const agg = new Map<string, number>();
    for (const f of list) {
      const key = f.genre || 'Autre';
      agg.set(key, (agg.get(key) ?? 0) + Number(f.chiffreAffaires ?? 0));
    }
    const raw = Array.from(agg.entries()).map(([genre, ca]) => ({ genre, ca }));
    raw.sort((a, b) => b.ca - a.ca);
    const top = raw.slice(0, 8);
    const max = top[0]?.ca ?? 1;
    return top.map((d) => ({ genre: d.genre, value: Math.round((d.ca / max) * 100) }));
  }, [films]);

  const revenueData = useMemo<RevenuePoint[]>(() => {
    const src = revenus?.parJour ?? [];
    if (!src.length) return [];

    const items = src
      .map((d) => {
        const date = new Date(d.jour);
        return {
          date,
          revenue: Number(d.ca ?? 0),
          paiements: Number(d.nbPaiements ?? 0),
        };
      })
      .filter((d) => Number.isFinite(d.date.getTime()));

    if (revGranularity === 'week') {
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      return items.map((d) => ({
        label: dayNames[d.date.getDay()] ?? toYmd(d.date),
        revenue: d.revenue,
        paiements: d.paiements,
      }));
    }

    if (revGranularity === 'month') {
      const map = new Map<number, { revenue: number; paiements: number }>();
      for (const d of items) {
        const weekOfMonth = Math.min(5, Math.ceil(d.date.getDate() / 7));
        const prev = map.get(weekOfMonth) ?? { revenue: 0, paiements: 0 };
        map.set(weekOfMonth, { revenue: prev.revenue + d.revenue, paiements: prev.paiements + d.paiements });
      }
      return Array.from(map.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([w, v]) => ({ label: `S${w}`, revenue: Math.round(v.revenue * 100) / 100, paiements: v.paiements }));
    }

    // year
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const map = new Map<number, { revenue: number; paiements: number }>();
    for (const d of items) {
      const m = d.date.getMonth();
      const prev = map.get(m) ?? { revenue: 0, paiements: 0 };
      map.set(m, { revenue: prev.revenue + d.revenue, paiements: prev.paiements + d.paiements });
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([m, v]) => ({ label: monthNames[m] ?? String(m + 1), revenue: Math.round(v.revenue * 100) / 100, paiements: v.paiements }));
  }, [revGranularity, revenus]);

  const sortedActivity = useMemo(() => {
    const rows = activityRows.slice();
    rows.sort((ra, rb) => {
      const a = ra[sortKey];
      const b = rb[sortKey];
      const av = sortKey === 'date' ? new Date(a as string).getTime() : a;
      const bv = sortKey === 'date' ? new Date(b as string).getTime() : b;
      const cmp = compareValues(av as any, bv as any);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [activityRows, sortDir, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedActivity.length / pageSize));
  const pageRows = sortedActivity.slice((page - 1) * pageSize, page * pageSize);

  const exportVisible = () => {
    const rows = pageRows.map((r, idx) => ({
      '#': (page - 1) * pageSize + idx + 1,
      Utilisateur: r.utilisateur,
      Film: r.film,
      'Sièges': r.sieges,
      Montant: r.montant,
      Statut: r.statut,
      Date: formatDateTimeFr(r.date),
    }));
    downloadCsv('rapports-activite-visible.csv', toCsv(rows));
  };

  const sectionClass = (idx: number) =>
    `transition duration-500 ease-out ${shown[idx] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`;

  return (
    <div className="space-y-8">
      <style>
        {`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}
      </style>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Rapports &amp; Statistiques</h1>
          <p className="mt-2 text-zinc-400">Analyse des revenus, occupation et performance des films</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <Calendar className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            <select
              value={preset}
              onChange={(e) => {
                const nextPreset = e.target.value as DatePreset;
                setPreset(nextPreset);
                if (nextPreset !== 'custom') {
                  setRevGranularity(nextPreset);
                }
              }}
              className="bg-transparent text-sm font-semibold text-zinc-200 outline-none"
              aria-label="Période"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
              <option value="custom">Personnalisée</option>
            </select>
            <ChevronDown className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          </div>

          {preset === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-200 outline-none"
                aria-label="Du"
              />
              <span className="text-sm font-black text-zinc-500">→</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-200 outline-none"
                aria-label="Au"
              />
            </div>
          )}

          <button
            type="button"
            onClick={exportVisible}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#E50914] px-4 text-sm font-black text-white transition hover:brightness-110"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-zinc-200">
          {error}
        </div>
      ) : null}

      {/* Revenue full width */}
      <section className={sectionClass(0)}>
        <div className={CARD_CLASS}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-black">Revenus</h2>
            <div className="inline-flex rounded-xl bg-white/5 p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              {(
                [
                  { key: 'week', label: 'Semaine' },
                  { key: 'month', label: 'Mois' },
                  { key: 'year', label: 'Année' },
                ] as const
              ).map((t) => {
                const active = revGranularity === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setRevGranularity(t.key);
                      setPreset(t.key);
                    }}
                    className={`h-9 rounded-lg px-3 text-sm font-black transition ${
                      active ? 'bg-[#E50914] text-white' : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 h-[320px]">
            {loading ? (
              <Skeleton className="h-[320px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E50914" stopOpacity={0.42} />
                      <stop offset="100%" stopColor="#E50914" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#141414',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12,
                      color: 'white',
                    }}
                    formatter={(value: any, _name: any, ctx: any) => {
                      const revenue = Number(value);
                      const paiements = ctx?.payload?.paiements ?? 0;
                      return [`${formatMoneyDh(revenue)} · ${paiements} paiements`, 'Revenu'];
                    }}
                    labelFormatter={(label) => `${label}`}
                    cursor={{ stroke: 'rgba(229,9,20,0.4)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E50914"
                    strokeWidth={2}
                    fill="url(#revFill)"
                    isAnimationActive
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Second row */}
      <section className={`grid gap-6 lg:grid-cols-2 ${sectionClass(1)}`}>
        <div className={CARD_CLASS}>
          <h2 className="text-2xl font-black">Taux d'occupation par salle</h2>
          <div className="mt-6 h-[320px]">
            {loading ? (
              <Skeleton className="h-[320px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={occupancyBySalle}
                  layout="vertical"
                  margin={{ top: 10, right: 24, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#141414',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12,
                      color: 'white',
                    }}
                    formatter={(value) => [`${value}%`, 'Occupation']}
                  />
                  <ReferenceLine
                    x={75}
                    stroke="rgba(255,255,255,0.7)"
                    strokeDasharray="6 6"
                    label={{ value: 'Objectif', position: 'top', fill: 'rgba(255,255,255,0.65)' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 8, 8]} isAnimationActive>
                    {occupancyBySalle.map((d) => (
                      <Cell key={d.name} fill={occupancyBarColor(d.value)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className={CARD_CLASS}>
          <h2 className="text-2xl font-black">Top 5 Films les plus populaires</h2>
          <div className="mt-5 space-y-3">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)
              : topFilms.map((f, idx) => {
                  const pct = (f.tickets / topTicketsMax) * 100;
                  const rankColor =
                    idx === 0 ? 'text-[#f5c542]' : idx === 1 ? 'text-zinc-200' : idx === 2 ? 'text-amber-500' : 'text-zinc-500';
                  return (
                    <div
                      key={f.title}
                      className="group rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 text-center text-sm font-black ${rankColor}`}>{idx + 1}</div>
                        <div className="h-12 w-10 overflow-hidden rounded-lg bg-black/30">
                          <img src={f.poster} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate font-black text-zinc-100" title={f.title}>
                                {f.title}
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-black text-zinc-300 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                                  {f.genre}
                                </span>
                                <span className="text-xs font-black text-zinc-400">{f.tickets} tickets</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-[#E50914] transition-[width] duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </section>

      {/* Third row */}
      <section className={`grid gap-6 lg:grid-cols-2 ${sectionClass(2)}`}>
        <div className={CARD_CLASS}>
          <h2 className="text-2xl font-black">Réservations par statut</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="h-[280px]">
              {loading ? (
                <Skeleton className="h-[280px]" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        background: '#141414',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 12,
                        color: 'white',
                      }}
                      formatter={(value: any) => [String(value), 'Réservations']}
                    />
                    <Pie
                      data={reservationsDonut}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={78}
                      outerRadius={115}
                      paddingAngle={2}
                      isAnimationActive
                    >
                      {reservationsDonut.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-3">
              {reservationsDonut.map((d) => {
                const pct = donutTotal > 0 ? Math.round((d.value / donutTotal) * 100) : 0;
                return (
                  <div
                    key={d.name}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      <div>
                        <div className="text-sm font-black text-zinc-100">{d.name}</div>
                        <div className="text-xs font-semibold text-zinc-400">{pct}%</div>
                      </div>
                    </div>
                    <div className="text-sm font-black text-zinc-200">{d.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={CARD_CLASS}>
          <h2 className="text-2xl font-black">Revenus par genre de film</h2>
          <div className="mt-6 h-[320px]">
            {loading ? (
              <Skeleton className="h-[320px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarByGenre} outerRadius="78%">
                  <PolarGrid stroke="#2a2a2a" />
                  <PolarAngleAxis dataKey="genre" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#141414',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12,
                      color: 'white',
                    }}
                    formatter={(value: any) => [`${value}`, 'Indice revenu']}
                  />
                  <Radar
                    name="Revenus"
                    dataKey="value"
                    stroke="#E50914"
                    fill="#E50914"
                    fillOpacity={0.22}
                    isAnimationActive
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Bottom table */}
      <section className={sectionClass(3)}>
        <div className={CARD_CLASS}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-black">Activité récente</h2>
            <div className="text-sm font-semibold text-zinc-400">
              {sortedActivity.length} entrées · page {page}/{totalPages}
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            {loading ? (
              <Skeleton className="h-[420px]" />
            ) : (
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  <tr>
                    {(
                      [
                        { key: 'id', label: '#' },
                        { key: 'utilisateur', label: 'Utilisateur' },
                        { key: 'film', label: 'Film' },
                        { key: 'sieges', label: 'Sièges' },
                        { key: 'montant', label: 'Montant' },
                        { key: 'statut', label: 'Statut' },
                        { key: 'date', label: 'Date' },
                      ] as const
                    ).map((col) => {
                      const active = sortKey === col.key;
                      const dirIcon = active ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronDown;
                      const Icon = dirIcon;
                      return (
                        <th key={col.key} className="py-3 pr-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (sortKey === col.key) {
                                setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                              } else {
                                setSortKey(col.key);
                                setSortDir('asc');
                              }
                            }}
                            className="inline-flex items-center gap-1.5"
                          >
                            <span>{col.label}</span>
                            <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-zinc-600'}`} aria-hidden="true" />
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {pageRows.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-white/5">
                      <td className="py-3 pr-4 font-black text-zinc-200">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="py-3 pr-4 font-semibold text-zinc-200">{r.utilisateur}</td>
                      <td className="py-3 pr-4 text-zinc-300">
                        <div className="max-w-[240px] truncate" title={r.film}>
                          {r.film}
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-zinc-300">{r.sieges}</td>
                      <td className="py-3 pr-4 font-black text-white">{formatMoneyDh(r.montant)}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${statusBadge(r.statut)}`}>
                          {statusLabel(r.statut)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400">{formatDateTimeFr(r.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && (
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition ${
                  page <= 1 ? 'cursor-not-allowed bg-white/5 text-zinc-500' : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Précédent
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition ${
                  page >= totalPages
                    ? 'cursor-not-allowed bg-white/5 text-zinc-500'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                Suivant
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* small footer note for custom range */}
      {preset === 'custom' && (customFrom || customTo) ? (
        <div className={`text-xs font-semibold text-zinc-500 ${sectionClass(4)}`}>
          Période personnalisée: {customFrom || '…'} → {customTo || '…'}
        </div>
      ) : null}
    </div>
  );
}
