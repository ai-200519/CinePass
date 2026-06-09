import { http } from './http';

export type InitierPaiementDto = {
  id_reservation: number;
  methode: 'STRIPE';
};

export type InitierPaiementResponse = {
  id_paiement: number;
  sessionId: string;
  url: string;
  montantTotal: number;
  devise: string;
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';
  message: string;
};

export type PaiementStatus = {
  id_paiement: number;
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';
  montantTotal: number;
  devise: string;
  methode: 'STRIPE' | 'PAYPAL';
  referenceTransaction: string | null;
  datePaiement: string | null;
};

export const paiementApi = {
  async initier(dto: InitierPaiementDto) {
    const res = await http.post<InitierPaiementResponse>('/paiement/initier', dto);
    return res.data;
  },

  async getStatus(idReservation: number) {
    const res = await http.get<PaiementStatus>(`/paiement/${idReservation}`);
    return res.data;
  },
};
