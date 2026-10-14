import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const LIVE_BACKEND_URL = 'https://healthmitra-backend-mu58.onrender.com';
const DEAD_LEGACY_HOST = 'healthmitra-api.onrender.com';

/**
 * Resolve the optimal base URL for API requests.
 * On Render (healthmitra-dsgg.onrender.com), nginx proxies /api directly to the live backend.
 * Using same-origin relative URLs ('') eliminates CORS preflight overhead, cross-origin network
 * blocks, and prevents dead-domain hardcoding.
 */
export function resolveBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // When hosted on Render, route through local nginx proxy
    if (hostname.includes('onrender.com')) {
      return '';
    }
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const envUrl = process.env.REACT_APP_API_URL?.trim();
      if (envUrl && !envUrl.includes(DEAD_LEGACY_HOST)) {
        return envUrl.endsWith('/api') ? envUrl.slice(0, -4) : envUrl.replace(/\/$/, '');
      }
      return 'http://localhost:8000';
    }
  }

  // Build time / fallback
  const rawEnv = process.env.REACT_APP_API_URL?.trim();
  if (rawEnv && !rawEnv.includes(DEAD_LEGACY_HOST)) {
    return rawEnv.endsWith('/api') ? rawEnv.slice(0, -4) : rawEnv.replace(/\/$/, '');
  }

  return LIVE_BACKEND_URL;
}

const cleanBaseUrl = resolveBackendUrl();

export const api = axios.create({
  baseURL: cleanBaseUrl,
  timeout: 30000,
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

// Automatic dual-redundancy failover:
// If request fails due to network error, automatically retry on the alternate endpoint.
interface FailoverConfig extends InternalAxiosRequestConfig {
  _retriedWithFailover?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as FailoverConfig | undefined;
    const isNetworkError = (!error.response && error.isAxiosError) || error.code === 'ECONNABORTED';

    if (config && isNetworkError && !config._retriedWithFailover) {
      config._retriedWithFailover = true;
      // If we used relative URL (''), failover directly to the live backend URL
      if (!config.baseURL || config.baseURL === '') {
        config.baseURL = LIVE_BACKEND_URL;
        return axios(config);
      }
      // If we used live backend URL and failed while in the browser on onrender.com, failover to relative proxy ('')
      if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com') && config.baseURL.includes(LIVE_BACKEND_URL)) {
        config.baseURL = '';
        return axios(config);
      }
    }
    return Promise.reject(error);
  }
);
