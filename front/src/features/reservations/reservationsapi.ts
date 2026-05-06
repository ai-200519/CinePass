import { http } from '../../services/http';

// ─── Enums ────────────────────────────────────────────────────────────────────
export type StatutReservation = 'EN_COURS' | 'PAYEE' | 'ANNULEE' | 'EXPIREE';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ReservationSiege = {
  id_reservation_siege: number;
  prixUnitaire: number;
  categorie: string;
  siege: {
    id_siege: number;
    numero: string;
    rangee: string;
  };
};

export type Reservation = {
  id_reservation: number;
  reference: string;
  dateReservation: string;
  statut: StatutReservation;
  qrCode: string | null;
  utilisateur: {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    email: string;
  };
  seance: {
    id_seance: number;
    dateHeure: string;
    film: {
      id: number;
      title: string;
      poster?: string;
    };
    salle: {
      id_salle: number;
      nom: string | null;
      numero: number;
    };
  };
  reservationSieges: ReservationSiege[];
};

export type FilterReservationDto = {
  statut?: StatutReservation;
  id_seance?: number;
  id_cinema?: number;
  dateDebut?: string;
  dateFin?: string;
  reference?: string;
};

export type UpdateReservationDto = {
  statut?: StatutReservation;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const buildQuery = (filters: FilterReservationDto): string => {
  const params = new URLSearchParams();
  if (filters.statut)    params.set('statut',    filters.statut);
  if (filters.id_seance) params.set('id_seance', String(filters.id_seance));
  if (filters.id_cinema) params.set('id_cinema', String(filters.id_cinema));
  if (filters.dateDebut) params.set('dateDebut', filters.dateDebut);
  if (filters.dateFin)   params.set('dateFin',   filters.dateFin);
  if (filters.reference) params.set('reference', filters.reference);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

// ─── API ──────────────────────────────────────────────────────────────────────
export const reservationsApi = {
  async getAll(filters: FilterReservationDto = {}) {
    const res = await http.get<Reservation[]>(`/reservation${buildQuery(filters)}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await http.get<Reservation>(`/reservation/${id}`);
    return res.data;
  },

  async updateStatut(id: number, dto: UpdateReservationDto) {
    const res = await http.patch<Reservation>(`/reservation/${id}`, dto);
    return res.data;
  },

  async remove(id: number) {
    await http.delete(`/reservation/${id}`);
  },
};