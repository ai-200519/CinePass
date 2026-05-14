import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { staffApi } from '../api';

function formatTime(value) {
  if (!value) return '--:--';
  return new Date(value).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapSession(item) {
  const total = item.totalSeats ?? item.salle?.capaciteTotale ?? 0;
  return {
    id: String(item.id_seance),
    id_seance: item.id_seance,
    title: item.film?.title ?? 'Film',
    time: formatTime(item.dateHeure),
    dateHeure: item.dateHeure,
    room: item.salle?.nom ?? `Salle ${item.salle?.numero ?? ''}`.trim(),
    used: item.validatedEntries ?? 0,
    reserved: item.reservedSeats ?? 0,
    total,
  };
}

export const loginStaff = createAsyncThunk(
  'auth/loginStaff',
  async ({ email, password }) => {
    const data = await staffApi.login({ email, password });
    if (data.user?.role !== 'STAFF') {
      throw new Error('Compte staff requis');
    }
    return data;
  },
);

export const fetchTodaySeances = createAsyncThunk(
  'seances/fetchToday',
  async (_, { getState }) => {
    const token = selectToken(getState());
    if (!token) throw new Error('Session expiree');
    const data = await staffApi.getTodaySeances(token);
    return data.sessions.map(mapSession);
  },
);

export const validateTicket = createAsyncThunk(
  'validation/validateTicket',
  async ({ sessionId, reference, qrCode }, { getState }) => {
    const token = selectToken(getState());
    if (!token) throw new Error('Session expiree');
    return staffApi.validateTicket(token, {
      id_seance: sessionId,
      reference,
      qrCode,
    });
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: false,
    email: null,
    user: null,
    token: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.isLoggedIn = false;
      state.email = null;
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginStaff.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginStaff.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isLoggedIn = true;
        state.token = action.payload.access_token;
        state.user = action.payload.user ?? null;
        state.email = action.payload.user?.email ?? null;
      })
      .addCase(loginStaff.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Connexion impossible';
      });
  },
});

const seancesSlice = createSlice({
  name: 'seances',
  initialState: {
    sessions: [],
    selectedId: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    selectSession(state, action) {
      state.selectedId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodaySeances.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTodaySeances.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sessions = action.payload;
        if (!action.payload.some((item) => item.id === state.selectedId)) {
          state.selectedId = action.payload[0]?.id ?? null;
        }
      })
      .addCase(fetchTodaySeances.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Chargement impossible';
      })
      .addCase(validateTicket.fulfilled, (state, action) => {
        if (!action.payload.valid) return;
        const id = String(action.payload.reservation?.seance?.id_seance ?? '');
        const session = state.sessions.find((item) => item.id === id);
        if (session) {
          session.used += action.payload.reservation?.sieges?.length || 1;
        }
      });
  },
});

export const { logout } = authSlice.actions;
export const { selectSession } = seancesSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    seances: seancesSlice.reducer,
  },
});

export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectToken = (state) => state.auth.token;
export const selectSessions = (state) => state.seances.sessions;
export const selectSeancesStatus = (state) => state.seances.status;
export const selectSeancesError = (state) => state.seances.error;
export const selectSelectedSessionId = (state) => state.seances.selectedId;

