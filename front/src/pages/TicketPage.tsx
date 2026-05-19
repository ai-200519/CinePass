import { ArrowLeft, Calendar, Clock, DoorOpen, MapPin, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  reservationsApi,
  type ReservationDetail,
} from '../features/reservations/reservationsapi';

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// ─── Component ───────────────────────────────────────────────────────────────
export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ticketRef = useRef<HTMLDivElement>(null);

  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    reservationsApi
      .getById(Number(id))
      .then(setReservation)
      .catch((e: any) => setError(e?.response?.data?.message || 'Réservation introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!reservation?.reference) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(reservation.reference, {
      errorCorrectionLevel: 'H',
      margin: 0,
      width: 296,
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [reservation?.reference]);

  const handlePrint = () => window.print();

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center text-zinc-500">
          Chargement du billet…
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <p className="text-lg font-bold text-red-400">{error ?? 'Billet introuvable.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-zinc-300 hover:bg-white/8"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
        </div>
      </div>
    );
  }

  // Keep QR content minimal: only the reservation reference (e.g., CP-2026-R5BZEX)
  const qrPayload = reservation.reference;
  const total = reservation.sieges?.reduce((sum, s) => sum + Number(s.prix), 0) ?? 0;
  const devise = reservation.devise ?? 'MAD';

  return (
    <div className="ticket-page-root min-h-screen bg-[#09090b] text-white print:min-h-0 print:bg-white print:text-zinc-950">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="ticket-print-wrap mx-auto w-full max-w-3xl px-3 py-6 print:max-w-none print:px-0 print:py-0 sm:px-4 sm:py-10">
        {/* Back + actions */}
        <div className="mb-4 flex flex-col gap-3 print:hidden sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 self-start text-sm font-bold text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              onClick={handlePrint}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500 sm:w-auto"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </button>
          </div>
        </div>

        {/* ── Ticket card ── */}
        <div
          ref={ticketRef}
          className="ticket-print overflow-hidden rounded-3xl border border-red-500/20 bg-zinc-950 shadow-2xl shadow-red-900/10 print:border-zinc-300 print:shadow-none"
        >
          {/* Top band */}
          <div className="ticket-top bg-gradient-to-r from-red-700 to-red-500 px-4 py-4 sm:px-8 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-200">
                  CinePass · Billet électronique
                </p>
                <h1 className="mt-1 text-xl font-black leading-tight text-white sm:text-2xl">
                  {reservation.film?.title ?? 'Film'}
                </h1>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-red-200">Référence</p>
                <p className="break-all text-sm font-black leading-tight text-white sm:break-normal">
                  {reservation.reference}
                </p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_180px] md:gap-8">
              {/* Left: details */}
              <div className="space-y-5">
                {/* Film poster + meta */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  {reservation.film?.poster && (
                    <img
                      src={reservation.film.poster}
                      alt={reservation.film.title}
                      className="h-40 w-28 shrink-0 self-center rounded-xl object-cover shadow-lg sm:h-32 sm:w-24 sm:self-auto"
                    />
                  )}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 sm:items-center">
                      <Calendar className="h-4 w-4 shrink-0 text-red-400" />
                      <div>
                        <p className="text-xs font-bold text-zinc-500">Date</p>
                        <p className="text-sm font-black leading-snug text-white sm:text-base">
                          {capitalize(formatDate(reservation.seance.dateHeure))}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:items-center">
                      <Clock className="h-4 w-4 shrink-0 text-red-400" />
                      <div>
                        <p className="text-xs font-bold text-zinc-500">Heure</p>
                        <p className="text-sm font-black leading-snug text-white sm:text-base">
                          {formatTime(reservation.seance.dateHeure)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:items-center">
                      <DoorOpen className="h-4 w-4 shrink-0 text-red-400" />
                      <div>
                        <p className="text-xs font-bold text-zinc-500">Salle · Format</p>
                        <p className="text-sm font-black leading-snug text-white sm:text-base">
                          {reservation.seance.salle} · {reservation.seance.technologie}
                        </p>
                      </div>
                    </div>

                    {reservation.cinema && (
                      <div className="flex items-start gap-3 sm:items-center">
                        <MapPin className="h-4 w-4 shrink-0 text-red-400" />
                        <div>
                          <p className="text-xs font-bold text-zinc-500">Cinéma</p>
                          <p className="text-sm font-black leading-snug text-white sm:text-base">
                            {reservation.cinema}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider dashed */}
                <div className="ticket-divider border-t border-dashed border-white/10 print:border-zinc-300" />

                {/* Seats */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Sièges réservés
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {reservation.sieges?.map((s) => (
                      <span
                        key={`${s.rangee}${s.numero}`}
                        className="rounded-lg border border-red-500/30 bg-red-600/10 px-3 py-1.5 text-sm font-black text-red-300"
                      >
                        {s.rangee}{s.numero}
                        {s.categorie && (
                          <span className="ml-1.5 text-xs font-bold text-red-400/60">
                            {s.categorie}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="ticket-price flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <p className="text-xs font-bold text-zinc-500">Total payé</p>
                    <p className="text-2xl font-black text-white sm:text-[2rem]">
                      {total.toFixed(2)} <span className="text-sm text-zinc-400">{devise}</span>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-bold text-zinc-500">Statut</p>
                    <p className="text-sm font-black text-green-400">{reservation.statut}</p>
                  </div>
                </div>
              </div>

              {/* Right: QR code */}
              <div className="flex flex-col items-center justify-start gap-3 md:gap-4">
                <div className="rounded-2xl bg-white p-3 shadow-lg sm:p-4">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR"
                      className="h-[148px] w-[148px]"
                    />
                  ) : (
                    <QRCodeSVG value={qrPayload} size={148} level="H" includeMargin={false} />
                  )}
                </div>
                <p className="text-center text-xs font-bold leading-snug text-zinc-500">
                  Présentez ce QR à l'entrée
                </p>
                <p className="text-center text-xs text-zinc-700">Valable une seule fois</p>
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="ticket-bottom flex flex-col gap-1 border-t border-white/8 bg-zinc-900/50 px-4 py-3 text-center print:border-zinc-200 print:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-left">
            <p className="text-xs text-zinc-600">
              Généré par CinePass · {new Date().toLocaleDateString('fr-FR')}
            </p>
            <p className="text-xs font-black text-zinc-600">{reservation.reference}</p>
          </div>
        </div>
      </div>
    </div>
  );
}