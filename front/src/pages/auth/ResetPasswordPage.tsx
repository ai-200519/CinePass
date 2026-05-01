import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import iconPng from '../../assets/icon.png';
import {
    selectResetPasswordError,
    selectResetPasswordStatus,
} from '../../features/auth/authSelectors';
import { authActions } from '../../features/auth/authSlice';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectResetPasswordStatus);
  const apiError = useAppSelector(selectResetPasswordError);
  const savedEmail =
    localStorage.getItem('cinepass_reset_email') ??
    sessionStorage.getItem('cinepass_reset_email') ??
    '';
  const savedOtp =
    localStorage.getItem('cinepass_reset_otp') ??
    sessionStorage.getItem('cinepass_reset_otp') ??
    '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(authActions.clearResetPasswordState());
  }, [dispatch]);

  useEffect(() => {
    if (submitted && status === 'succeeded') {
      sessionStorage.removeItem('cinepass_reset_email');
      sessionStorage.removeItem('cinepass_reset_otp');
      localStorage.removeItem('cinepass_reset_email');
      localStorage.removeItem('cinepass_reset_otp');
      navigate('/login');
    }
  }, [navigate, status, submitted]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 py-10 text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-lg">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600">
                <img src={iconPng} alt="" className="h-10 w-10 object-contain" />
              </span>
            </div>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Nouveau mot de passe</h1>
            <p className="mt-2 text-zinc-300">Choisissez un nouveau mot de passe pour votre compte.</p>
          </div>

          {!savedEmail || !savedOtp ? (
            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
                Lien invalide ou expiré.
              </div>
              <Link
                to="/forgot-password"
                className="block w-full rounded-2xl border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-white/30"
              >
                Demander un nouveau lien
              </Link>
            </div>
          ) : (
            <form
              className="mt-10 space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                setError(null);

                const otpDigits = savedOtp.replace(/\D/g, '');
                if (!savedEmail || otpDigits.length !== 6) {
                  setError('Lien invalide ou expiré.');
                  return;
                }

                if (!password || password.length < 6) {
                  setError('Le mot de passe doit contenir au moins 6 caracteres.');
                  return;
                }

                if (password !== confirmPassword) {
                  setError('Les mots de passe ne correspondent pas.');
                  return;
                }

                dispatch(
                  authActions.resetPasswordRequested({
                    email: savedEmail,
                    otp: otpDigits,
                    newPassword: password,
                  }),
                );
                setSubmitted(true);
              }}
            >
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
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
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-zinc-200"
                >
                  Confirmer
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 pr-12 text-white placeholder:text-zinc-500 outline-none ring-red-500/60 transition focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400 transition hover:text-zinc-200"
                    aria-label={
                      showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                    }
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

              {error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-600/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              {apiError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-600/10 px-4 py-3 text-sm text-red-100">
                  {apiError}
                </div>
              ) : null}

              {submitted && status === 'succeeded' ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
                  Mot de passe mis à jour.
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-500 py-3 font-semibold text-white shadow-lg shadow-red-600/20 transition hover:from-red-500 hover:to-red-500"
              >
                {status === 'loading' ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-zinc-400">
            <Link to="/login" className="font-semibold text-red-500 hover:text-red-400">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
