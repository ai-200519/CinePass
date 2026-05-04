import { http } from '../../services/http';

export type Seance = {
  id_seance: number;
  dateHeure: string;
  technologie: '2D' | '3D' | '4DX' | 'DOLBY'; // ✅ valeurs réelles de l'enum backend
  statut: 'PROGRAMMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  totalSeats?: number;
  reservedSeats?: number;
  remainingSeats?: number;
  film: {
    id: number;
    title: string;
  };
  salle: {
    id_salle: number;
    numero: number;
    capaciteTotale?: number;
  };

  // Optional fields returned by backend for UX (availability)
  totalSeats?: number | null;
  reservedSeats?: number;
  remainingSeats?: number;
};

export type CreateSeanceDto = {
  dateHeure: string;
  technologie: Seance['technologie'];
  statut: Seance['statut'];
  film: { id: number };
  salle: { id_salle: number };
};

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