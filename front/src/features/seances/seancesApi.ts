import { http } from '../../services/http';

export type Seance = {
  id_seance: number;
  dateHeure: string; // ISO date string
  technologie: 'DEUX_D' | 'TROIS_D' | 'IMAX';
  statut: 'PROGRAMMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  film: {
    id: number;
    title: string;
  };
  salle: {
    id_salle: number;
    numero: number;
  };
};

export type CreateSeanceDto = Omit<Seance, 'id_seance'>;
export type UpdateSeanceDto = Partial<CreateSeanceDto>;

export const seancesApi = {
  async getAll() {
    const res = await http.get<Seance[]>('/seance');
    return res.data;
  },

  async getById(id: number) {
    const res = await http.get<Seance>(`/seance/${id}`);
    return res.data;
  },

  async create(dto: CreateSeanceDto) {
    const res = await http.post<Seance>('/seance', dto);
    return res.data;
  },

  async update(id: number, dto: UpdateSeanceDto) {
    const res = await http.patch<Seance>(`/seance/${id}`, dto);
    return res.data;
  },

  async delete(id: number) {
    await http.delete(`/seance/${id}`);
  },
};
