
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminStatsApi } from '../../services/adminStatsApi';
import { Ticket, Users, Film as FilmIcon,ArrowUpRight, RefreshCw, Star, Clock, Monitor } from 'lucide-react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { filmsApi, type Film as FilmType } from '../../features/films/filmsApi';
import { seancesApi, type Seance } from '../../features/seances/seancesApi';
import { reservationsApi, type Reservation } from '../../features/reservations/reservationsapi';
import { sallesApi, type Salle } from '../../features/salles/sallesApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const to = Number.isFinite(target) ? target : 0;
    const tick = (now: number) => {
      const t = clamp((now - start) / durationMs, 0, 1);
      setValue(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    setValue(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}
function formatInt(n: number) { return Math.round(n).toLocaleString('fr-FR'); }
function formatCurrency(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n);
}
const today = new Date().toISOString().split('T')[0];

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

function parsePercent(percent: string | null | undefined) {
  const raw = String(percent ?? '').replace('%', '').trim();
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

type KpiCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: { label: string };
  rightVisual?: React.ReactNode;
const STATUT_COLOR: Record<string, string> = {
  PROGRAMMEE: '#60a5fa', EN_COURS: '#34d399', TERMINEE: '#71717a', ANNULEE: '#E50914',
};

// ─── Film Card ────────────────────────────────────────────────────────────────
function FilmCard({ film, ticketCount, seanceCount }: {
  film: FilmType; ticketCount: number; seanceCount: number;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/8 transition-all duration-300 hover:border-red-500/40 hover:shadow-[0_0_30px_rgba(229,9,20,0.15)]"
      style={{ animationFillMode: 'both' }}
    >
      {/* Poster */}
      <div className="relative h-52 overflow-hidden bg-zinc-800">
        {film.poster && !imgError ? (
          <img
            src={film.poster}
            alt={film.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <FilmIcon className="h-16 w-16 text-zinc-700" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
        {/* Statut badge */}
        <div className="absolute top-3 left-3">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
            film.isShowing
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800/90 text-zinc-400 border border-white/10'
          }`}>
            {film.isShowing ? '● À l\'affiche' : 'À venir'}
          </span>
        </div>
        {/* Note */}
        {film.note > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-black text-amber-400">{film.note.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="truncate text-sm font-black tracking-tight text-white">{film.title}</h3>
        <p className="mt-0.5 truncate text-xs text-zinc-500">{film.genre} · {film.director}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-zinc-400">
            <Clock className="h-3 w-3" />
            <span className="text-xs">{film.duration} min</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-zinc-600">Séances</p>
              <p className="text-sm font-black text-white">{seanceCount}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-600">Tickets</p>
              <p className="text-sm font-black text-red-400">{ticketCount}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

type ChartPoint = { name: string; value: number };

function occupancyColor(value: number) {
  if (value > 80) return '#E50914';
  if (value >= 60) return '#fb7185';
  if (value >= 40) return '#f59e0b';
  return '#facc15';
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reservationsToday, setReservationsToday] = useState(0);
  const [revenusToday, setRevenusToday] = useState(0);
  const [avgOccupancy, setAvgOccupancy] = useState(0);
  const [ventesData, setVentesData] = useState<ChartPoint[]>([]);
  const [occupancyData, setOccupancyData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    let cancelled = false;

    const now = new Date();
    const today = toYmd(now);
    const weekStart = toYmd(startOfWeekMonday(now));
    const weekEnd = toYmd(endOfWeekSunday(now));

    setLoading(true);
    setError(null);

    Promise.all([
      adminStatsApi.global({ dateDebut: today, dateFin: today }),
      adminStatsApi.global({ dateDebut: weekStart, dateFin: weekEnd }),
      adminStatsApi.films({ dateDebut: weekStart, dateFin: weekEnd, limit: 6 }),
      adminStatsApi.seances({ dateDebut: weekStart, dateFin: weekEnd, limit: 200 }),
    ])
      .then(([globalToday, globalWeek, filmsWeek, seancesWeek]) => {
        if (cancelled) return;

        setReservationsToday(globalToday.kpis.totalReservations ?? 0);
        setRevenusToday(globalToday.kpis.chiffreAffaires ?? 0);
        setAvgOccupancy(parsePercent(globalWeek.kpis.tauxRemplissageMoyen));

        setVentesData(
          (filmsWeek.films ?? []).map((f) => ({
            name: f.title,
            value: f.nbReservations,
          })),
        );

        const agg = new Map<string, { sum: number; count: number }>();
        for (const s of seancesWeek.seances ?? []) {
          const salle = s.salle ?? '—';
          const p = parsePercent(s.tauxRemplissage);
          const prev = agg.get(salle) ?? { sum: 0, count: 0 };
          agg.set(salle, { sum: prev.sum + p, count: prev.count + 1 });
        }
        const occ = Array.from(agg.entries())
          .map(([name, v]) => ({ name, value: v.count > 0 ? Math.round(v.sum / v.count) : 0 }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);
        setOccupancyData(occ);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message ? String(e.message) : 'Erreur lors du chargement des statistiques');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);
// ─── Salle Card ───────────────────────────────────────────────────────────────
function SalleCard({ salle, seanceCount, occupancy }: {
  salle: Salle; seanceCount: number; occupancy: number;
}) {
  const color = occupancy > 75 ? '#E50914' : occupancy > 50 ? '#f59e0b' : '#34d399';
  const segments = 20;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/8 bg-zinc-900 p-5 transition-all duration-300 hover:border-white/15 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 border border-white/8">
              <Monitor className="h-4 w-4 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Salle {salle.numero}</h3>
              {salle.nom && <p className="text-xs text-zinc-500">{salle.nom}</p>}
            </div>
          </div>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-black"
          style={{ background: `${color}20`, color, border: `1.5px solid ${color}50` }}
        >
          {occupancy}%
        </div>
      </div>

      {/* Seat grid visualization */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-zinc-600">Capacité · {salle.capaciteTotale} places</span>
          <span className="text-xs text-zinc-500">{seanceCount} séance{seanceCount !== 1 ? 's' : ''}</span>
        </div>
        {/* Pixel-seat visualization */}
        <div className="flex flex-wrap gap-[3px]">
          {Array.from({ length: Math.min(segments, salle.capaciteTotale || segments) }).map((_, i) => {
            const threshold = Math.round((occupancy / 100) * Math.min(segments, salle.capaciteTotale || segments));
            return (
              <div
                key={i}
                className="h-2 rounded-[2px] transition-colors duration-300"
                style={{
                  width: `calc(${100 / segments}% - 3px)`,
                  background: i < threshold ? color : 'rgba(255,255,255,0.08)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Equipements */}
      {salle.equipements && (
        <div className="mt-3 flex flex-wrap gap-1">
          {salle.equipements.split(',').slice(0, 3).map((eq) => (
            <span key={eq} className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 border border-white/6">
              {eq.trim()}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: string;
}) {
  return (
    <article className="rounded-2xl border border-white/8 bg-zinc-900 p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-600">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight" style={{ color: accent ?? 'white' }}>{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-600">{sub}</p>}
    </article>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [films, setFilms] = useState<FilmType[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'films' | 'salles'>('films');

  const ventesSorted = useMemo(() => {
    return ventesData.slice().sort((a, b) => b.value - a.value);
  }, [ventesData]);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [f, s, r, sl] = await Promise.allSettled([
        filmsApi.getAll(),
        seancesApi.getAll(),
        reservationsApi.getAll(),
        sallesApi.getAll(),
      ]);
      if (f.status === 'fulfilled') setFilms(Array.isArray(f.value) ? f.value : []);
      if (s.status === 'fulfilled') setSeances(Array.isArray(s.value) ? s.value : []);
      if (r.status === 'fulfilled') setReservations(Array.isArray(r.value) ? r.value : []);
      if (sl.status === 'fulfilled') setSalles(Array.isArray(sl.value) ? sl.value : []);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ─── Calculs ───────────────────────────────────────────────────────────────
  const statsRes = useMemo(() => ({
    total: reservations.length,
    today: reservations.filter(r => r.dateReservation?.startsWith(today)).length,
    payees: reservations.filter(r => r.statut === 'PAYEE').length,
    revenu: reservations
      .filter(r => r.statut === 'PAYEE')
      .reduce((s, r) => s + (r.reservationSieges?.reduce((a, rs) => a + Number(rs.prixUnitaire), 0) ?? 0), 0),
  }), [reservations]);

  const ticketsParFilm = useMemo(() => {
    const map = new Map<number, number>();
    reservations.forEach(r => {
      const id = r.seance?.film?.id;
      if (id) map.set(id, (map.get(id) ?? 0) + (r.reservationSieges?.length ?? 0));
    });
    return map;
  }, [reservations]);

  const avgOcc = useMemo(() => {
    const avg = occupancyData.length
      ? occupancyData.reduce((sum, d) => sum + d.value, 0) / occupancyData.length
      : 0;
    return Math.round(avg);
  }, [occupancyData]);
  const seancesParFilm = useMemo(() => {
    const map = new Map<number, number>();
    seances.forEach(s => {
      if (s.film?.id) map.set(s.film.id, (map.get(s.film.id) ?? 0) + 1);
    });
    return map;
  }, [seances]);

  const seancesParSalle = useMemo(() => {
    const map = new Map<number, number>();
    seances.forEach(s => {
      if (s.salle?.id_salle) map.set(s.salle.id_salle, (map.get(s.salle.id_salle) ?? 0) + 1);
    });
    return map;
  }, [seances]);

  const occupancyParSalle = useMemo(() => {
    const map = new Map<number, number>();
    salles.forEach(salle => {
      const seancesSalle = seances.filter(s => s.salle?.id_salle === salle.id_salle);
      const sieges = reservations
        .filter(r => seancesSalle.some(s => s.id_seance === r.seance?.id_seance))
        .reduce((sum, r) => sum + (r.reservationSieges?.length ?? 0), 0);
      const capacite = (salle.capaciteTotale || 1) * (seancesSalle.length || 1);
      map.set(salle.id_salle, Math.min(100, Math.round((sieges / capacite) * 100)));
    });
    return map;
  }, [salles, seances, reservations]);

  const filmsShowing = films.filter(f => f.isShowing);
  const seancesAujourdhui = seances.filter(s => s.dateHeure?.startsWith(today)).length;

  const animRes = useCountUp(statsRes.today);
  const animRevenu = useCountUp(statsRes.revenu);
  const animFilms = useCountUp(filmsShowing.length);
  const animSeances = useCountUp(seancesAujourdhui);

  // Prochaines séances
  const prochaines = useMemo(() =>
    seances
      .filter(s => new Date(s.dateHeure) >= new Date())
      .sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime())
      .slice(0, 5),
  [seances]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Tableau de bord</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Actualisé à {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:text-white disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </header>

      {error ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-zinc-200">
          {error}
        </div>
      ) : null}

      {/* KPI */}
      <section className="grid gap-6 lg:grid-cols-3">
        <KpiCard
          title="Réservations aujourd'hui"
          value={formatInt(reservationsAnimated)}
          icon={<Ticket className="h-6 w-6" aria-hidden="true" />}
          trend={{ label: '+12%' }}
        />

        <KpiCard
          title="Revenus du jour"
          value={formatCurrencyDh(revenusAnimated)}
          icon={<span className="text-base font-black" aria-hidden="true">DH</span>}
          trend={{ label: '+8%' }}
        />

        <KpiCard
          title="Taux de remplissage moyen"
          value={`${formatInt(occupancyAnimated)}%`}
          icon={<Users className="h-6 w-6" aria-hidden="true" />}
          trend={{ label: '+3%' }}
        />
      </section>

      {/* Charts */}
      <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <article className="rounded-2xl bg-[#1F1F1F] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
          <h2 className="text-2xl font-black">Ventes par film cette semaine</h2>
          <div className="mt-6 h-[320px]">
            {loading ? (
              <div className="h-full rounded-xl bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
      {/* KPIs */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Réservations aujourd'hui" value={formatInt(animRes)} sub={`${statsRes.total} au total`} />
        <KpiCard label="Revenu (réservations payées)" value={formatCurrency(animRevenu)} accent="#34d399" />
        <KpiCard label="Films à l'affiche" value={formatInt(animFilms)} sub={`${films.length} films au total`} accent="#f59e0b" />
        <KpiCard label="Séances aujourd'hui" value={formatInt(animSeances)} sub={`${seances.length} programmées`} accent="#60a5fa" />
      </section>

      {/* Prochaines séances */}
      <section className="rounded-2xl border border-white/8 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-black text-white">Prochaines séances</h2>
        {prochaines.length === 0 ? (
          <p className="text-sm text-zinc-600">Aucune séance à venir</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {prochaines.map((s) => (
              <div
                key={s.id_seance}
                className="flex-none w-48 rounded-xl border border-white/8 bg-zinc-800/60 p-4 hover:border-white/15 transition-colors"
              >
                <div
                  className="mb-2 h-1.5 w-full rounded-full"
                  style={{ background: STATUT_COLOR[s.statut] ?? '#888' }}
                />
                <p className="text-xs font-black text-white truncate">{s.film?.title}</p>
                <p className="mt-1 text-[10px] text-zinc-500">Salle {s.salle?.numero} · {s.technologie}</p>
                <p className="mt-2 text-xs font-semibold text-zinc-400">
                  {new Date(s.dateHeure).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </p>
                <p className="text-xs text-zinc-600">
                  {new Date(s.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Toggle Films / Salles */}
      <section>
        <div className="mb-5 flex items-center gap-4">
          <div className="flex rounded-xl border border-white/8 bg-zinc-900 p-1">
            {(['films', 'salles'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-5 py-2 text-sm font-black capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab === 'films' ? `Films (${films.length})` : `Salles (${salles.length})`}
              </button>
            ))}
          </div>
          {activeTab === 'films' && (
            <p className="text-xs text-zinc-600">{filmsShowing.length} à l'affiche · {films.filter(f => !f.isShowing).length} à venir</p>
          )}
        </div>

        {/* Films grid */}
        {activeTab === 'films' && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-zinc-900 animate-pulse border border-white/5" />
              ))
            ) : films.length === 0 ? (
              <p className="col-span-full py-12 text-center text-zinc-600">Aucun film</p>
            ) : (
              films.map((film) => (
                <FilmCard
                  key={film.id}
                  film={film}
                  ticketCount={ticketsParFilm.get(film.id) ?? 0}
                  seanceCount={seancesParFilm.get(film.id) ?? 0}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {ventesData.map((entry) => (
                    <Cell key={entry.name} fill={barColorsByName.get(entry.name) ?? '#8f060d'} />
                  ))}
                </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="rounded-2xl bg-[#1F1F1F] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
          <h2 className="text-2xl font-black">Remplissage par salle (%)</h2>
          <div className="mt-6 h-[320px]">
            {loading ? (
              <div className="h-full rounded-xl bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 56, bottom: 10, left: 56 }}>
                <Tooltip
                  contentStyle={{
                    background: '#141414',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    color: 'white',
                  }}
                  formatter={(value) => [`${value}%`, 'Occupation']}
                />
                <Pie
                  data={occupancyData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={2}
                  labelLine
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  <Label value={`${avgOcc}%`} position="center" fill="white" style={{ fontWeight: 900, fontSize: 22 }} />
                  {occupancyData.map((entry) => (
                    <Cell key={entry.name} fill={occupancyColor(entry.value)} />
                  ))}
                </Pie>
                </PieChart>
              </ResponsiveContainer>
              ))
            )}
          </div>
        )}

        {/* Salles grid */}
        {activeTab === 'salles' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-zinc-900 animate-pulse border border-white/5" />
              ))
            ) : salles.length === 0 ? (
              <p className="col-span-full py-12 text-center text-zinc-600">Aucune salle</p>
            ) : (
              salles.map((salle) => (
                <SalleCard
                  key={salle.id_salle}
                  salle={salle}
                  seanceCount={seancesParSalle.get(salle.id_salle) ?? 0}
                  occupancy={occupancyParSalle.get(salle.id_salle) ?? 0}
                />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}