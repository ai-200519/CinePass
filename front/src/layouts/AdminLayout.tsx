import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Building2,
  CalendarDays,
  DoorOpen,
  Film,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Ticket,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import Logo from '../components/Logo';
import { selectAuthRole, selectIsAuthenticated } from '../features/auth/authSelectors';
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
  { to: '/admin/cinemas', label: 'Cinémas', icon: Building2 },
  { to: '/admin/seances', label: 'Séances', icon: CalendarDays },
  { to: '/admin/salles', label: 'Salles', icon: DoorOpen },
  { to: '/admin/reservations', label: 'Réservations', icon: Ticket },
  { to: '/admin/rapports', label: 'Rapports', icon: BarChart3 },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
];

export default function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectAuthRole);

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Redirige vers /login si pas connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si connecté mais pas ADMIN, rester côté user
  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#141414]/90 backdrop-blur md:hidden">
        <div className="flex w-full items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo to="/admin" asset="logo" size="sm" />
            <span className="text-sm font-semibold text-zinc-300">Admin</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-[240px] border-r border-white/10 bg-[#141414] px-4 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <Logo to="/admin" asset="logo" size="md" />
                <span className="mt-1 text-sm text-zinc-400">Espace administrateur</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-2">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition',
                      isActive
                        ? 'bg-[#E50914] text-white'
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white',
                    ].join(' ')
                  }
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto pt-6">
              <div className="mb-4 h-px w-full bg-white/10" />
              <button
                type="button"
                onClick={() => {
                  dispatch(authActions.logout());
                  navigate('/login', { replace: true });
                }}
                className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                <span>Déconnexion</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop layout */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden border-r border-white/10 bg-[#141414] md:flex md:w-[72px] md:flex-col md:px-3 md:py-6 lg:w-[240px] lg:px-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center lg:justify-start">
            <Logo to="/admin" asset="logo" size="md" />
          </div>
          <span className="hidden text-sm text-zinc-400 lg:block">Espace administrateur</span>
        </div>

        <nav className="mt-10 flex flex-col gap-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'group flex items-center justify-center gap-3 rounded-full px-3 py-3 text-sm font-semibold transition lg:justify-start lg:px-4',
                  isActive
                    ? 'bg-[#E50914] text-white'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
              title={label}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="hidden truncate lg:block">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <div className="mb-4 h-px w-full bg-white/10" />
          <button
            type="button"
            onClick={() => {
              dispatch(authActions.logout());
              navigate('/login', { replace: true });
            }}
            className="flex w-full items-center justify-center gap-3 rounded-full px-3 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white lg:justify-start lg:px-4"
            title="Déconnexion"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            <span className="hidden lg:block">Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="w-full px-4 py-6 md:pl-[96px] md:pr-6 lg:pl-[264px] lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}