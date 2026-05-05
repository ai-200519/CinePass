import { Ticket, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminStatsApi } from '../../services/adminStatsApi';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const to = Number.isFinite(target) ? target : 0;

    const tick = (now: number) => {
      const t = clamp((now - start) / durationMs, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    setValue(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

function formatInt(n: number) {
  return Math.round(n).toLocaleString('fr-FR');
}

function formatCurrencyDh(n: number) {
  return `${Math.round(n).toLocaleString('fr-FR')} DH`;
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

function parsePercent(percent: string | null | undefined) {
  const raw = String(percent ?? '').replace('%', '').trim();
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

type KpiCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
};

function KpiCard({ title, value, icon }: KpiCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-[#1F1F1F] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition hover:shadow-[0_0_0_1px_rgba(229,9,20,0.35),0_0_22px_rgba(229,9,20,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E50914]/15 text-[#E50914]">
          {icon}
        </div>
      </div>

      <div className="mt-6">
        <div className="text-4xl font-black tracking-tight text-white">{value}</div>
        <div className="mt-2 text-sm font-semibold text-zinc-300">{title}</div>
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

  const reservationsAnimated = useCountUp(reservationsToday);
  const revenusAnimated = useCountUp(revenusToday);
  const occupancyAnimated = useCountUp(avgOccupancy);

  const ventesSorted = useMemo(() => ventesData.slice().sort((a, b) => b.value - a.value), [ventesData]);
  const barColors = ['#E50914', '#b40710', '#8f060d', '#6c050a', '#4a0407', '#320306'];
  const barColorsByName = useMemo(() => {
    const map = new Map<string, string>();
    ventesSorted.forEach((d, idx) => map.set(d.name, barColors[idx] ?? '#8f060d'));
    return map;
  }, [ventesSorted]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tight">Tableau de bord</h1>
        <p className="mt-2 text-zinc-400">Vue d'ensemble de votre activité</p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-zinc-200">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-3">
        <KpiCard
          title="Réservations aujourd'hui"
          value={formatInt(reservationsAnimated)}
          icon={<Ticket className="h-6 w-6" aria-hidden="true" />}
        />

        <KpiCard
          title="Revenus du jour"
          value={formatCurrencyDh(revenusAnimated)}
          icon={<span className="text-base font-black" aria-hidden="true">DH</span>}
        />

        <KpiCard
          title="Taux de remplissage moyen"
          value={`${formatInt(occupancyAnimated)}%`}
          icon={<Users className="h-6 w-6" aria-hidden="true" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <article className="rounded-2xl bg-[#1F1F1F] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
          <h2 className="text-2xl font-black">Ventes par film cette semaine</h2>
          <div className="mt-6 h-[380px]">
            {loading ? (
              <div className="h-full rounded-xl bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventesSorted} margin={{ top: 10, right: 10, left: 0, bottom: 22 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    tickMargin={10}
                    height={78}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(20,20,20,0.95)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: 12,
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                    formatter={(v: any) => [`${v} tickets`, 'Réservations']}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {ventesSorted.map((d) => (
                      <Cell key={d.name} fill={barColorsByName.get(d.name) ?? '#8f060d'} />
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
                <BarChart data={occupancyData} layout="vertical" margin={{ top: 10, right: 18, left: 18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={84}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(20,20,20,0.95)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: 12,
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                    formatter={(v: any) => [`${v}%`, 'Taux']}
                  />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                    {occupancyData.map((d) => (
                      <Cell key={d.name} fill={occupancyColor(d.value)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
