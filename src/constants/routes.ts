export const ROUTES = {

  HOME: '/',
  ROUTES: '/tuyen-duong',
  TRIP_DETAIL: '/tuyen-duong/:id',
  SEAT_SELECTION: '/tuyen-duong/:id/chon-ghe',
  CHECKOUT: '/tuyen-duong/:id/thanh-toan',
  BOOKING_SUCCESSFUL: '/tuyen-duong/:id/dat-cho-thanh-cong',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
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
  ADMIN_ROUTES: '/admin/routes',
  ADMIN_CITIES: '/admin/cities',
  ADMIN_POINTS: '/admin/points',
  ADMIN_VEHICLES: '/admin/vehicles',
  ADMIN_TRIPS: '/admin/trips',
  ADMIN_DRIVERS: '/admin/drivers',
  ADMIN_PRICING: '/admin/pricing',
} as const;