import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { sallesApi, Salle, CreateSalleDto, UpdateSalleDto } from './sallesApi';

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type AsyncState = {
  status: AsyncStatus;
  error: string | null;
};

export type SallesState = {
  salles: Salle[];
  fetchStatus: AsyncStatus;
  error: string | null;
  createSalle: AsyncState;
  updateSalle: AsyncState;
  deleteSalle: AsyncState;
};

const initialState: SallesState = {
  salles: [],
  fetchStatus: 'idle',
  error: null,
  createSalle: { status: 'idle', error: null },
  updateSalle: { status: 'idle', error: null },
  deleteSalle: { status: 'idle', error: null },
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Une erreur inattendue est survenue.';
};

export const createSalle = createAsyncThunk<Salle, CreateSalleDto, { rejectValue: string }>(
  'salles/createSalle',
  async (data, { rejectWithValue }) => {
    try {
      return await sallesApi.create(data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSalles = createAsyncThunk<Salle[], void, { rejectValue: string }>(
  'salles/fetchSalles',
  async (_, { rejectWithValue }) => {
    try {
      return await sallesApi.getAll();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateSalle = createAsyncThunk<
  Salle,
  { id: number; data: UpdateSalleDto },
  { rejectValue: string }
>('salles/updateSalle', async ({ id, data }, { rejectWithValue }) => {
  try {
    await sallesApi.update(id, data);
    // repository.update() retourne UpdateResult, pas la salle
    // On refetch la salle mise à jour
    return await sallesApi.getById(id);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteSalle = createAsyncThunk<number, number, { rejectValue: string }>(
  'salles/deleteSalle',
  async (id, { rejectWithValue }) => {
    try {
      await sallesApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const sallesSlice = createSlice({
  name: 'salles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createSalle.pending, (state) => {
        state.createSalle.status = 'loading';
        state.createSalle.error = null;
      })
      .addCase(createSalle.fulfilled, (state, action) => {
        state.salles.push(action.payload);
        state.createSalle.status = 'succeeded';
        state.createSalle.error = null;
      })
      .addCase(createSalle.rejected, (state, action) => {
        state.createSalle.status = 'failed';
        state.createSalle.error = action.payload ?? 'Impossible de créer la salle.';
      })
      .addCase(fetchSalles.pending, (state) => {
        state.fetchStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchSalles.fulfilled, (state, action) => {
        state.salles = action.payload;
        state.fetchStatus = 'succeeded';
        state.error = null;
      })
      .addCase(fetchSalles.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = action.payload ?? 'Impossible de récupérer les salles.';
      })
      .addCase(updateSalle.pending, (state) => {
        state.updateSalle.status = 'loading';
        state.updateSalle.error = null;
      })
      .addCase(updateSalle.fulfilled, (state, action) => {
        const index = state.salles.findIndex((s) => s.id_salle === action.payload.id_salle);
        if (index !== -1) {
          state.salles[index] = action.payload;
        }
        state.updateSalle.status = 'succeeded';
        state.updateSalle.error = null;
      })
      .addCase(updateSalle.rejected, (state, action) => {
        state.updateSalle.status = 'failed';
        state.updateSalle.error = action.payload ?? 'Impossible de mettre à jour la salle.';
      })
      .addCase(deleteSalle.pending, (state) => {
        state.deleteSalle.status = 'loading';
        state.deleteSalle.error = null;
      })
      .addCase(deleteSalle.fulfilled, (state, action) => {
        state.salles = state.salles.filter((s) => s.id_salle !== action.payload);
        state.deleteSalle.status = 'succeeded';
        state.deleteSalle.error = null;
      })
      .addCase(deleteSalle.rejected, (state, action) => {
        state.deleteSalle.status = 'failed';
        state.deleteSalle.error = action.payload ?? 'Impossible de supprimer la salle.';
      });
  },
});

export const sallesReducer = sallesSlice.reducer;