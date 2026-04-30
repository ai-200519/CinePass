import { configureStore, createSlice } from '@reduxjs/toolkit';

const initialSessions = [
  {
    id: 's1',
    title: 'Apocalypse Stellaire',
    time: '14:00',
    room: 'Salle 1',
    used: 75,
    total: 120,
  },
  {
    id: 's2',
    title: 'Apocalypse Stellaire',
    time: '17:30',
    room: 'Salle 1',
    used: 108,
    total: 120,
  },
  {
    id: 's3',
    title: 'Apocalypse Stellaire',
    time: '20:45',
    room: 'Salle 2',
    used: 75,
    total: 80,
  },
  {
    id: 's4',
    title: 'Les Ombres du Passé',
    time: '15:15',
    room: 'Salle 3',
    used: 33,
    total: 100,
  },
];

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: false,
    email: null,
  },
  reducers: {
    login(state, action) {
      state.isLoggedIn = true;
      state.email = action.payload?.email ?? null;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.email = null;
    },
  },
});

const seancesSlice = createSlice({
  name: 'seances',
  initialState: {
    sessions: initialSessions,
    selectedId: 's3',
  },
  reducers: {
    selectSession(state, action) {
      state.selectedId = action.payload;
    },
  },
});

export const { login, logout } = authSlice.actions;
export const { selectSession } = seancesSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    seances: seancesSlice.reducer,
  },
});

export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectSessions = (state) => state.seances.sessions;
export const selectSelectedSessionId = (state) => state.seances.selectedId;
