import { http } from '../../services/http';

export type StatutReservation = 'EN_COURS' | 'PAYEE' | 'ANNULEE' | 'EXPIREE';
export type TypePublic = 'NORMAL' | 'ETUDIANT' | 'ENFANT' | 'SENIOR' | 'GROUPE';

export type ReservationSummary = {
  id_reservation: number;
  reference: string;
  statut: StatutReservation;
  dateReservation: string;
  montant: number;
  film: string;
  poster?: string;
  dateSeance: string;
  technologie: string;
  salle: string;
  nbSieges: number;
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
  reservationSieges: Array<{
    id_reservation_siege: number;
    prixUnitaire: number;
    categorie: string;
    siege: {
      id_siege: number;
      numero: string | number;
      rangee: string;
    };
  }>;
};

export type ReservationDetail = {
  id_reservation: number;
  reference: string;
  statut: StatutReservation;
  dateReservation: string;
  qrCode: string | null;
  montant: number;
  devise: string;
  film: {
    title: string;
    poster?: string;
    genre?: string;
    duration?: number;
  } | null;
  seance: {
    dateHeure: string;
    technologie: string;
    salle: string;
  };
  sieges: Array<{
    rangee: string;
    numero: number;
    categorie: string;
    prix: number;
  }>;
  nbSieges: number;
};

export type CreateReservationDto = {
  id_seance: number;
  sieges: Array<{
    id_siege: number;
    typePublic: TypePublic;
  }>;
};

export type CreateReservationResponse = {
  id_reservation: number;
  reference: string;
  statut: StatutReservation;
  montantTotal: number;
  devise: string;
  expiresAt: string;
  message: string;
  seance: {
    id: number;
    dateHeure: string;
    technologie: string;
    salle: string;
  };
  sieges: Array<{
    id_siege: number;
    rangee: string;
    numero: number;
    categorie: string;
    prix: number;
    typePublic: TypePublic;
  }>;
};

export type MesReservationsResponse = {
  total: number;
  reservations: ReservationSummary[];
};

export const reservationsApi = {
  async create(dto: CreateReservationDto) {
    const res = await http.post<CreateReservationResponse>('/reservation', dto);
    return res.data;
  },

  async getMine() {
    const res = await http.get<MesReservationsResponse>('/reservation/mes-reservations');
    return res.data;
  },

  async getById(id: number) {
    const res = await http.get<ReservationDetail>(`/reservation/${id}`);
    return res.data;
  },

  async cancel(id: number) {
    const res = await http.delete<{ message: string; reference: string; statut: StatutReservation }>(
      `/reservation/${id}`,
    );
    return res.data;
  },

  async remove(id: number) {
    await reservationsApi.cancel(id);
  },

  async getAll(_filters: FilterReservationDto = {}) {
    const data = await reservationsApi.getMine();
    return data.reservations;
  },

  async updateStatut(_id: number, _dto: UpdateReservationDto) {
    throw new Error('Statut reservation updates are not available for client reservations.');
  },
};

export type Reservation = ReservationSummary;
export type FilterReservationDto = {
  statut?: StatutReservation;
  id_seance?: number;
  id_cinema?: number;
  dateDebut?: string;
  dateFin?: string;
  reference?: string;
};
export type UpdateReservationDto = { statut?: StatutReservation };
