import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectRegisterError, selectRegisterStatus } from '../../features/auth/authSelectors';
import { authActions } from '../../features/auth/authSlice';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const registerStatus = useAppSelector(selectRegisterStatus);
  const registerError = useAppSelector(selectRegisterError);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(authActions.clearRegisterState());
  }, [dispatch]);

  useEffect(() => {
    if (registerStatus === 'succeeded') {
      dispatch(authActions.clearRegisterState());
      navigate('/admin', { replace: true });
    }
  }, [dispatch, navigate, registerStatus]);

  const canSubmit = useMemo(() => {
    return (
      prenom.trim().length > 0 &&
      nom.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0
    );
  }, [confirmPassword.length, email, nom, password.length, prenom]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 py-10 text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur sm:p-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Inscription</h1>
            <p className="mt-2 text-zinc-300">Créez votre compte.</p>
          </div>

          <form
            className="mt-10 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setLocalError(null);

              if (password !== confirmPassword) {
                setLocalError('Les mots de passe ne correspondent pas.');
                return;
              }

              if (!prenom.trim() || !nom.trim()) {
                setLocalError('Veuillez renseigner votre prénom et votre nom.');
                return;
              }

              dispatch(
                authActions.registerRequested({
                  email,
                  password,
                  nom: nom.trim(),
                  prenom: prenom.trim(),
                  telephone: phone.trim() || undefined,
                }),
              );
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-zinc-200">
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Votre prénom"
                  autoComplete="given-name"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-500 outline-none ring-red-500/60 transition focus:ring-2"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-zinc-200">
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Votre nom"
                  autoComplete="family-name"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-500 outline-none ring-red-500/60 transition focus:ring-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-zinc-200">
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06..."
                autoComplete="tel"
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-500 outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-500 outline-none ring-red-500/60 transition focus:ring-2"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
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

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-zinc-200">
                  Confirmer
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 pr-12 text-white placeholder:text-zinc-500 outline-none ring-red-500/60 transition focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400 transition hover:text-zinc-200"
                    aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showConfirmPassword ? (
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
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-300">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-zinc-500 bg-zinc-900 text-red-600" />
              <span>
                J'accepte les conditions d'utilisation et la politique de confidentialité.
              </span>
            </label>

            <button
              type="submit"
              disabled={!canSubmit || registerStatus === 'loading'}
              className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-500 py-3 font-semibold text-white shadow-lg shadow-red-600/20 transition hover:from-red-500 hover:to-red-500"
            >
              {registerStatus === 'loading' ? 'Création…' : 'Créer un compte'}
            </button>

            {localError ? <p className="text-sm font-medium text-red-300">{localError}</p> : null}
            {registerError ? <p className="text-sm font-medium text-red-300">{registerError}</p> : null}
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="font-semibold text-red-500 hover:text-red-400">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
