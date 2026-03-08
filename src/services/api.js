import axios from 'axios'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

/* ─── Axios factory ─────────────────────────────────────────── */
const BASES = {
  user:    import.meta.env.VITE_USER_URL    || 'http://localhost:8090',
  route:   import.meta.env.VITE_ROUTE_URL   || 'http://localhost:8082',
  booking: import.meta.env.VITE_BOOKING_URL || 'http://localhost:8083',
}

function make(base) {
  const api = axios.create({ baseURL: base, timeout: 12000 })

  api.interceptors.request.use(cfg => {
    const t = useAuthStore.getState().accessToken
    if (t) cfg.headers.Authorization = `Bearer ${t}`
    return cfg
  })

  api.interceptors.response.use(
    res => res,
    async err => {
      const orig = err.config
      if (err.response?.status === 401 && !orig._retry) {
        orig._retry = true
        const refresh = useAuthStore.getState().refreshToken
        if (refresh) {
          try {
            const r = await axios.post(`${BASES.user}/api/v1/auth/refresh`, { refreshToken: refresh })
            useAuthStore.getState().setAuth(r.data)
            orig.headers.Authorization = `Bearer ${r.data.accessToken}`
            return api(orig)
          } catch {
            useAuthStore.getState().logout()
            window.location.replace('/login')
            return
          }
        }
        useAuthStore.getState().logout()
        window.location.replace('/login')
      }
      return Promise.reject(err)
    }
  )
  return api
}

export const userApi    = make(BASES.user)
export const routeApi   = make(BASES.route)
export const bookingApi = make(BASES.booking)

/* ─── Auth API ──────────────────────────────────────────────── */
export const authApi = {
  login:        d => userApi.post('/api/v1/auth/login', d),
  register:     d => userApi.post('/api/v1/auth/register', d),
  logout:       d => userApi.post('/api/v1/auth/logout', d),
  refresh:      d => userApi.post('/api/v1/auth/refresh', d),
  googleUrl:    () => userApi.get('/api/v1/auth/google'),
  googleSync:   () => userApi.post('/api/v1/auth/google/sync'),
  me:           () => userApi.get('/api/v1/users/me'),
  updateMe:     d => userApi.put('/api/v1/users/me', d),
  syncMe:       () => userApi.post('/api/v1/users/me/sync'),
}

/* ─── Route API ─────────────────────────────────────────────── */
export const routeSvc = {
  search:   p => routeApi.get('/api/v1/routes/search', { params: p }),
  popular:  () => routeApi.get('/api/v1/routes/popular'),
  byId:     id => routeApi.get(`/api/v1/routes/${id}`),
  seats:    (id, date) => routeApi.get(`/api/v1/routes/${id}/seats`, { params: { date } }),
}

/* ─── Booking API ───────────────────────────────────────────── */
export const bookingSvc = {
  create:  d  => bookingApi.post('/api/v1/bookings', d),
  mine:    () => bookingApi.get('/api/v1/bookings/my-bookings'),
  byId:    id => bookingApi.get(`/api/v1/bookings/${id}`),
  cancel:  id => bookingApi.post(`/api/v1/bookings/${id}/cancel`),
}

/* ─── Admin API ─────────────────────────────────────────────── */
export const adminApi = {
  users:    p  => userApi.get('/api/v1/admin/users', { params: p }),
  userById: id => userApi.get(`/api/v1/admin/users/${id}`),
  updateUser: (id, d) => userApi.patch(`/api/v1/admin/users/${id}`, d),
}
