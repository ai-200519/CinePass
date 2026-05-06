import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  reservationsApi,
  type Reservation,
  type FilterReservationDto,
  type UpdateReservationDto,
} from './reservationsapi';

// ─── Types ────────────────────────────────────────────────────────────────────
export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
export type AsyncState  = { status: AsyncStatus; error: string | null };

export type ReservationsState = {
  reservations:   Reservation[];
  fetchStatus:    AsyncStatus;
  fetchError:     string | null;
  updateReservation: AsyncState;
  deleteReservation: AsyncState;
};

const initialState: ReservationsState = {
  reservations:      [],
  fetchStatus:       'idle',
  fetchError:        null,
  updateReservation: { status: 'idle', error: null },
  deleteReservation: { status: 'idle', error: null },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Une erreur inattendue est survenue.';
};

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchReservations = createAsyncThunk<
  Reservation[],
  FilterReservationDto | undefined,
  { rejectValue: string }
>('reservations/fetchReservations', async (filters = {}, { rejectWithValue }) => {
  try {
    return await reservationsApi.getAll(filters);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateReservationStatut = createAsyncThunk<
  Reservation,
  { id: number; dto: UpdateReservationDto },
  { rejectValue: string }
>('reservations/updateStatut', async ({ id, dto }, { rejectWithValue }) => {
  try {
    return await reservationsApi.updateStatut(id, dto);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteReservation = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('reservations/deleteReservation', async (id, { rejectWithValue }) => {
  try {
    await reservationsApi.remove(id);
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const reservationsSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── Fetch ──────────────────────────────────────────────────────────────
      .addCase(fetchReservations.pending, (state) => {
        state.fetchStatus = 'loading';
        state.fetchError  = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.reservations = action.payload;
        state.fetchStatus  = 'succeeded';
        state.fetchError   = null;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.fetchError  = action.payload ?? 'Impossible de récupérer les réservations.';
      })

      // ── Update statut ──────────────────────────────────────────────────────
      .addCase(updateReservationStatut.pending, (state) => {
        state.updateReservation.status = 'loading';
        state.updateReservation.error  = null;
      })
      .addCase(updateReservationStatut.fulfilled, (state, action) => {
        const idx = state.reservations.findIndex(
          (r) => r.id_reservation === action.payload.id_reservation
        );
        if (idx !== -1) state.reservations[idx] = action.payload;
        state.updateReservation.status = 'succeeded';
        state.updateReservation.error  = null;
      })
      .addCase(updateReservationStatut.rejected, (state, action) => {
        state.updateReservation.status = 'failed';
        state.updateReservation.error  = action.payload ?? 'Impossible de mettre à jour la réservation.';
      })

      // ── Delete ─────────────────────────────────────────────────────────────
      .addCase(deleteReservation.pending, (state) => {
        state.deleteReservation.status = 'loading';
        state.deleteReservation.error  = null;
      })
      .addCase(deleteReservation.fulfilled, (state, action) => {
        state.reservations = state.reservations.filter(
          (r) => r.id_reservation !== action.payload
        );
        state.deleteReservation.status = 'succeeded';
        state.deleteReservation.error  = null;
      })
      .addCase(deleteReservation.rejected, (state, action) => {
        state.deleteReservation.status = 'failed';
        state.deleteReservation.error  = action.payload ?? 'Impossible de supprimer la réservation.';
      });
  },
});

export const reservationsReducer = reservationsSlice.reducer;