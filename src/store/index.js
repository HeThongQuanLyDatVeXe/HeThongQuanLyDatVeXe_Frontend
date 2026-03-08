import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ─── Auth Store ────────────────────────────────────────────── */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,

      setAuth: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      updateUser: (patch) =>
        set(s => ({ user: { ...s.user, ...patch } })),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),

      getToken: () => get().accessToken,
    }),
    {
      name: 'dv-auth',
      partialize: s => ({
        user: s.user, accessToken: s.accessToken,
        refreshToken: s.refreshToken, isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)

/* ─── Booking Store ─────────────────────────────────────────── */
export const useBookingStore = create((set, get) => ({
  searchParams:  null,
  selectedRoute: null,
  selectedSeats: [],

  setSearch:  (p) => set({ searchParams: p }),
  setRoute:   (r) => set({ selectedRoute: r, selectedSeats: [] }),

  toggleSeat: (seat) => set(s => {
    const exists = s.selectedSeats.find(x => x.id === seat.id)
    return { selectedSeats: exists ? s.selectedSeats.filter(x => x.id !== seat.id) : [...s.selectedSeats, seat] }
  }),

  clearSeats: () => set({ selectedSeats: [] }),
  totalPrice: () => {
    const { selectedRoute, selectedSeats } = get()
    return selectedRoute ? selectedSeats.length * selectedRoute.price : 0
  },
  reset: () => set({ selectedRoute: null, selectedSeats: [] }),
}))
