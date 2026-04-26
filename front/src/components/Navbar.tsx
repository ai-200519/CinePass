import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo showText={false} size="lg" />
        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-300 md:flex">
          <Link to="/" className="transition hover:text-red-500">
            Accueil
          </Link>
          <a href="#films" className="transition hover:text-red-500">
            Films
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/30"
          >
            Se connecter
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}
