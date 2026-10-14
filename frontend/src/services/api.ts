import axios from 'axios';

let defaultBackendUrl = '';
if (typeof window !== 'undefined') {
  if (window.location.hostname.includes('onrender.com')) {
    defaultBackendUrl = 'https://healthmitra-backend-mu58.onrender.com';
  } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    defaultBackendUrl = 'http://localhost:8000';
  }
}

const rawBaseUrl = process.env.REACT_APP_API_URL || defaultBackendUrl;
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
  if (!error) return fallback;

  // Check network error (no response from backend)
  const isAxios = (error as any)?.isAxiosError;
  if (isAxios && !(error as any)?.response) {
    if ((error as any)?.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    return 'Unable to connect to the healthcare server. Please retry in a few seconds (free cloud instances may take ~30s to wake up).';
  }

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
