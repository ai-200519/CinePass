import { http } from '../../services/http';

export type Siege = {
  id_siege: number;
  rangee: string;
  numero: number;
  categorie: 'STANDARD' | 'VIP' | string;
  statut: 'DISPONIBLE' | 'BLOQUE' | string;
  reserved?: boolean;
  salle?: {
    id_salle: number;
    numero: number;
  };
};

export const siegesApi = {
  async getBySalle(idSalle: number, idSeance?: number) {
    const res = await http.get<Siege[]>('/siege', {
      params: { id_salle: idSalle, id_seance: idSeance },
    });
    return res.data;
  },
};
