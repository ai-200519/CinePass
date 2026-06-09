import { http } from '../../services/http';

export type StatutReservation =
  | 'EN_COURS'
  | 'PAYEE'
  | 'VALIDEE'
  | 'UTILISEE'
  | 'ANNULEE'
  | 'EXPIREE';
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
  cinema?: string;
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

  async getByReference(reference: string) {
    const res = await http.get<ReservationDetail>(`/reservation/by-reference/${encodeURIComponent(reference)}`);
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
    const res = await http.get<{ total: number; reservations: any[] }>('/admin/reservations', {
      params: _filters,
    });

    const list = Array.isArray(res.data?.reservations) ? res.data.reservations : [];

    const allowedStatuts: StatutReservation[] = ['EN_COURS', 'PAYEE', 'VALIDEE', 'UTILISEE', 'ANNULEE', 'EXPIREE'];
    const normalizeStatut = (value: any): StatutReservation => {
      return allowedStatuts.includes(value) ? value : 'EN_COURS';
    };

    // Normalize admin response to client ReservationSummary shape
    const normalized: ReservationSummary[] = list.map((r) => {
      const utilisateur = r.utilisateur ?? r.client ?? r.clientUser ?? null;

      const seance = r.seance ?? (r.dateSeance ? {
        id_seance: r.id_seance ?? r.idSeance ?? undefined,
        dateHeure: r.dateSeance,
        film: r.film && typeof r.film === 'object' ? r.film : { id: r.id_film ?? undefined, title: r.film ?? r.title ?? '', poster: r.poster ?? undefined },
        salle: r.salle ? (typeof r.salle === 'object' ? r.salle : { nom: r.salle, numero: r.salleNumero ?? r.numero ?? null }) : undefined,
      } : undefined);

      return {
        id_reservation: r.id_reservation ?? r.id ?? r.idReservation,
        reference: r.reference ?? r.ref ?? '',
        statut: normalizeStatut(r.statut ?? r.status),
        dateReservation: r.dateReservation ?? r.createdAt ?? r.date ?? '',
        montant: r.montant ?? r.montantTotal ?? 0,
        film: (r.seance?.film?.title) ?? (typeof r.film === 'string' ? r.film : r.film?.title) ?? '',
        poster: r.seance?.film?.poster ?? r.poster ?? undefined,
        dateSeance: seance?.dateHeure ?? '',
        technologie: seance?.technologie ?? r.technologie ?? '',
        salle: seance?.salle?.nom ?? (r.salle ?? ''),
        nbSieges: r.nbSieges ?? r.siegesCount ?? (r.reservationSieges ? r.reservationSieges.length : 0),
        utilisateur: utilisateur
          ? {
              id_utilisateur: utilisateur.id_utilisateur ?? utilisateur.id ?? 0,
              nom: utilisateur.nom ?? utilisateur.lastName ?? '',
              prenom: utilisateur.prenom ?? utilisateur.firstName ?? '',
              email: utilisateur.email ?? '',
            }
          : { id_utilisateur: 0, nom: '', prenom: '', email: '' },
        seance: seance ?? (r.seance ?? null),
        reservationSieges: r.reservationSieges ?? r.sieges ?? [],
      } as ReservationSummary;
    });

    return normalized;
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
