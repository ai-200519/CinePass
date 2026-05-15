import { ChevronDown, History, LogOut, Settings, Ticket, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAuthUser, selectIsAuthenticated } from '../features/auth/authSelectors';
import { authActions } from '../features/auth/authSlice';
import Logo from './Logo';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRootRef = useRef<HTMLDivElement | null>(null);

  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(' ').trim();
  const email = user?.email ?? '';
  const userLabel = email || displayName || 'Utilisateur';
  const initialSource = displayName || email;
  const initial = initialSource ? initialSource.trim().charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    if (!isMenuOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (!menuRootRef.current?.contains(target)) setIsMenuOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

  const close = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Logo asset="logo" showText={false} size="lg" />

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="hidden rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:border-white/30 sm:inline-flex"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
              >
                S'inscrire
              </Link>
            </>
          ) : (
            <div ref={menuRootRef} className="relative">
              {/* Trigger button */}
              <button
                type="button"
                onClick={() => setIsMenuOpen((v) => !v)}
                className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 text-sm font-black text-white"
                  title={displayName || email || 'Utilisateur'}
                  aria-label={displayName || email || 'Utilisateur'}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={displayName || email || 'Utilisateur'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initial}</span>
                  )}
                </div>

                <div className="hidden min-w-0 sm:block">
                  <div className="max-w-[180px] truncate text-sm font-black text-white">
                    {displayName || userLabel}
                  </div>
                  <div className="max-w-[180px] truncate text-xs font-bold text-zinc-400">{email}</div>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-zinc-300 transition ${isMenuOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {/* Dropdown */}
              {isMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl"
                >
                  {/* User info header */}
                  <div className="mb-2 px-3 py-2">
                    <p className="truncate text-sm font-black text-white">{displayName || userLabel}</p>
                    <p className="truncate text-xs text-zinc-500">{email}</p>
                  </div>

                  <div className="h-px bg-white/8 mb-1" />

                  {/* Mon profil */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { close(); navigate('/profil'); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-200 transition hover:bg-white/5"
                  >
                    <User className="h-4 w-4 text-red-400" aria-hidden="true" />
                    Mon profil
                  </button>

                  {/* Mes réservations */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { close(); navigate('/reservations'); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-200 transition hover:bg-white/5"
                  >
                    <Ticket className="h-4 w-4 text-red-400" aria-hidden="true" />
                    Mes réservations
                  </button>

                  {/* Historique */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { close(); navigate('/historique'); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-200 transition hover:bg-white/5"
                  >
                    <History className="h-4 w-4 text-red-400" aria-hidden="true" />
                    Historique
                  </button>

                  <div className="my-2 h-px bg-white/8" />

                  {/* Log Out */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      close();
                      dispatch(authActions.logout());
                      navigate('/', { replace: true });
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-red-400 transition hover:bg-red-600/10"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}