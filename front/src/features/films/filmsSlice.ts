import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Film } from './filmsApi';

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
export type AsyncState = { status: AsyncStatus; error: string | null };

export type FilmsState = {
  films: Film[];
  fetchFilms: AsyncState;
  createFilm: AsyncState;
  updateFilm: AsyncState;
  deleteFilm: AsyncState;
};

const initialState: FilmsState = {
  films: [],
  fetchFilms: { status: 'idle', error: null },
  createFilm: { status: 'idle', error: null },
  updateFilm: { status: 'idle', error: null },
  deleteFilm: { status: 'idle', error: null },
};

const filmsSlice = createSlice({
  name: 'films',
  initialState,
  reducers: {
    fetchFilmsRequested(state) {
      state.fetchFilms.status = 'loading';
      state.fetchFilms.error = null;
    },
    fetchFilmsSucceeded(state, action: PayloadAction<Film[]>) {
      state.films = action.payload;
      state.fetchFilms.status = 'succeeded';
    },
    fetchFilmsFailed(state, action: PayloadAction<{ error: string }>) {
      state.fetchFilms.status = 'failed';
      state.fetchFilms.error = action.payload.error;
    },

    createFilmRequested(state, _action: PayloadAction<any>) {
      state.createFilm.status = 'loading';
      state.createFilm.error = null;
    },
    // Après create on refetch toute la liste
    createFilmSucceeded(state, action: PayloadAction<Film[]>) {
      state.films = action.payload;
      state.createFilm.status = 'succeeded';
    },
    createFilmFailed(state, action: PayloadAction<{ error: string }>) {
      state.createFilm.status = 'failed';
      state.createFilm.error = action.payload.error;
    },

    updateFilmRequested(state, _action: PayloadAction<{ id: number; film: any }>) {
      state.updateFilm.status = 'loading';
      state.updateFilm.error = null;
    },
    // Après update on reçoit le film mis à jour via getById
    updateFilmSucceeded(state, action: PayloadAction<Film>) {
      const index = state.films.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) state.films[index] = action.payload;
      state.updateFilm.status = 'succeeded';
    },
    updateFilmFailed(state, action: PayloadAction<{ error: string }>) {
      state.updateFilm.status = 'failed';
      state.updateFilm.error = action.payload.error;
    },

    deleteFilmRequested(state, _action: PayloadAction<number>) {
      state.deleteFilm.status = 'loading';
      state.deleteFilm.error = null;
    },
    deleteFilmSucceeded(state, action: PayloadAction<number>) {
      state.films = state.films.filter((f) => f.id !== action.payload);
      state.deleteFilm.status = 'succeeded';
    },
    deleteFilmFailed(state, action: PayloadAction<{ error: string }>) {
      state.deleteFilm.status = 'failed';
      state.deleteFilm.error = action.payload.error;
    },
  },
});

export const filmsActions = filmsSlice.actions;
export const filmsReducer = filmsSlice.reducer;