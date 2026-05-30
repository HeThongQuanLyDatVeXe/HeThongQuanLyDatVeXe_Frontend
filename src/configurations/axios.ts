import axios from 'axios';
import { cookieUtils } from '../utils/cookieUtils';
import { ENV } from './env';

const API_BASE_URL = ENV.API_BASE_URL;

export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

export const bookingAxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

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

const setupInterceptors = (instance: typeof axiosInstance) => {
  // Request interceptor — attach token
  instance.interceptors.request.use(
    (config) => {
      const token = cookieUtils.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const userId = window.localStorage.getItem('user_id');
      if (userId) {
        config.headers['X-User-Id'] = userId;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor — handle token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;

      // Do not intercept 401 for auth endpoints to prevent unwanted redirects/reloads
      if (error.response?.status === 401 && original.url?.includes('/identity/auth/')) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;

        const refreshToken = cookieUtils.getRefreshToken();

        // If no refresh token is available, try retrying public GET requests
        // without the Authorization header (the stale token may cause 401 on
        // otherwise public/permitAll endpoints).
        if (!refreshToken) {
          // For GET requests, retry without auth header — the endpoint might be public
          if (original.method?.toLowerCase() === 'get' && !original._retryWithoutAuth) {
            original._retryWithoutAuth = true;
            delete original.headers.Authorization;
            cookieUtils.clearTokens();
            return instance(original);
          }
          // For non-GET requests or if the retry already failed, redirect to login
          cookieUtils.clearTokens();
          const isPublicPage = ['/', '/tuyen-duong', '/login', '/register', '/forgot-password'].some(
            p => window.location.pathname === p || window.location.pathname.startsWith('/tuyen-duong/')
          );
          if (!isPublicPage && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        // There is a refresh token — attempt to refresh
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (original.headers && typeof original.headers.set === 'function') {
                original.headers.set('Authorization', 'Bearer ' + token);
              } else {
                original.headers.Authorization = 'Bearer ' + token;
              }
              return instance(original);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;

        return new Promise(function (resolve, reject) {
          axios.post(`${API_BASE_URL}/api/v1/identity/auth/refresh-token`, { refreshToken })
            .then((res) => {
              const { accessToken, refreshToken: newRefresh } = res.data.result;
              cookieUtils.setTokens(accessToken, newRefresh);
              if (original.headers && typeof original.headers.set === 'function') {
                original.headers.set('Authorization', `Bearer ${accessToken}`);
              } else {
                original.headers.Authorization = `Bearer ${accessToken}`;
              }
              processQueue(null, accessToken);
              resolve(instance(original));
            })
            .catch((err) => {
              processQueue(err, null);
              cookieUtils.clearTokens();
              // On refresh failure, retry GET requests without auth (public endpoint fallback)
              if (original.method?.toLowerCase() === 'get' && !original._retryWithoutAuth) {
                original._retryWithoutAuth = true;
                if (original.headers && typeof original.headers.delete === 'function') {
                  original.headers.delete('Authorization');
                  original.headers.delete('authorization');
                } else {
                  delete original.headers.Authorization;
                  delete original.headers.authorization;
                }
                resolve(instance(original));
              } else {
                if (window.location.pathname !== '/login') {
                  window.location.href = '/login';
                }
                reject(err);
              }
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }

      return Promise.reject(error);
    }
  );
};

setupInterceptors(axiosInstance);
setupInterceptors(bookingAxiosInstance);