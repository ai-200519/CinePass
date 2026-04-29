import type { RootState } from '../../app/store';

export const selectAuth = (state: RootState) => state.auth;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth.token);

export const selectLoginStatus = (state: RootState) => state.auth.login.status;
export const selectLoginError = (state: RootState) => state.auth.login.error;

export const selectRegisterStatus = (state: RootState) => state.auth.register.status;
export const selectRegisterError = (state: RootState) => state.auth.register.error;
