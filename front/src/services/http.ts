import axios from 'axios';
import { API_BASE_URL } from '../config';
import { tokenStorage } from './tokenStorage';

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // If the backend returns 401, the JWT is missing/expired/invalid (or user was deleted).
    // Clear token and force navigation to login so UI doesn't stay stuck on admin pages.
    if (status === 401) {
      tokenStorage.clear();
      if (typeof window !== 'undefined') {
        const currentPath = window.location?.pathname ?? '';
        if (!currentPath.startsWith('/login')) {
          window.location.assign('/login');
        }
      }
    }

    return Promise.reject(error);
  },
);
