import { Calendar, CreditCard, DoorOpen, Eye, Trash2 } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import {
    reservationsApi,
    type ReservationDetail,
    type ReservationSummary,
} from '../features/reservations/reservationsapi';

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [selected, setSelected] = useState<ReservationDetail | null>(null);
  const [selectedQr, setSelectedQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationsApi.getMine();
      setReservations(data.reservations);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Impossible de charger les reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReservations();
  }, []);

  useEffect(() => {
    if (!selected) {
      setSelectedQr(null);
      return;
    }

    const payload = selected.qrCode || JSON.stringify({ reference: selected.reference });
    void QRCode.toDataURL(payload, {
      margin: 2,
      width: 220,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    }).then(setSelectedQr);
  }, [selected]);

  const cancelReservation = async (id: number) => {
    try {
      await reservationsApi.cancel(id);
      await loadReservations();
      if (selected?.id_reservation === id) setSelected(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Annulation impossible.');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-black uppercase text-red-400">Reservation</p>
          <h1 className="text-4xl font-black">Mes reservations</h1>
          <p className="text-sm font-bold text-zinc-400">
            {reservations.length} reservation{reservations.length > 1 ? 's' : ''}
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-zinc-400">
            Chargement...
          </div>
        ) : reservations.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-zinc-400">
            Aucune reservation pour le moment.
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {reservations.map((reservation) => (
              <article
                key={reservation.id_reservation}
                className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[96px_1fr_auto]"
              >
                <div className="h-32 overflow-hidden rounded-xl bg-black/30 md:h-24">
                  {reservation.poster && (
                    <img
                      src={reservation.poster}
                      alt={reservation.film}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black">{reservation.film}</h2>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-zinc-300">
                      {reservation.statut}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-zinc-400">{reservation.reference}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm font-bold text-zinc-300">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-400" />
                      {formatDateTime(reservation.dateSeance)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <DoorOpen className="h-4 w-4 text-red-400" />
                      {reservation.salle} - {reservation.technologie}
                    </span>
                    <span>{reservation.nbSieges} siege(s)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={async () => setSelected(await reservationsApi.getById(reservation.id_reservation))}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-black text-zinc-200 hover:bg-white/10"
                  >
                    <Eye className="h-4 w-4" />
                    Detail
                  </button>
                  {reservation.statut === 'EN_COURS' && (
                    <button
                      type="button"
                      onClick={() => window.location.assign(`/paiement/${reservation.id_reservation}`)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-black text-white hover:bg-red-500"
                    >
                      <CreditCard className="h-4 w-4" />
                      Payer
                    </button>
                  )}
                  {reservation.statut === 'EN_COURS' && (
                    <button
                      type="button"
                      onClick={() => cancelReservation(reservation.id_reservation)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-black text-zinc-200 hover:bg-white/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Annuler
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">{selected.film?.title}</h2>
                <p className="mt-1 text-sm font-bold text-zinc-400">{selected.reference}</p>
              </div>
              <button className="text-sm font-black text-zinc-400" onClick={() => setSelected(null)}>
                Fermer
              </button>
            </div>
            <div className="mt-5 grid gap-6 md:grid-cols-[220px_1fr]">
              <div className="rounded-2xl bg-white p-3">
                {selectedQr ? (
                  <img
                    src={selectedQr}
                    alt={`QR reservation ${selected.reference}`}
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center text-sm font-black text-zinc-900">
                    QR...
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm font-bold text-zinc-300">
                <p>{formatDateTime(selected.seance.dateHeure)}</p>
                <p>
                  {selected.seance.salle} - {selected.seance.technologie}
                </p>
                <p>
                  Sieges:{' '}
                  {selected.sieges.map((s) => `${s.rangee}${s.numero}`).join(', ')}
                </p>
                <p>
                  Total: {selected.sieges.reduce((sum, s) => sum + Number(s.prix), 0).toFixed(2)}{' '}
                  {selected.devise}
                </p>
                <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-400">
                  QR prêt pour le staff.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
