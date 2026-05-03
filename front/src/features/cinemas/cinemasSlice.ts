import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { cinemasApi, Cinema, CreateCinemaDto, UpdateCinemaDto } from './cinemasApi';

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
export type AsyncState = { status: AsyncStatus; error: string | null };

export type CinemasState = {
  cinemas: Cinema[];
  fetchStatus: AsyncStatus;
  error: string | null;
  createCinema: AsyncState;
  updateCinema: AsyncState;
  deleteCinema: AsyncState;
};

const initialState: CinemasState = {
  cinemas: [],
  fetchStatus: 'idle',
  error: null,
  createCinema: { status: 'idle', error: null },
  updateCinema: { status: 'idle', error: null },
  deleteCinema: { status: 'idle', error: null },
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Une erreur inattendue est survenue.';
};

export const fetchCinemas = createAsyncThunk<Cinema[], void, { rejectValue: string }>(
  'cinemas/fetchCinemas',
  async (_, { rejectWithValue }) => {
    try {
      return await cinemasApi.getAll();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createCinema = createAsyncThunk<Cinema, CreateCinemaDto, { rejectValue: string }>(
  'cinemas/createCinema',
  async (data, { rejectWithValue }) => {
    try {
      return await cinemasApi.create(data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateCinema = createAsyncThunk<
  Cinema,
  { id: number; data: UpdateCinemaDto },
  { rejectValue: string }
>('cinemas/updateCinema', async ({ id, data }, { rejectWithValue }) => {
  try {
    await cinemasApi.update(id, data);
    return await cinemasApi.getById(id);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteCinema = createAsyncThunk<number, number, { rejectValue: string }>(
  'cinemas/deleteCinema',
  async (id, { rejectWithValue }) => {
    try {
      await cinemasApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const cinemasSlice = createSlice({
  name: 'cinemas',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCinemas.pending, (state) => {
        state.fetchStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchCinemas.fulfilled, (state, action) => {
        state.cinemas = action.payload;
        state.fetchStatus = 'succeeded';
        state.error = null;
      })
      .addCase(fetchCinemas.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = action.payload ?? 'Impossible de récupérer les cinémas.';
      })
      .addCase(createCinema.pending, (state) => {
        state.createCinema.status = 'loading';
        state.createCinema.error = null;
      })
      .addCase(createCinema.fulfilled, (state, action) => {
        state.cinemas.push(action.payload);
        state.createCinema.status = 'succeeded';
        state.createCinema.error = null;
      })
      .addCase(createCinema.rejected, (state, action) => {
        state.createCinema.status = 'failed';
        state.createCinema.error = action.payload ?? 'Impossible de créer le cinéma.';
      })
      .addCase(updateCinema.pending, (state) => {
        state.updateCinema.status = 'loading';
        state.updateCinema.error = null;
      })
      .addCase(updateCinema.fulfilled, (state, action) => {
        const index = state.cinemas.findIndex((cinema) => cinema.id_cinema === action.payload.id_cinema);
        if (index !== -1) state.cinemas[index] = action.payload;
        state.updateCinema.status = 'succeeded';
        state.updateCinema.error = null;
      })
      .addCase(updateCinema.rejected, (state, action) => {
        state.updateCinema.status = 'failed';
        state.updateCinema.error = action.payload ?? 'Impossible de mettre à jour le cinéma.';
      })
      .addCase(deleteCinema.pending, (state) => {
        state.deleteCinema.status = 'loading';
        state.deleteCinema.error = null;
      })
      .addCase(deleteCinema.fulfilled, (state, action) => {
        state.cinemas = state.cinemas.filter((cinema) => cinema.id_cinema !== action.payload);
        state.deleteCinema.status = 'succeeded';
        state.deleteCinema.error = null;
      })
      .addCase(deleteCinema.rejected, (state, action) => {
        state.deleteCinema.status = 'failed';
        state.deleteCinema.error = action.payload ?? 'Impossible de supprimer le cinéma.';
      });
  },
});

export const cinemasReducer = cinemasSlice.reducer;
