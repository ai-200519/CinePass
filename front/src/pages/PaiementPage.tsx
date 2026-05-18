import {
    PaymentElement,
    useElements,
    useStripe
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AlertCircle, ArrowLeft, CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { STRIPE_PUBLISHABLE_KEY } from '../config';
import { reservationsApi, type ReservationDetail } from '../features/reservations/reservationsapi';
import { paiementApi, type InitierPaiementResponse } from '../services/paiementApi';

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

function formatMoney(amount: number, devise: string) {
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${devise}`;
}

function CheckoutForm({ reservation }: { reservation: ReservationDetail }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setMessage(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/reservations`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      setMessage(result.error.message ?? 'Paiement refuse.');
      setSubmitting(false);
      return;
    }

    setMessage('Paiement accepte. Finalisation du billet...');
    window.setTimeout(() => navigate('/reservations'), 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600/15 text-red-400">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-black">Carte bancaire</h2>
          <p className="text-sm font-bold text-zinc-500">Saisie securisee par Stripe</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white p-4">
        <PaymentElement />
      </div>

      {message && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-bold text-red-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        {submitting ? 'Paiement...' : `Payer ${formatMoney(Number(reservation.montant ?? 0), reservation.devise)}`}
      </button>
    </form>
  );
}

export default function PaiementPage() {
  const { id } = useParams();
  const idReservation = Number(id);
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [payment, setPayment] = useState<InitierPaiementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!Number.isFinite(idReservation)) {
        setError('Reservation invalide.');
        setLoading(false);
        return;
      }

      if (!STRIPE_PUBLISHABLE_KEY) {
        setError('VITE_STRIPE_PUBLISHABLE_KEY manque dans front/.env');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const detail = await reservationsApi.getById(idReservation);
        if (detail.statut === 'PAYEE') {
          setReservation(detail);
          setError('Cette reservation est deja payee.');
          return;
        }

        const intent = await paiementApi.initier({
          id_reservation: idReservation,
          methode: 'STRIPE',
        });

        if (!cancelled) {
          // Redirect to Stripe Checkout hosted page
          window.location.href = intent.url;
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || e?.message || 'Paiement impossible.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [idReservation]);

  // No clientSecret/options needed when using hosted Checkout
  const options = undefined;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <Link to="/reservations" className="inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Mes reservations
        </Link>

        <div className="mt-6">
          <p className="text-sm font-black uppercase text-red-400">Paiement Stripe</p>
          <h1 className="mt-2 text-4xl font-black">Finaliser la reservation</h1>
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-zinc-400">
            Chargement du paiement...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm font-bold text-red-100">
            {error}
          </div>
        ) : reservation ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black">{reservation.film?.title}</h2>
            <p className="mt-2 text-sm font-bold text-zinc-400">{reservation.reference}</p>
            <div className="mt-6 space-y-3 text-sm font-bold text-zinc-300">
              <p>{new Date(reservation.seance.dateHeure).toLocaleString('fr-FR')}</p>
              <p>{reservation.seance.salle} - {reservation.seance.technologie}</p>
              <p>Sieges: {reservation.sieges.map((s) => `${s.rangee}${s.numero}`).join(', ')}</p>
              <p className="text-lg text-white">Total: {formatMoney(Number(reservation.nbSieges ? reservation.nbSieges * 0 : 0), reservation.devise ?? 'MAD')}</p>
            </div>
            <div className="mt-6">
              <p className="text-sm text-zinc-400">Vous allez être redirigé vers la page de paiement Stripe.</p>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
