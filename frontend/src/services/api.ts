import axios from 'axios';

const rawBaseUrl = process.env.REACT_APP_API_URL || '';
const cleanBaseUrl = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl.slice(0, -4)
  : rawBaseUrl.replace(/\/$/, '');

export const api = axios.create({
  baseURL: cleanBaseUrl,
});

export default api;

type ApiError = {
  response?: {
    data?: {
      detail?: unknown;
    };
  };
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as ApiError)?.response?.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      if (item && typeof item === 'object' && 'msg' in item) {
        return String((item as { msg?: unknown }).msg ?? 'Invalid request');
      }

      return 'Invalid request';
    }).join('; ');
  }

  return fallback;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
