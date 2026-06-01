const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

// Accept both styles from .env: with or without "/api/v1" suffix.
const normalizedApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, '');
const apiBaseUrl = normalizedApiBaseUrl.endsWith('/api/v1')
    ? normalizedApiBaseUrl.slice(0, -'/api/v1'.length)
    : normalizedApiBaseUrl;

const googleRedirectUri =
    import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`;

export const ENV = {
    APP_NAME: import.meta.env.VITE_APP_NAME || 'DiVeNha',
    API_BASE_URL: apiBaseUrl,
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    GOOGLE_REDIRECT_URI: googleRedirectUri,
    GOOGLE_SCOPE: import.meta.env.VITE_GOOGLE_SCOPE || 'openid email profile',
} as const;


console.log('GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('ALL ENV:', import.meta.env);