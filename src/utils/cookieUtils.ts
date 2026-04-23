const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const cookieUtils = {
  set(name: string, value: string, days = 7): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
  },

  get(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  },

  remove(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  },

  setTokens(accessToken: string, refreshToken: string): void {
    cookieUtils.set(ACCESS_TOKEN_KEY, accessToken, 1);
    cookieUtils.set(REFRESH_TOKEN_KEY, refreshToken, 7);
  },

  getAccessToken(): string | null {
    return cookieUtils.get(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return cookieUtils.get(REFRESH_TOKEN_KEY);
  },

  clearTokens(): void {
    cookieUtils.remove(ACCESS_TOKEN_KEY);
    cookieUtils.remove(REFRESH_TOKEN_KEY);
  },
};