import React from 'react';
import { AdminLayout } from '../components/layouts/AdminLayout';
import { useAdminDashboardPage, PERIOD_LABELS } from '../hooks/pages/admin/useAdminDashboardPage';
import type { Period } from '../hooks/pages/admin/useAdminDashboardPage';

// Components
import { AdminKPICards } from '../components/admin/dashboard/AdminKPICards';
import { AdminChartsRow } from '../components/admin/dashboard/AdminChartsRow';
import { AdminRecentBookings } from '../components/admin/dashboard/AdminRecentBookings';
import { AdminHotRoutes } from '../components/admin/dashboard/AdminHotRoutes';
import { AdminSystemActivity } from '../components/admin/dashboard/AdminSystemActivity';
import { AdminQuickActions } from '../components/admin/dashboard/AdminQuickActions';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  customerInitials: string;
  customerName: string;
  route: string;
  status: 'success' | 'pending' | 'cancelled';
}

interface HotRoute {
  rank: number;
  name: string;
  tripsPerWeek: number;
  fillRate: number;
}

interface ActivityItem {
  time: string;
  title: string;
  subtitle: string;
  color: string;
}

// ─── Static demo data (replace with real API data as needed) ─────────────────

const RECENT_BOOKINGS: Booking[] = [
  { id: '#VN-2940', customerInitials: 'TA', customerName: 'Trần Anh',  route: 'Sài Gòn - Đà Lạt', status: 'success' },
  { id: '#VN-2941', customerInitials: 'MH', customerName: 'Minh Huy',  route: 'Hà Nội - Sapa',    status: 'pending' },
  { id: '#VN-2942', customerInitials: 'LN', customerName: 'Linh Nga',  route: 'Đà Nẵng - Huế',    status: 'cancelled' },
];

const HOT_ROUTES: HotRoute[] = [
  { rank: 1, name: 'Sài Gòn → Đà Lạt',      tripsPerWeek: 85,  fillRate: 94 },
  { rank: 2, name: 'Hà Nội → Hải Phòng',    tripsPerWeek: 62,  fillRate: 88 },
  { rank: 3, name: 'Đà Nẵng → Hội An',      tripsPerWeek: 120, fillRate: 82 },
];

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    time:     '10:45 SA',
    title:    'Cập nhật lịch trình tuyến Hà Nội - Sapa',
    subtitle: 'Bởi quản trị viên Minh Hoàng',
    color:    '#F4600C',
  },
  {
    time:     '09:30 SA',
    title:    'Hoàn tất đối soát doanh thu tháng 9',
    subtitle: 'Hệ thống tự động thực hiện',
    color:    '#22c55e',
  },
  {
    time:     '08:15 SA',
    title:    'Cảnh báo: Xe 29B-123.45 trễ chuyến',
    subtitle: 'Tuyến Sài Gòn - Vũng Tàu',
    color:    '#f87171',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminDashboard: React.FC = () => {
  const {
    user,
    users,
    loading,
    period,
    setPeriod
  } = useAdminDashboardPage();

  // KPI cards derived from real user data + static operational data
  const kpiCards = [
    {
      label:   'Doanh thu ngày',
      value:   '158.420k',
      icon:    'payments',
      trend:   '12.5%',
      trendUp: true,
    },
    {
      label:   'Vé đã bán',
      value:   '1,248',
      icon:    'confirmation_number',
      trend:   '8.2%',
      trendUp: true,
    },
    {
      label:   'Chuyến đang chạy',
      value:   '42',
      icon:    'local_shipping',
      trend:   'Ổn định',
      trendUp: null,
    },
    {
      label:   'Người dùng',
      value:   loading ? '...' : String(users.length),
      icon:    'group',
      trend:   `${users.filter((u) => u.status === 'ACTIVE').length} hoạt động`,
      trendUp: true,
    },
  ];

  return (
    <AdminLayout>
      {/* ── Period header ── */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1
            className="text-3xl mb-1"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1A1410' }}
          >
            Tổng quan hệ thống
          </h1>
          <p className="text-stone-500">
            Xin chào, {user?.fullName ?? 'Admin'}. Đây là tóm tắt vận hành hôm nay.
          </p>
        </div>
        <div
          className="bg-white p-1 rounded-lg flex"
          style={{ border: '1px solid #E8D5C4' }}
        >
          {(['today', 'week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-1.5 rounded text-sm transition-all cursor-pointer"
              style={
                period === p
                  ? { backgroundColor: '#FFF4ED', color: '#F4600C', fontWeight: 600 }
                  : { color: '#6b7280' }
              }
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Row ── */}
      <AdminKPICards kpiCards={kpiCards} />

      {/* ── Charts Row ── */}
      <AdminChartsRow />

      {/* ── Table & Hot Routes Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-8">
        <AdminRecentBookings bookings={RECENT_BOOKINGS} />
        <AdminHotRoutes routes={HOT_ROUTES} />
      </div>

      {/* ── Activity Timeline & Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <AdminSystemActivity activities={ACTIVITY_ITEMS} />
        <AdminQuickActions />
      </div>
    </AdminLayout>
  );
};