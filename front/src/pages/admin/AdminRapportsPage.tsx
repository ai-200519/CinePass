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

type DatePreset = 'week' | 'month' | 'year' | 'custom';
type RevenueGranularity = 'week' | 'month' | 'year';

type ActivityStatus = 'CONFIRME' | 'EN_ATTENTE' | 'ANNULE';

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
  if (status === 'CONFIRME') return 'bg-emerald-500/15 text-emerald-300';
  if (status === 'EN_ATTENTE') return 'bg-amber-500/15 text-amber-300';
  return 'bg-[#E50914]/15 text-[#E50914]';
}

function occupancyBarColor(p: number) {
  if (p >= 75) return '#10b981';
  if (p >= 50) return '#f59e0b';
  return '#E50914';
}

const fallbackPoster =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=85';

const TOP_FILMS = [
  { title: 'The Shawshank Redemption', genre: 'Drame', tickets: 1240, poster: fallbackPoster },
  { title: 'Dune: Part Two', genre: 'Sci-Fi', tickets: 980, poster: fallbackPoster },
  { title: 'Inside Out 2', genre: 'Animation', tickets: 860, poster: fallbackPoster },
  { title: 'Oppenheimer', genre: 'Drame', tickets: 740, poster: fallbackPoster },
  { title: 'Apocalypse', genre: 'Action', tickets: 680, poster: fallbackPoster },
];

const OCCUPANCY_BY_SALLE = [
  { name: 'Salle 1', value: 85 },
  { name: 'Salle 2', value: 72 },
  { name: 'Salle 3', value: 61 },
  { name: 'Salle 4', value: 49 },
  { name: 'Salle 5', value: 38 },
];

const RESERVATIONS_BY_TYPE = [
  { name: 'Standard', value: 840, color: '#E50914' },
  { name: 'VIP', value: 210, color: '#f5c542' },
  { name: 'Couple', value: 130, color: '#fb7185' },
  { name: 'Étudiant', value: 95, color: '#f59e0b' },
];

const REVENUE_BY_GENRE = [
  { genre: 'Action', value: 82 },
  { genre: 'Drame', value: 76 },
  { genre: 'Comédie', value: 55 },
  { genre: 'Sci-Fi', value: 88 },
  { genre: 'Horreur', value: 41 },
  { genre: 'Animation', value: 67 },
];

const REVENUE_YEAR = [
  { label: 'Jan', revenue: 18200, tickets: 1100 },
  { label: 'Fév', revenue: 16500, tickets: 980 },
  { label: 'Mar', revenue: 20100, tickets: 1210 },
  { label: 'Avr', revenue: 22400, tickets: 1330 },
  { label: 'Mai', revenue: 19600, tickets: 1180 },
  { label: 'Juin', revenue: 23800, tickets: 1410 },
  { label: 'Juil', revenue: 25200, tickets: 1505 },
  { label: 'Aoû', revenue: 24600, tickets: 1460 },
  { label: 'Sep', revenue: 21900, tickets: 1310 },
  { label: 'Oct', revenue: 23100, tickets: 1360 },
  { label: 'Nov', revenue: 21200, tickets: 1260 },
  { label: 'Déc', revenue: 26400, tickets: 1580 },
];

const REVENUE_MONTH = [
  { label: 'S1', revenue: 5200, tickets: 320 },
  { label: 'S2', revenue: 6100, tickets: 370 },
  { label: 'S3', revenue: 5800, tickets: 350 },
  { label: 'S4', revenue: 6900, tickets: 410 },
];

const REVENUE_WEEK = [
  { label: 'Lun', revenue: 720, tickets: 44 },
  { label: 'Mar', revenue: 840, tickets: 52 },
  { label: 'Mer', revenue: 990, tickets: 63 },
  { label: 'Jeu', revenue: 910, tickets: 57 },
  { label: 'Ven', revenue: 1320, tickets: 82 },
  { label: 'Sam', revenue: 1680, tickets: 104 },
  { label: 'Dim', revenue: 1420, tickets: 90 },
];

const ACTIVITY_ROWS: ActivityRow[] = Array.from({ length: 36 }, (_, i) => {
  const base = new Date();
  base.setMinutes(base.getMinutes() - i * 18);
  const statuses: ActivityStatus[] = ['CONFIRME', 'EN_ATTENTE', 'ANNULE'];
  const status = statuses[i % statuses.length];
  return {
    id: 1000 + i,
    utilisateur: ['Yassine Elaouni', 'Sara Amrani', 'Hamza Benali', 'Imane Lahlou', 'Mehdi Rami'][i % 5],
    film: TOP_FILMS[i % TOP_FILMS.length].title,
    sieges: i % 4 === 0 ? 'E7,E8' : i % 4 === 1 ? 'F9' : i % 4 === 2 ? 'D9,F9,G9' : 'B4,B5',
    montant: [120, 90, 150, 75, 180][i % 5],
    statut: status,
    date: base.toISOString(),
  };
});

type SortKey = keyof Pick<ActivityRow, 'id' | 'utilisateur' | 'film' | 'sieges' | 'montant' | 'statut' | 'date'>;
type SortDir = 'asc' | 'desc';

function compareValues(a: string | number, b: string | number) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'fr', { sensitivity: 'base' });
}

export default function AdminRapportsPage() {
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<DatePreset>('week');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [revGranularity, setRevGranularity] = useState<RevenueGranularity>('year');

  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const shown = useStaggeredShow(5, 100);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [sortKey, sortDir]);

  const revenueData = useMemo(() => {
    if (revGranularity === 'week') return REVENUE_WEEK;
    if (revGranularity === 'month') return REVENUE_MONTH;
    return REVENUE_YEAR;
  }, [revGranularity]);

  const occAvg = useMemo(() => {
    return Math.round(OCCUPANCY_BY_SALLE.reduce((sum, d) => sum + d.value, 0) / OCCUPANCY_BY_SALLE.length);
  }, []);

  const topTicketsMax = TOP_FILMS[0]?.tickets ?? 1;

  const typesTotal = useMemo(() => RESERVATIONS_BY_TYPE.reduce((sum, d) => sum + d.value, 0), []);

  const sortedActivity = useMemo(() => {
    const rows = ACTIVITY_ROWS.slice();
    rows.sort((ra, rb) => {
      const a = ra[sortKey];
      const b = rb[sortKey];
      const av = sortKey === 'date' ? new Date(a as string).getTime() : a;
      const bv = sortKey === 'date' ? new Date(b as string).getTime() : b;
      const cmp = compareValues(av as any, bv as any);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [sortDir, sortKey]);

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
              onChange={(e) => setPreset(e.target.value as DatePreset)}
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
                    onClick={() => setRevGranularity(t.key)}
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
                      const tickets = ctx?.payload?.tickets ?? 0;
                      return [`${formatMoneyDh(revenue)} · ${tickets} tickets`, 'Revenu'];
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
                  data={OCCUPANCY_BY_SALLE}
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
                    {OCCUPANCY_BY_SALLE.map((d) => (
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
              : TOP_FILMS.map((f, idx) => {
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
          <h2 className="text-2xl font-black">Réservations par type</h2>
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
                      data={RESERVATIONS_BY_TYPE}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={78}
                      outerRadius={115}
                      paddingAngle={2}
                      isAnimationActive
                    >
                      {RESERVATIONS_BY_TYPE.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-3">
              {RESERVATIONS_BY_TYPE.map((d) => {
                const pct = typesTotal > 0 ? Math.round((d.value / typesTotal) * 100) : 0;
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
                <RadarChart data={REVENUE_BY_GENRE} outerRadius="78%">
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
                          {r.statut === 'CONFIRME' ? 'Confirmé' : r.statut === 'EN_ATTENTE' ? 'En attente' : 'Annulé'}
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
