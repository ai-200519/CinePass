import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CalendarDays,
  Clapperboard,
  DoorOpen,
  Film,
  LayoutDashboard,
  Settings,
  Ticket,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import Logo from '../components/Logo';

type AdminNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

const navItems: AdminNavItem[] = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/films', label: 'Films', icon: Film },
  { to: '/admin/seances', label: 'Séances', icon: CalendarDays },
  { to: '/admin/salles', label: 'Salles', icon: DoorOpen },
  { to: '/admin/reservations', label: 'Réservations', icon: Ticket },
  { to: '/admin/rapports', label: 'Rapports', icon: BarChart3 },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <aside className="w-[280px] border-r border-white/10 bg-zinc-950/80 px-5 py-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Clapperboard className="h-6 w-6 text-red-500" aria-hidden="true" />
              <div className="flex flex-col">
                <Logo to="/admin" />
                <span className="text-sm text-zinc-400">Espace administrateur</span>
              </div>
            </div>
          </div>

          <nav className="mt-10 flex flex-col gap-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-zinc-300 hover:bg-white/5 hover:text-white',
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-6 py-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
