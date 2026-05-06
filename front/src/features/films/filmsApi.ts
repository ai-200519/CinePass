import { http } from '../../services/http';

export type Film = {
  id: number;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  director: string;
  actors: string[];
  genre: string;
  poster: string;
  trailer: string;
  note: number;
  isShowing: boolean;
  statut: 'EN_COURS' | 'A_VENIR';
};

export type CreateFilmDto = {
  title: string;
  description: string;
  duration: number;
  releaseDate: Date;
  director: string;
  actors: string[];
  genre: string;
  poster: string;
  trailer: string;
  note: number;
  isShowing: boolean;
};

export type UpdateFilmDto = Partial<CreateFilmDto>;

const normalizeFilm = (film: any): Film => ({
  ...film,
  note: typeof film.note === 'string' ? parseFloat(film.note) : film.note,
  duration: typeof film.duration === 'string' ? parseInt(film.duration, 10) : film.duration,
  isShowing: typeof film.isShowing === 'string' ? film.isShowing === 'true' : film.isShowing,
  actors: Array.isArray(film.actors) ? film.actors : [],
});

export const filmsApi = {
  async getAll() {
    const res = await http.get('/film/all');
    // Backend may return a paginated object { data, meta } or a plain array.
    const payload = res?.data && res.data.data !== undefined ? res.data.data : res.data;
    if (!Array.isArray(payload)) return [];
    return payload.map(normalizeFilm);

  },

  async getById(id: number) {
    const res = await http.get<Film>(`/film/${id}`);
    return normalizeFilm(res.data);
  },

  async create(dto: CreateFilmDto) {
    await http.post('/film/create', dto);
    return filmsApi.getAll(); // refetch
  },

  async update(id: number, dto: UpdateFilmDto) {
    await http.patch(`/film/${id}`, dto);
    return filmsApi.getById(id);
  },

  async delete(id: number) {
    await http.delete(`/film/${id}`);
  },
};