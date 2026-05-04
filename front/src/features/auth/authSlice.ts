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
  registerOtp: AsyncState;
  registerRequiresOtp: boolean;
  resendOtp: AsyncState;
  resendOtpMessage: string | null;
  forgotPassword: AsyncState;
  resetPassword: AsyncState;
};

const initialState: AuthState = {
  token: null,
  login: { status: 'idle', error: null },
  register: { status: 'idle', error: null },
  registerOtp: { status: 'idle', error: null },
  registerRequiresOtp: false,
  resendOtp: { status: 'idle', error: null },
  resendOtpMessage: null,
  forgotPassword: { status: 'idle', error: null },
  resetPassword: { status: 'idle', error: null },
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
    registerSucceeded(state, action: PayloadAction<{ requiresOtp: boolean }>) {
      state.register.status = 'succeeded';
      state.register.error = null;
      state.registerRequiresOtp = action.payload.requiresOtp;
    },
    registerFailed(state, action: PayloadAction<{ error: string }>) {
      state.register.status = 'failed';
      state.register.error = action.payload.error;
      state.registerRequiresOtp = false;
    },

    registerOtpRequested(state, _action: PayloadAction<{ email: string; otp: string }>) {
      state.registerOtp.status = 'loading';
      state.registerOtp.error = null;
    },
    registerOtpSucceeded(state) {
      state.registerOtp.status = 'succeeded';
      state.registerOtp.error = null;
    },
    registerOtpFailed(state, action: PayloadAction<{ error: string }>) {
      state.registerOtp.status = 'failed';
      state.registerOtp.error = action.payload.error;
    },

    resendOtpRequested(
      state,
      _action: PayloadAction<{ email: string; purpose: 'register' | 'reset_password' }>,
    ) {
      state.resendOtp.status = 'loading';
      state.resendOtp.error = null;
      state.resendOtpMessage = null;
    },
    resendOtpSucceeded(state, action: PayloadAction<{ message: string }>) {
      state.resendOtp.status = 'succeeded';
      state.resendOtp.error = null;
      state.resendOtpMessage = action.payload.message;
    },
    resendOtpFailed(state, action: PayloadAction<{ error: string }>) {
      state.resendOtp.status = 'failed';
      state.resendOtp.error = action.payload.error;
      state.resendOtpMessage = null;
    },

    forgotPasswordRequested(state, _action: PayloadAction<{ email: string }>) {
      state.forgotPassword.status = 'loading';
      state.forgotPassword.error = null;
    },
    forgotPasswordSucceeded(state) {
      state.forgotPassword.status = 'succeeded';
      state.forgotPassword.error = null;
    },
    forgotPasswordFailed(state, action: PayloadAction<{ error: string }>) {
      state.forgotPassword.status = 'failed';
      state.forgotPassword.error = action.payload.error;
    },

    resetPasswordRequested(
      state,
      _action: PayloadAction<{ email: string; otp: string; newPassword: string }>,
    ) {
      state.resetPassword.status = 'loading';
      state.resetPassword.error = null;
    },
    resetPasswordSucceeded(state) {
      state.resetPassword.status = 'succeeded';
      state.resetPassword.error = null;
    },
    resetPasswordFailed(state, action: PayloadAction<{ error: string }>) {
      state.resetPassword.status = 'failed';
      state.resetPassword.error = action.payload.error;
    },

    logout(state) {
      state.token = null;
      state.login = { status: 'idle', error: null };
      state.register = { status: 'idle', error: null };
      state.registerOtp = { status: 'idle', error: null };
      state.registerRequiresOtp = false;
      state.resendOtp = { status: 'idle', error: null };
      state.resendOtpMessage = null;
      state.forgotPassword = { status: 'idle', error: null };
      state.resetPassword = { status: 'idle', error: null };
    },

    clearRegisterState(state) {
      state.register = { status: 'idle', error: null };
      state.registerRequiresOtp = false;
    },
    clearRegisterOtpState(state) {
      state.registerOtp = { status: 'idle', error: null };
    },
    clearResendOtpState(state) {
      state.resendOtp = { status: 'idle', error: null };
      state.resendOtpMessage = null;
    },
    clearLoginState(state) {
      state.login = { status: 'idle', error: null };
    },
    clearForgotPasswordState(state) {
      state.forgotPassword = { status: 'idle', error: null };
    },
    clearResetPasswordState(state) {
      state.resetPassword = { status: 'idle', error: null };
    },
  },
});

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;
