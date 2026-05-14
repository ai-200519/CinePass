import { NativeModules, Platform } from 'react-native';

function getPackagerHost() {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (!scriptURL) return null;

  const match = scriptURL.match(/https?:\/\/([^:/]+)/);
  return match?.[1] ?? null;
}

const packagerHost = getPackagerHost();

const DEFAULT_API_URL = packagerHost
  ? `http://${packagerHost}:3000/api`
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api'
    : 'http://localhost:3000/api';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || 'Erreur API';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return data;
}

export const staffApi = {
  login({ email, password }) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { email, motDePasse: password },
    });
  },

  getTodaySeances(token) {
    return apiRequest('/staff/seances/today', { token });
  },

  validateTicket(token, payload) {
    return apiRequest('/staff/tickets/validate', {
      method: 'POST',
      token,
      body: payload,
    });
  },
};
