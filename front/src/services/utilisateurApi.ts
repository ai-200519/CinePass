import { http } from './http';

export type UtilisateurMe = {
  id?: number;
  id_utilisateur?: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'CLIENT' | 'STAFF' | 'ADMIN';
  telephone?: string | null;
  ville?: string | null;
  avatarUrl?: string | null;
  statut: string;
  dateInscription?: string;
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

const normalizeMe = (user: UtilisateurMe): UtilisateurMe => ({
  ...user,
  id: user.id ?? user.id_utilisateur,
  createdAt: user.createdAt ?? user.dateInscription,
});

export const utilisateurApi = {
  me: () => http.get<UtilisateurMe>('/utilisateur/profil').then((r) => normalizeMe(r.data)),
  update: ({ ville: _ville, ...dto }: UpdateUtilisateurDto) =>
    http.patch<UtilisateurMe>('/utilisateur/profil', dto).then((r) => normalizeMe(r.data)),
};
