import { useState } from 'react';
import { Link } from 'react-router-dom';
import iconPng from '../../assets/icon.png';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 py-10 text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-lg">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-2xl font-black">
                <img src={iconPng} alt="" className="h-10 w-10 object-contain" />
              </span>
            </div>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Bienvenue</h1>
            <p className="mt-2 text-zinc-300">Connectez-vous pour accéder à votre espace.</p>
          </div>

          <form className="mt-10 space-y-5" onSubmit={(event) => event.preventDefault()}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-500 outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 pr-12 text-white placeholder:text-zinc-500 outline-none ring-red-500/60 transition focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400 transition hover:text-zinc-200"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.64-1.52 1.6-2.9 2.82-4.06" />
                      <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
                      <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8-0.66 1.56-1.69 2.97-2.97 4.15" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-zinc-400 transition hover:text-red-400"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-500 py-3 font-semibold text-white shadow-lg shadow-red-600/20 transition hover:from-red-500 hover:to-red-500"
            >
              Se connecter
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold text-red-500 hover:text-red-400">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
