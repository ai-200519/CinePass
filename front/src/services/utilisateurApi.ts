import { http } from './http';

export type UtilisateurMe = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'CLIENT' | 'STAFF' | 'ADMIN';
  telephone?: string | null;
  ville?: string | null;
  avatarUrl?: string | null;
  statut: string;
  createdAt?: string;
  id_cinema: number | null;
  // Stats injected by backend (optional)
  nbReservations?: number;
  nbFilmsVus?: number;
};

export type UpdateUtilisateurDto = {
  nom?: string;
  prenom?: string;
  telephone?: string;
  ville?: string;
};

export const utilisateurApi = {
  me: () => http.get<UtilisateurMe>('/utilisateur/me').then((r) => r.data),
  update: (dto: UpdateUtilisateurDto) =>
    http.patch<UtilisateurMe>('/utilisateur/me', dto).then((r) => r.data),
};