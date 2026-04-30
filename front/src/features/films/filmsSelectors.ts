import type { RootState } from '../../app/store';

export const selectFilms = (state: RootState) => state.films.films;
export const selectFetchFilmsStatus = (state: RootState) => state.films.fetchFilms.status;
export const selectFetchFilmsError = (state: RootState) => state.films.fetchFilms.error;
export const selectCreateFilmStatus = (state: RootState) => state.films.createFilm.status;
export const selectCreateFilmError = (state: RootState) => state.films.createFilm.error;
export const selectUpdateFilmStatus = (state: RootState) => state.films.updateFilm.status;
export const selectUpdateFilmError = (state: RootState) => state.films.updateFilm.error;
export const selectDeleteFilmStatus = (state: RootState) => state.films.deleteFilm.status;
export const selectDeleteFilmError = (state: RootState) => state.films.deleteFilm.error;