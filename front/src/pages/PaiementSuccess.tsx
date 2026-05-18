import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { reservationsApi } from '../features/reservations/reservationsapi';

export default function PaiementSuccess() {
  const [search] = useSearchParams();
  const reference = search.get('reference');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<any>(null);

  useEffect(() => {
    if (!reference) {
      setError('Reference manquante');
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await reservationsApi.getByReference(reference);
        if (!cancelled) setReservation(res);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || 'Impossible de récupérer la réservation.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [reference]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-black">Paiement réussi</h1>

        {loading && <p className="mt-6 text-zinc-400">Vérification de la réservation…</p>}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-100">
            {error}
          </div>
        )}

        {reservation && (
          <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-zinc-400">Réservation {reservation.reference}</p>
            <h2 className="text-xl font-black">{reservation.film?.title}</h2>
            <p className="text-sm">{new Date(reservation.seance.dateHeure).toLocaleString('fr-FR')}</p>
            <p className="text-sm">Sièges: {reservation.sieges.map((s: any) => `${s.rangee}${s.numero}`).join(', ')}</p>
            <div className="pt-4">
              <Link to={`/reservations/${reservation.id_reservation}/ticket`} className="inline-block rounded-xl bg-red-600 px-4 py-2 font-black">
                Voir mon billet
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
