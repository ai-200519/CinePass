import { http } from '../../services/http';

export type Film = {
  id: number;
  title: string;
  description: string;
  duration: number;
  releaseDate: string; // ISO date string
  director: string;
  actors: string[];
  genre: string;
  poster: string;
  trailer: string;
  note: number;
  isShowing: boolean;
  statut: 'EN_COURS' | 'A_VENIR';
};

export type CreateFilmDto = Omit<Film, 'id'>;
export type UpdateFilmDto = Partial<CreateFilmDto>;

export const filmsApi = {
  async getAll() {
    const res = await http.get<Film[]>('/film');
    return res.data;
  },

  async getById(id: number) {
    const res = await http.get<Film>(`/film/${id}`);
    return res.data;
  },

  async create(dto: CreateFilmDto) {
    const res = await http.post<Film>('/film', dto);
    return res.data;
  },

  async update(id: number, dto: UpdateFilmDto) {
    const res = await http.patch<Film>(`/film/${id}`, dto);
    return res.data;
  },

  async delete(id: number) {
    await http.delete(`/film/${id}`);
  },
};