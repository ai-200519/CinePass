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
    const res = await http.get<Film[]>('/film/all');
    return res.data.map(normalizeFilm);
  },

  async getById(id: number) {
    const res = await http.get<Film>(`/film/${id}`);
    return normalizeFilm(res.data);
  },

  async create(dto: CreateFilmDto) {
    await http.post('/film/create', dto);
    // Le backend retourne { message } pas le film, on refetch la liste
    return filmsApi.getAll();
  },

  async update(id: number, dto: UpdateFilmDto) {
    // repository.update() retourne UpdateResult, on refetch après
    await http.patch(`/film/${id}`, dto);
    return filmsApi.getById(id);
  },

  async delete(id: number) {
    await http.delete(`/film/${id}`);
  },
};