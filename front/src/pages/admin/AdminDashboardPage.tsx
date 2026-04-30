import { Euro, Film, Plus, Ticket, TrendingUp, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Bar ,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  showTrend?: boolean;
};

function StatCard({ title, value, subtitle, icon, showTrend }: StatCardProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 p-6 shadow-2xl">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/15 text-red-400">
          {icon}
        </div>
        {showTrend ? (
          <div className="flex items-center gap-1 text-emerald-400">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <div className="text-4xl font-black tracking-tight">{value}</div>
        <div className="mt-2 text-sm text-zinc-300">{title}</div>
        <div className="mt-1 text-sm text-zinc-500">{subtitle}</div>
      </div>
    </article>
  );
}

const ventesData = [
  { name: 'Apocalypse', value: 247 },
  { name: 'Ombres', value: 185 },
  { name: 'Dragons', value: 150 },
  { name: 'Néon', value: 132 },
  { name: 'Glace', value: 84 },
  { name: 'Rires', value: 66 },
];

const occupancyData = [
  { name: 'Salle 1', value: 85, color: '#ef4444' },
  { name: 'Salle 2', value: 72, color: '#fb7185' },
  { name: 'Salle 3', value: 65, color: '#f59e0b' },
  { name: 'Salle 4', value: 58, color: '#facc15' },
  { name: 'Salle 5', value: 48, color: '#f97316' },
];

export default function AdminDashboardPage() {
  return (
    <div className="relative">
      <header>
        <h1 className="text-4xl font-black tracking-tight">Tableau de bord</h1>
        <p className="mt-2 text-zinc-400">Vue d'ensemble de votre activité</p>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-4">
        <StatCard
          title="Réservations aujourd'hui"
          value="247"
          subtitle=""
          icon={<Ticket className="h-6 w-6" aria-hidden="true" />}
          showTrend
        />
        <StatCard
          title="Revenus du jour"
          value="3,842€"
          subtitle=""
          icon={<Euro className="h-6 w-6" aria-hidden="true" />}
          showTrend
        />
        <StatCard
          title="Taux de remplissage moyen"
          value="68%"
          subtitle=""
          icon={<Users className="h-6 w-6" aria-hidden="true" />}
          showTrend
        />
        <StatCard
          title="Film le plus populaire"
          value="Apocalypse\nStellaire"
          subtitle=""
          icon={<Film className="h-6 w-6" aria-hidden="true" />}
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 shadow-2xl">
          <h2 className="text-2xl font-bold">Ventes par film cette semaine</h2>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ventesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="name"
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
                    background: 'rgba(9,9,11,0.95)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    color: 'white',
                  }}
                  cursor={{ fill: 'rgba(239,68,68,0.12)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 shadow-2xl">
          <h2 className="text-2xl font-bold">Remplissage par salle (%)</h2>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(9,9,11,0.95)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    color: 'white',
                  }}
                />
                <Pie
                  data={occupancyData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {occupancyData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <button
        type="button"
        className="fixed bottom-8 right-8 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl transition hover:bg-red-500"
        aria-label="Ajouter"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}
