import {
    AUTH_FORGOT_PASSWORD_PATH,
    AUTH_LOGIN_PATH,
    AUTH_REGISTER_PATH,
    AUTH_RESET_PASSWORD_PATH,
    AUTH_VERIFY_OTP_PATH,
} from '../config';
import { http } from './http';

export type LoginDto = {
  email: string;
  motDePasse: string;
};

export type RegisterDto = {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
};

export type ForgotPasswordDto = {
  email: string;
};

export type ResetPasswordDto = {
  email: string;
  otp: string;
  newPassword: string;
};

export type VerifyOtpDto = {
  email: string;
  otp: string;
};

// Adjust if your backend returns a different token key.
export type LoginResponse = {
  access_token: string;
  user?: unknown;
};

export const authApi = {
  async login(dto: LoginDto) {
    const res = await http.post<LoginResponse>(AUTH_LOGIN_PATH, dto);
    return res.data;
  },

  async register(dto: RegisterDto) {
    const res = await http.post(AUTH_REGISTER_PATH, dto);
    return res.data;
  },

  async verifyOtp(dto: VerifyOtpDto) {
    const res = await http.post<LoginResponse>(AUTH_VERIFY_OTP_PATH, dto);
    return res.data;
  },

  async forgotPassword(dto: ForgotPasswordDto) {
    const res = await http.post(AUTH_FORGOT_PASSWORD_PATH, dto);
    return res.data as { message: string };
  },

  async resetPassword(dto: ResetPasswordDto) {
    const res = await http.post(AUTH_RESET_PASSWORD_PATH, dto);
    return res.data as { message: string };
  },
};
