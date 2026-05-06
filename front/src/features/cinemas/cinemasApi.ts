import { http } from '../../services/http';

export type Cinema = {
  id_cinema: number;
  nom: string;
  adresse: string | null;
  ville: string | null;
  telephone: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type CreateCinemaDto = {
  nom: string;
  adresse?: string | null;
  ville?: string | null;
  telephone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type UpdateCinemaDto = Partial<Omit<Cinema, 'id_cinema'>>;

const normalizeCinema = (cinema: any): Cinema => ({
  ...cinema,
  latitude: cinema.latitude != null ? parseFloat(cinema.latitude) : null,
  longitude: cinema.longitude != null ? parseFloat(cinema.longitude) : null,
});

export const cinemasApi = {
  async create(dto: CreateCinemaDto) {
    const response = await http.post<Cinema>('/cinema', dto);
    return normalizeCinema(response.data);
  },

  async getAll() {
    const response = await http.get<Cinema[]>('/cinema');
    return response.data.map(normalizeCinema);
  },

  async getById(id: number) {
    const response = await http.get<Cinema>(`/cinema/${id}`);
    return normalizeCinema(response.data);
  },

  async update(id: number, dto: UpdateCinemaDto) {
    await http.patch(`/cinema/${id}`, dto);
  },

  async remove(id: number) {
    await http.delete(`/cinema/${id}`);
  },
};