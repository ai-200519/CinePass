import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Navbar() {
  const links = [
    { href: '#films', label: 'Films' },
    { href: '#films', label: 'Horaires' },
    { href: '#films', label: 'IMAX' },
    { href: '#films', label: 'Tarifs' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Logo asset="logo" showText={false} size="lg" />
        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-300 md:flex">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="transition hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
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
            S inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}
