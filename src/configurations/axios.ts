import axios from 'axios';
import { cookieUtils } from '../utils/cookieUtils';
import { ENV } from './env';

const API_BASE_URL = ENV.API_BASE_URL;

export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor — attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = cookieUtils.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Response interceptor — handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = 'Bearer ' + token;
            return axiosInstance(original);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = cookieUtils.getRefreshToken();

      if (refreshToken) {
        return new Promise(function(resolve, reject) {
          axios.post(`${API_BASE_URL}/api/v1/identity/auth/refresh-token`, { refreshToken })
            .then((res) => {
              const { accessToken, refreshToken: newRefresh } = res.data.result;
              cookieUtils.setTokens(accessToken, newRefresh);
              original.headers.Authorization = `Bearer ${accessToken}`;
              processQueue(null, accessToken);
              resolve(axiosInstance(original));
            })
            .catch((err) => {
              processQueue(err, null);
              cookieUtils.clearTokens();
              window.location.href = '/login';
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      } else {
        cookieUtils.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);