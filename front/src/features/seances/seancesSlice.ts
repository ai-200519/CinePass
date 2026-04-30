import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Seance } from './seancesApi';

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type AsyncState = {
  status: AsyncStatus;
  error: string | null;
};

export type SeancesState = {
  seances: Seance[];
  fetchSeances: AsyncState;
  createSeance: AsyncState;
  updateSeance: AsyncState;
  deleteSeance: AsyncState;
};

const initialState: SeancesState = {
  seances: [],
  fetchSeances: { status: 'idle', error: null },
  createSeance: { status: 'idle', error: null },
  updateSeance: { status: 'idle', error: null },
  deleteSeance: { status: 'idle', error: null },
};

const seancesSlice = createSlice({
  name: 'seances',
  initialState,
  reducers: {
    fetchSeancesRequested(state) {
      state.fetchSeances.status = 'loading';
      state.fetchSeances.error = null;
    },
    fetchSeancesSucceeded(state, action: PayloadAction<Seance[]>) {
      state.seances = action.payload;
      state.fetchSeances.status = 'succeeded';
      state.fetchSeances.error = null;
    },
    fetchSeancesFailed(state, action: PayloadAction<{ error: string }>) {
      state.fetchSeances.status = 'failed';
      state.fetchSeances.error = action.payload.error;
    },

    createSeanceRequested(state, _action: PayloadAction<Seance>) {
      state.createSeance.status = 'loading';
      state.createSeance.error = null;
    },
    createSeanceSucceeded(state, action: PayloadAction<Seance>) {
      state.seances.push(action.payload);
      state.createSeance.status = 'succeeded';
      state.createSeance.error = null;
    },
    createSeanceFailed(state, action: PayloadAction<{ error: string }>) {
      state.createSeance.status = 'failed';
      state.createSeance.error = action.payload.error;
    },

    updateSeanceRequested(state, _action: PayloadAction<{ id: number; seance: Seance }>) {
      state.updateSeance.status = 'loading';
      state.updateSeance.error = null;
    },
    updateSeanceSucceeded(state, action: PayloadAction<Seance>) {
      const index = state.seances.findIndex(s => s.id_seance === action.payload.id_seance);
      if (index !== -1) {
        state.seances[index] = action.payload;
      }
      state.updateSeance.status = 'succeeded';
      state.updateSeance.error = null;
    },
    updateSeanceFailed(state, action: PayloadAction<{ error: string }>) {
      state.updateSeance.status = 'failed';
      state.updateSeance.error = action.payload.error;
    },

    deleteSeanceRequested(state, _action: PayloadAction<number>) {
      state.deleteSeance.status = 'loading';
      state.deleteSeance.error = null;
    },
    deleteSeanceSucceeded(state, action: PayloadAction<number>) {
      state.seances = state.seances.filter(s => s.id_seance !== action.payload);
      state.deleteSeance.status = 'succeeded';
      state.deleteSeance.error = null;
    },
    deleteSeanceFailed(state, action: PayloadAction<{ error: string }>) {
      state.deleteSeance.status = 'failed';
      state.deleteSeance.error = action.payload.error;
    },
  },
});

export const seancesActions = seancesSlice.actions;
export const seancesReducer = seancesSlice.reducer;
