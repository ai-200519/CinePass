import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CalendarDays,
  Clapperboard,
  DoorOpen,
  Film,
  LayoutDashboard,
  LogOut,
  Settings,
  Ticket,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import Logo from '../components/Logo';
import { authActions } from '../features/auth/authSlice';

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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <aside className="flex w-[280px] flex-col border-r border-white/10 bg-zinc-950/80 px-5 py-6">
          <div>
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
          </div>

          <div className="mt-auto pt-6">
            <div className="mb-4 h-px w-full bg-white/10" />
            <button
              type="button"
              onClick={() => {
                dispatch(authActions.logout());
                navigate('/login', { replace: true });
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span>Déconnexion</span>
            </button>
          </div>
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
