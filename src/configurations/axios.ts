import axios from 'axios';
import { cookieUtils } from '../utils/cookieUtils';
import { ENV } from './env';

const API_BASE_URL = ENV.API_BASE_URL;

export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
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

// Response interceptor — handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = cookieUtils.getRefreshToken();

      if (refreshToken) {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/api/v1/identity/auth/refresh-token`,
            { refreshToken }
          );
          const { accessToken, refreshToken: newRefresh } = res.data.result;
          cookieUtils.setTokens(accessToken, newRefresh);
          original.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(original);
        } catch {
          cookieUtils.clearTokens();
          window.location.href = '/login';
        }
      } else {
        cookieUtils.clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);