import { ArrowLeft, Calendar, Clock, Download, DoorOpen, MapPin, Printer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
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
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    reservationsApi
      .getById(Number(id))
      .then(setReservation)
      .catch((e: any) => setError(e?.response?.data?.message || 'Réservation introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── PDF download via html2canvas + jsPDF ─────────────────────────────────
  const handleDownload = async () => {
    if (!ticketRef.current || !reservation) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#09090b',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const ratio = canvas.height / canvas.width;
      const imgWidth = pageWidth - 20; // 10mm margin each side
      const imgHeight = imgWidth * ratio;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`billet-${reservation.reference}.pdf`);
      toast.success('Billet téléchargé avec succès.');
    } catch {
      toast.error('Erreur lors de la génération du PDF.');
    } finally {
      setDownloading(false);
    }
  };

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

  const qrPayload = reservation.qrCode ?? JSON.stringify({ reference: reservation.reference });
  const seats = reservation.sieges?.map((s) => `${s.rangee}${s.numero}`).join(', ') ?? '—';
  const total = reservation.sieges?.reduce((sum, s) => sum + Number(s.prix), 0) ?? 0;
  const devise = reservation.devise ?? 'MAD';

  return (
    <div className="min-h-screen bg-[#09090b] text-white print:bg-white print:text-zinc-950">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Back + actions */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-white/8"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Génération…' : 'Télécharger PDF'}
            </button>
          </div>
        </div>

        {/* ── Ticket card ── */}
        <div
          ref={ticketRef}
          className="overflow-hidden rounded-3xl border border-red-500/20 bg-zinc-950 shadow-2xl shadow-red-900/10 print:border-zinc-300 print:shadow-none"
        >
          {/* Top band */}
          <div className="bg-gradient-to-r from-red-700 to-red-500 px-8 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-200">
                  CinePass · Billet électronique
                </p>
                <h1 className="mt-1 text-2xl font-black text-white">
                  {reservation.film?.title ?? 'Film'}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-xs text-red-200">Référence</p>
                <p className="text-sm font-black text-white">{reservation.reference}</p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-8">
            <div className="grid gap-8 md:grid-cols-[1fr_180px]">
              {/* Left: details */}
              <div className="space-y-5">
                {/* Film poster + meta */}
                <div className="flex gap-4">
                  {reservation.film?.poster && (
                    <img
                      src={reservation.film.poster}
                      alt={reservation.film.title}
                      className="h-32 w-24 shrink-0 rounded-xl object-cover shadow-lg"
                    />
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 shrink-0 text-red-400" />
                      <div>
                        <p className="text-xs font-bold text-zinc-500">Date</p>
                        <p className="text-sm font-black text-white">
                          {capitalize(formatDate(reservation.seance.dateHeure))}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 shrink-0 text-red-400" />
                      <div>
                        <p className="text-xs font-bold text-zinc-500">Heure</p>
                        <p className="text-sm font-black text-white">
                          {formatTime(reservation.seance.dateHeure)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <DoorOpen className="h-4 w-4 shrink-0 text-red-400" />
                      <div>
                        <p className="text-xs font-bold text-zinc-500">Salle · Format</p>
                        <p className="text-sm font-black text-white">
                          {reservation.seance.salle} · {reservation.seance.technologie}
                        </p>
                      </div>
                    </div>

                    {reservation.cinema && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 shrink-0 text-red-400" />
                        <div>
                          <p className="text-xs font-bold text-zinc-500">Cinéma</p>
                          <p className="text-sm font-black text-white">{reservation.cinema}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider dashed */}
                <div className="border-t border-dashed border-white/10 print:border-zinc-300" />

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
                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-5 py-4">
                  <div>
                    <p className="text-xs font-bold text-zinc-500">Total payé</p>
                    <p className="text-2xl font-black text-white">
                      {total.toFixed(2)} <span className="text-sm text-zinc-400">{devise}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-500">Statut</p>
                    <p className="text-sm font-black text-green-400">{reservation.statut}</p>
                  </div>
                </div>
              </div>

              {/* Right: QR code */}
              <div className="flex flex-col items-center justify-start gap-4">
                <div className="rounded-2xl bg-white p-4 shadow-lg">
                  <QRCodeSVG
                    value={qrPayload}
                    size={148}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-center text-xs font-bold text-zinc-500">
                  Présentez ce QR à l'entrée
                </p>
                <p className="text-center text-xs text-zinc-700">Valable une seule fois</p>
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="flex items-center justify-between border-t border-white/8 bg-zinc-900/50 px-8 py-3 print:border-zinc-200 print:bg-zinc-50">
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