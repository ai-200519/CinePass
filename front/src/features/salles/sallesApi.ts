import { http } from '../../services/http';

export type Salle = {
  id_salle: number;
  numero: number;
  nom: string | null;
  capaciteTotale: number;
  equipements: string | null;
};

export type CreateSalleDto = Omit<Salle, 'id_salle'> & { equipements?: string };
export type UpdateSalleDto = Partial<Omit<Salle, 'id_salle'>>;

export const sallesApi = {
  async create(dto: CreateSalleDto) {
    const response = await http.post<Salle>('/salle', dto);
    return response.data;
  },

  async getAll() {
    const response = await http.get<Salle[]>('/salle');
    return response.data;
  },

  async getById(id: number) {
    const response = await http.get<Salle>(`/salle/${id}`);
    return response.data;
  },

  async update(id: number, dto: UpdateSalleDto) {
    const response = await http.patch<Salle>(`/salle/${id}`, dto);
    return response.data;
  },

  async remove(id: number) {
    await http.delete(`/salle/${id}`);
  },
};