import type { RootState } from '../../app/store';

export const selectAuth = (state: RootState) => state.auth;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth.token);

export const selectLoginStatus = (state: RootState) => state.auth.login.status;
export const selectLoginError = (state: RootState) => state.auth.login.error;

export const selectRegisterStatus = (state: RootState) => state.auth.register.status;
export const selectRegisterError = (state: RootState) => state.auth.register.error;
export const selectRegisterRequiresOtp = (state: RootState) => state.auth.registerRequiresOtp;
export const selectRegisterOtpStatus = (state: RootState) => state.auth.registerOtp.status;
export const selectRegisterOtpError = (state: RootState) => state.auth.registerOtp.error;

export const selectForgotPasswordStatus = (state: RootState) => state.auth.forgotPassword.status;
export const selectForgotPasswordError = (state: RootState) => state.auth.forgotPassword.error;

export const selectResetPasswordStatus = (state: RootState) => state.auth.resetPassword.status;
export const selectResetPasswordError = (state: RootState) => state.auth.resetPassword.error;
