import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/user-service/useAuth';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { ROUTES } from '../constants/routes';

// ─── Types ───────────────────────────────────────────────────────────────────

type BookingStatus = 'upcoming' | 'completed' | 'cancelled';
type TabFilter    = 'all' | BookingStatus;

interface Booking {
  id: string;
  status: BookingStatus;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  operator: string;
  seatInfo: string;
  totalPrice: string;
}

// ─── Mock data (replace with real API call later) ─────────────────────────────

const MOCK_BOOKINGS: Booking[] = [
  {
    id:            '#VN18392',
    status:        'upcoming',
    origin:        'Hà Nội',
    destination:   'TP.HCM',
    departureTime: '07:00',
    arrivalTime:   '14:30',
    date:          '21/05/2026',
    operator:      'Hải Vân Limousine',
    seatInfo:      '1 Giường nằm',
    totalPrice:    '850.000đ',
  },
  {
    id:            '#VN09211',
    status:        'completed',
    origin:        'Đà Nẵng',
    destination:   'Huế',
    departureTime: '15:00',
    arrivalTime:   '18:00',
    date:          '10/04/2026',
    operator:      'Phượng Hoàng',
    seatInfo:      '2 Ghế ngồi',
    totalPrice:    '320.000đ',
  },
  {
    id:            '#VN07743',
    status:        'cancelled',
    origin:        'TP.HCM',
    destination:   'Đà Lạt',
    departureTime: '09:00',
    arrivalTime:   '15:00',
    date:          '05/03/2026',
    operator:      'Phương Trang',
    seatInfo:      '2 Ghế ngồi',
    totalPrice:    '240.000đ',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

// Status badge config
const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; barColor: string; badgeBg: string; badgeColor: string; opacity: string }
> = {
  upcoming:  { label: 'Sắp khởi hành', barColor: '#feb246', badgeBg: '#fee3d9', badgeColor: '#5a4137',  opacity: '1' },
  completed: { label: 'Đã hoàn thành', barColor: '#A8BCA1', badgeBg: '#ffe9e2', badgeColor: '#5a4137',  opacity: '0.75' },
  cancelled: { label: 'Đã hủy',        barColor: '#ba1a1a', badgeBg: '#ffdad6', badgeColor: '#93000a', opacity: '0.65' },
};

interface BookingCardProps {
  booking: Booking;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const cfg = STATUS_CONFIG[booking.status];

  return (
    <article
      className="bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col md:flex-row overflow-hidden transition-shadow hover:shadow-[0_8px_20px_rgba(92,64,51,0.1)]"
      style={{ opacity: cfg.opacity, boxShadow: '0 2px 10px rgba(92,64,51,0.04)' }}
    >
      {/* Status bar */}
      <div className="w-2 flex-shrink-0 md:w-1.5" style={{ backgroundColor: cfg.barColor }} />

      <div className="flex-1 p-6 flex flex-col gap-4">
        {/* Top row: status badge + booking ID */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <span
            className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider"
            style={{ fontFamily: 'Cormorant Garamond, serif', backgroundColor: cfg.badgeBg, color: cfg.badgeColor }}
          >
            {cfg.label}
          </span>
          <span className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Mã vé: <span className="font-semibold">{booking.id}</span>
          </span>
        </div>

        {/* Main content row */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-5">
          {/* Route & operator */}
          <div className="flex flex-col gap-2">
            {/* Times */}
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold" style={{ color: 'var(--color-on-background)' }}>
                {booking.departureTime}
              </span>
              <div className="flex items-center gap-1 flex-1">
                <div className="h-px w-6" style={{ backgroundColor: 'var(--color-outline-variant)' }} />
                <span
                  className="material-symbols-outlined text-base"
                  style={{ color: 'var(--color-outline-variant)' }}
                >
                  arrow_forward
                </span>
              </div>
              <span className="text-lg font-bold" style={{ color: 'var(--color-on-background)' }}>
                {booking.arrivalTime}
              </span>
            </div>

            {/* Cities */}
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              <span className="font-medium">{booking.origin}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
              <span className="font-medium">{booking.destination}</span>
              <span className="mx-1 opacity-40">•</span>
              <span>{booking.date}</span>
            </div>

            {/* Operator */}
            <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              {booking.operator} &bull; {booking.seatInfo}
            </p>
          </div>

          {/* Divider (desktop) */}
          <div
            className="hidden md:block w-px h-16 border-l border-dashed"
            style={{ borderColor: 'var(--color-outline-variant)' }}
          />

          {/* Price + CTA */}
          <div
            className="flex flex-row md:flex-col justify-between items-end gap-3 border-t md:border-t-0 border-dashed pt-4 md:pt-0"
            style={{ borderColor: 'var(--color-outline-variant)' }}
          >
            <div className="flex flex-col items-start md:items-end">
              <span
                className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-on-surface-variant)' }}
              >
                Tổng tiền
              </span>
              <span
                className="text-xl font-semibold"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  color: booking.status === 'upcoming' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                }}
              >
                {booking.totalPrice}
              </span>
            </div>

            {booking.status === 'upcoming' && (
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Chi tiết
              </button>
            )}
            {booking.status === 'completed' && (
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-surface-container-high active:scale-95 border"
                style={{
                  color:        'var(--color-primary)',
                  borderColor:  'var(--color-outline-variant)',
                  backgroundColor: 'var(--color-surface-container)',
                }}
              >
                Đặt lại
              </button>
            )}
            {booking.status === 'cancelled' && (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                style={{ backgroundColor: '#ffdad6', color: '#93000a' }}
              >
                Đã hủy
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all',       label: 'Tất cả'         },
  { key: 'upcoming',  label: 'Sắp khởi hành'  },
  { key: 'completed', label: 'Đã hoàn thành'  },
  { key: 'cancelled', label: 'Đã hủy'         },
];

// ─── Sidebar nav items ────────────────────────────────────────────────────────

const SIDEBAR_NAV = [
  { label: 'Thông tin cá nhân', icon: 'person',              to: ROUTES.PROFILE },
  { label: 'Vé của tôi',        icon: 'confirmation_number', to: ROUTES.MY_BOOKINGS, active: true },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filteredBookings =
    activeTab === 'all'
      ? MOCK_BOOKINGS
      : MOCK_BOOKINGS.filter((b) => b.status === activeTab);

  // Next upcoming trip (for the highlight banner)
  const nextTrip = MOCK_BOOKINGS.find((b) => b.status === 'upcoming');

  const avatarInitials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'NT';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <Header />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 pt-28 pb-24 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col col-span-3 gap-6 sticky top-28 h-fit">
          {/* User profile card */}
          <div
            className="rounded-xl p-5 border flex items-center gap-4"
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderColor:     'var(--color-outline-variant)',
              boxShadow:       '0 8px 20px rgba(92,64,51,0.06)',
            }}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-14 h-14 rounded-full object-cover border-2"
                style={{ borderColor: 'var(--color-primary-fixed)' }}
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #F4600C 0%, #FFB347 100%)' }}
              >
                {avatarInitials}
              </div>
            )}
            <div>
              <h3
                className="text-base font-semibold leading-tight"
                style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-background)' }}
              >
                {user?.fullName ?? 'Người dùng'}
              </h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
                Thành viên
              </p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            {SIDEBAR_NAV.map(({ label, icon, to, active }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
                style={
                  active
                    ? {
                        backgroundColor: 'var(--color-surface-container)',
                        color:           'var(--color-primary)',
                        fontWeight:      700,
                        borderLeft:      '3px solid var(--color-primary)',
                      }
                    : { color: 'var(--color-on-surface-variant)' }
                }
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {icon}
                </span>
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ── */}
        <section className="col-span-1 md:col-span-9 flex flex-col gap-8">
          {/* Page heading */}
          <header className="flex flex-col gap-1">
            <h1
              className="text-3xl font-semibold"
              style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-background)' }}
            >
              Vé của tôi
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              Quản lý những chuyến hành trình sắp tới và đã qua của bạn.
            </p>
          </header>

          {/* ── Next trip highlight banner ── */}
          {nextTrip && (
            <div
              className="rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden"
              style={{
                background:  'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)',
                boxShadow:   '0 8px 30px rgba(161,59,0,0.2)',
                color:       'var(--color-on-primary)',
              }}
            >
              {/* Decorative bus icon */}
              <div className="absolute -right-8 -top-8 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[140px]">directions_bus</span>
              </div>

              <div className="flex flex-col gap-2 z-10">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{ backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}
                  >
                    Chuyến đi tiếp theo
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                    {nextTrip.date} • {nextTrip.departureTime}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xl font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {nextTrip.origin}
                  </span>
                  <span className="material-symbols-outlined text-2xl">arrow_right_alt</span>
                  <span className="text-xl font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {nextTrip.destination}
                  </span>
                </div>
                <p className="text-sm opacity-85">
                  {nextTrip.operator} &bull; {nextTrip.seatInfo}
                </p>
              </div>

              <button
                onClick={() => navigate(ROUTES.PROFILE)}
                className="z-10 w-full md:w-auto px-6 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{
                  backgroundColor: 'var(--color-surface-container-lowest)',
                  color:           'var(--color-primary)',
                  boxShadow:       '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                Xem chi tiết vé
              </button>
            </div>
          )}

          {/* ── Tab filters ── */}
          <div
            className="flex gap-6 border-b overflow-x-auto"
            style={{ borderColor: 'var(--color-outline-variant)' }}
          >
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="pb-3 text-sm font-medium whitespace-nowrap transition-all border-b-2"
                style={
                  activeTab === key
                    ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontWeight: 700 }
                    : { borderColor: 'transparent', color: 'var(--color-on-surface-variant)' }
                }
              >
                {label}
                {key !== 'all' && (
                  <span
                    className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor:
                        activeTab === key ? 'var(--color-primary)' : 'var(--color-surface-container)',
                      color: activeTab === key ? '#fff' : 'var(--color-on-surface-variant)',
                    }}
                  >
                    {MOCK_BOOKINGS.filter((b) => b.status === key).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Booking cards ── */}
          <div className="flex flex-col gap-5">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              /* Empty state */
              <div
                className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed"
                style={{ borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}
              >
                <span className="material-symbols-outlined text-5xl mb-3 opacity-40">
                  confirmation_number
                </span>
                <p className="text-sm font-medium">Không có vé nào trong mục này.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
