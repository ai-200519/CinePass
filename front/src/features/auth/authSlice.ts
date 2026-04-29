import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type AsyncState = {
  status: AsyncStatus;
  error: string | null;
};

export type AuthState = {
  token: string | null;
  login: AsyncState;
  register: AsyncState;
};

const initialState: AuthState = {
  token: null,
  login: { status: 'idle', error: null },
  register: { status: 'idle', error: null },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateFromStorage(state, action: PayloadAction<{ token: string | null }>) {
      state.token = action.payload.token;
    },

    loginRequested(state, _action: PayloadAction<{ email: string; password: string }>) {
      state.login.status = 'loading';
      state.login.error = null;
    },
    loginSucceeded(state, action: PayloadAction<{ token: string }>) {
      state.token = action.payload.token;
      state.login.status = 'succeeded';
      state.login.error = null;
    },
    loginFailed(state, action: PayloadAction<{ error: string }>) {
      state.login.status = 'failed';
      state.login.error = action.payload.error;
    },

    registerRequested(
      state,
      _action: PayloadAction<{
        nom: string;
        prenom: string;
        email: string;
        password: string;
        telephone?: string;
      }>,
    ) {
      state.register.status = 'loading';
      state.register.error = null;
    },
    registerSucceeded(state) {
      state.register.status = 'succeeded';
      state.register.error = null;
    },
    registerFailed(state, action: PayloadAction<{ error: string }>) {
      state.register.status = 'failed';
      state.register.error = action.payload.error;
    },

    logout(state) {
      state.token = null;
      state.login = { status: 'idle', error: null };
      state.register = { status: 'idle', error: null };
    },

    clearRegisterState(state) {
      state.register = { status: 'idle', error: null };
    },
    clearLoginState(state) {
      state.login = { status: 'idle', error: null };
    },
  },
});

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;
