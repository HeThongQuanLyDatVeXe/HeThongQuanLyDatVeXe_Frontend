export const ROUTES = {

  HOME: '/',
  ROUTES: '/tuyen-duong',
  TRIP_DETAIL: '/tuyen-duong/:id',
  SEAT_SELECTION: '/tuyen-duong/:id/chon-ghe',
  CHECKOUT: '/tuyen-duong/:id/thanh-toan',
  BOOKING_SUCCESSFUL: '/tuyen-duong/:id/dat-cho-thanh-cong',
  LOGIN: '/login',
  REGISTER: '/register',
  GOOGLE_CALLBACK: '/auth/google/callback',
  VERIFY_EMAIL: '/verify-email',


  PROFILE: '/profile',
  CHANGE_PASSWORD: '/profile/change-password',
  MY_BOOKINGS: '/my-bookings',

  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_PERMISSIONS: '/admin/permissions',
} as const;