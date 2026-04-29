import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from '../config';
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
};
