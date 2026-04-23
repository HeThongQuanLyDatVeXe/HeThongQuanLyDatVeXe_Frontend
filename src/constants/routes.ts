export const ROUTES = {

  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  GOOGLE_CALLBACK: '/auth/google/callback',
  VERIFY_EMAIL: '/verify-email',


  PROFILE: '/profile',
  CHANGE_PASSWORD: '/profile/change-password',

  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_PERMISSIONS: '/admin/permissions',
} as const;