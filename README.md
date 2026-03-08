# DiVeNha Frontend

React + Vite frontend cho hệ thống đặt vé xe khách microservice.

## Tech Stack

| Thư viện          | Mục đích                          |
|-------------------|-----------------------------------|
| React 18          | UI framework                      |
| Vite              | Build tool                        |
| Tailwind CSS      | Utility CSS                       |
| Material UI v6    | Component library                 |
| Framer Motion     | Animations                        |
| Zustand           | State management                  |
| TanStack Query v5 | Server state / caching            |
| React Hook Form   | Form management                   |
| Yup               | Schema validation                 |
| Axios             | HTTP client (auto token refresh)  |
| React Hot Toast   | Notifications                     |
| Lucide React      | Icons                             |

## Cài đặt

```bash
# 1. Cài dependencies
npm install

# 2. Copy env
cp .env.example .env.local
# Sửa các URL cho đúng với backend của bạn

# 3. Chạy dev server
npm run dev
```

## Cấu trúc

```
src/
├── pages/
│   ├── home/         # HomePage
│   ├── auth/         # Login, Register, Profile, GoogleCallback
│   ├── booking/      # Search, Seats, Confirm, MyTickets
│   └── admin/        # AdminDashboard
├── components/
│   └── layout/       # MainLayout (Navbar + Footer)
├── store/            # Zustand (auth + booking state)
├── services/         # API layer với auto token refresh
└── index.css         # Global styles + component classes
```

## Tích hợp với Backend

Sửa file `.env.local`:

```
VITE_USER_URL=http://localhost:8090       # User Service
VITE_ROUTE_URL=http://localhost:8082      # Route Service
VITE_BOOKING_URL=http://localhost:8083    # Booking Service
VITE_KEYCLOAK_URL=http://localhost:9098   # Keycloak
VITE_KEYCLOAK_REALM=micro-services
VITE_KEYCLOAK_CLIENT=micro-services-api
```

## Google Login

Thêm vào Keycloak Admin → Clients → `micro-services-api` → Valid redirect URIs:
```
http://localhost:3000/auth/google/callback
```

## Build production

```bash
npm run build
```
