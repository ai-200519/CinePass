import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import iconPng from '../../assets/icon.png';
import {
    selectForgotPasswordError,
    selectForgotPasswordStatus,
    selectResendOtpError,
    selectResendOtpMessage,
    selectResendOtpStatus,
} from '../../features/auth/authSelectors';
import { authActions } from '../../features/auth/authSlice';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectForgotPasswordStatus);
  const apiError = useAppSelector(selectForgotPasswordError);
  const resendOtpStatus = useAppSelector(selectResendOtpStatus);
  const resendOtpError = useAppSelector(selectResendOtpError);
  const resendOtpMessage = useAppSelector(selectResendOtpMessage);
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'succeeded' && step === 'email') {
      setStep('code');
      setCode('');
    }
  }, [status, step]);

  useEffect(() => {
    dispatch(authActions.clearResendOtpState());
  }, [dispatch]);

  const normalizedCode = useMemo(() => code.replace(/\D/g, '').slice(0, 6), [code]);

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
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Mot de passe oublié</h1>
            <p className="mt-2 text-zinc-300">
              {step === 'email'
                ? 'Saisissez votre email pour recevoir un code de réinitialisation.'
                : 'Entrez le code à 6 chiffres reçu.'}
            </p>
          </div>

          <form
            className="mt-10 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);

              if (step === 'email') {
                if (!email) {
                  setError('Veuillez saisir votre email.');
                  return;
                }
                dispatch(authActions.forgotPasswordRequested({ email }));
                return;
              }

              if (normalizedCode.length !== 6) {
                setError('Veuillez saisir les 6 chiffres.');
                return;
              }

              sessionStorage.setItem('cinepass_reset_email', email);
              sessionStorage.setItem('cinepass_reset_otp', normalizedCode);
              localStorage.setItem('cinepass_reset_email', email);
              localStorage.setItem('cinepass_reset_otp', normalizedCode);
              dispatch(authActions.clearForgotPasswordState());
              navigate('/reset-password');
            }}
          >
            {step === 'email' ? (
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-500 outline-none ring-red-500/60 transition focus:ring-2"
                />
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
                  Un code OTP a été envoyé à votre email.
                </div>
                <div>
                  <label htmlFor="code" className="mb-2 block text-sm font-medium text-zinc-200">
                    Code (6 chiffres)
                  </label>
                  <input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={normalizedCode}
                    onChange={(event) => setCode(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white placeholder:text-zinc-500 outline-none ring-red-500/60 transition focus:ring-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    disabled={resendOtpStatus === 'loading' || !email.trim()}
                    onClick={() =>
                      dispatch(
                        authActions.resendOtpRequested({
                          email: email.trim(),
                          purpose: 'reset_password',
                        }),
                      )
                    }
                    className="text-sm font-semibold text-zinc-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resendOtpStatus === 'loading' ? 'Renvoi en cours...' : 'Renvoyer le code'}
                  </button>
                </div>
              </>
            )}

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

            {step === 'code' && resendOtpMessage ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
                {resendOtpMessage}
              </div>
            ) : null}

            {step === 'code' && resendOtpError ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-600/10 px-4 py-3 text-sm text-red-100">
                {resendOtpError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-500 py-3 font-semibold text-white shadow-lg shadow-red-600/20 transition hover:from-red-500 hover:to-red-500"
            >
              {status === 'loading'
                ? 'Envoi en cours...'
                : step === 'email'
                  ? 'Envoyer le code'
                  : 'Valider le code'}
            </button>
          </form>

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
