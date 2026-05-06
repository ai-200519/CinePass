import { http } from './http';

export type StatsFilter = {
  dateDebut?: string; // YYYY-MM-DD
  dateFin?: string; // YYYY-MM-DD
  limit?: number;
  id_cinema?: number;
};

export type AdminGlobalStats = {
  cinema: { id: number | null; nom: string; ville?: string } | null;
  periode: { debut: string; fin: string };
  kpis: {
    totalBillets: number;
    totalReservations: number;
    chiffreAffaires: number;
    devise: string; // e.g. MAD
    tauxRemplissageMoyen: string; // e.g. "72.5%"
    tauxAnnulation: string; // e.g. "10.5%"
  };
};

export type AdminFilmsStats = {
  cinema: { id: number | null; nom: string; ville?: string } | null;
  films: Array<{
    rang: number;
    id_film: number;
    title: string;
    genre?: string;
    poster?: string | null;
    nbReservations: number;
    chiffreAffaires: number;
    devise: string;
  }>;
};

export type AdminRevenusStats = {
  periode: { debut: string; fin: string };
  totalCA: number;
  devise: string;
  parJour: Array<{ jour: string; ca: number; nbPaiements: number }>;
  parMethode: Array<{ methode: string; ca: number; count: number }>;
};

export type AdminReservationsByStatusStats = {
  total: number;
  parStatut: Array<{ statut: string; count: number; pourcentage: number }>;
};

export type AdminSeancesStats = {
  cinema: { id: number | null; nom: string; ville?: string } | null;
  seances: Array<{
    id_seance: number;
    film: string;
    salle: string;
    capacite: number;
    nbReservations: number;
    placesRestantes: number;
    tauxRemplissage: string;
    statut: string;
  }>;
};

export const adminStatsApi = {
  global: (filter?: StatsFilter) => http.get<AdminGlobalStats>('/admin/stats', { params: filter }).then((r) => r.data),
  films: (filter?: StatsFilter) => http.get<AdminFilmsStats>('/admin/stats/films', { params: filter }).then((r) => r.data),
  seances: (filter?: StatsFilter) => http.get<AdminSeancesStats>('/admin/stats/seances', { params: filter }).then((r) => r.data),
  revenus: (filter?: StatsFilter) => http.get<AdminRevenusStats>('/admin/stats/revenus', { params: filter }).then((r) => r.data),
  reservations: (filter?: StatsFilter) =>
    http.get<AdminReservationsByStatusStats>('/admin/stats/reservations', { params: filter }).then((r) => r.data),
};
