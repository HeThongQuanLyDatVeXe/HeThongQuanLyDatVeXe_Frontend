import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/user-service/useAuth';
import { AdminLayout } from '../components/layouts/AdminLayout';
import { adminUserService } from '../services/user-service/adminUserService';
import type { UserResponse } from '../types/user-service/response/UserResponse';

// ─── Types ───────────────────────────────────────────────────────────────────

interface KPICard {
  label: string;
  value: string;
  icon: string;
  trend: string;
  trendUp: boolean | null; // null = stable
}

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

// ─── Status badge helper ──────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: Booking['status'] }> = ({ status }) => {
  const map = {
    success:   { label: 'Thành công', bg: '#dcfce7', color: '#15803d' },
    pending:   { label: 'Đang xử lý', bg: '#ffedd5', color: '#c2410c' },
    cancelled: { label: 'Đã hủy',     bg: '#fee2e2', color: '#b91c1c' },
  };
  const { label, bg, color } = map[status];
  return (
    <span
      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
};

// ─── Rank badge ───────────────────────────────────────────────────────────────

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const styles: Record<number, { bg: string; color: string }> = {
    1: { bg: '#1A1410', color: '#ffffff' },
    2: { bg: '#e7e5e4', color: '#1A1410' },
    3: { bg: '#f5f5f4', color: '#1A1410' },
  };
  const { bg, color } = styles[rank] ?? { bg: '#e7e5e4', color: '#1A1410' };
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
      style={{ backgroundColor: bg, color, fontFamily: 'Playfair Display, serif' }}
    >
      {rank}
    </div>
  );
};

// ─── Period toggle ────────────────────────────────────────────────────────────

type Period = 'today' | 'week' | 'month';
const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hôm nay',
  week:  'Tuần',
  month: 'Tháng',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('today');

  useEffect(() => {
    adminUserService
      .getUsers()
      .then((res) => setUsers(res.data.result ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // KPI cards derived from real user data + static operational data
  const kpiCards: KPICard[] = [
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
              className="px-4 py-1.5 rounded text-sm transition-all"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map(({ label, value, icon, trend, trendUp }) => (
          <div
            key={label}
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            style={{ border: '1px solid #E8D5C4' }}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#FFF4ED', color: '#F4600C' }}
              >
                <span className="material-symbols-outlined text-2xl">{icon}</span>
              </div>
              <div
                className="flex items-center text-xs font-bold px-2 py-1 rounded"
                style={
                  trendUp === true
                    ? { backgroundColor: '#f0fdf4', color: '#15803d' }
                    : trendUp === false
                    ? { backgroundColor: '#fef2f2', color: '#b91c1c' }
                    : { backgroundColor: '#f5f5f4', color: '#57534e' }
                }
              >
                <span className="material-symbols-outlined text-xs mr-1">
                  {trendUp === true ? 'trending_up' : trendUp === false ? 'trending_down' : 'horizontal_rule'}
                </span>
                {trend}
              </div>
            </div>
            <p className="text-stone-500 text-sm font-medium mb-1">{label}</p>
            <h3
              className="text-2xl font-semibold"
              style={{ fontFamily: 'Playfair Display, serif', color: '#1A1410' }}
            >
              {value}
            </h3>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Revenue Chart */}
        <div
          className="lg:col-span-8 bg-white p-8 rounded-3xl shadow-sm relative overflow-hidden"
          style={{ border: '1px solid #E8D5C4' }}
        >
          <div className="flex justify-between items-start mb-10">
            <div>
              <h4
                className="text-xl font-semibold"
                style={{ fontFamily: 'Playfair Display, serif', color: '#1A1410' }}
              >
                Biểu đồ Doanh thu
              </h4>
              <p className="text-stone-500 text-sm">30 ngày gần nhất (Triệu VND)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#F4600C' }} />
                <span className="text-stone-600">Năm nay</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block bg-stone-200" />
                <span className="text-stone-600">Năm ngoái</span>
              </div>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="relative h-[200px] w-full">
            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#F4600C" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#F4600C" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" x2="800" y1="50"  y2="50"  stroke="#F9F2EC" strokeWidth="1" />
              <line x1="0" x2="800" y1="100" y2="100" stroke="#F9F2EC" strokeWidth="1" />
              <line x1="0" x2="800" y1="150" y2="150" stroke="#F9F2EC" strokeWidth="1" />
              {/* Area fill */}
              <path
                d="M0,160 Q100,140 200,165 T400,120 T600,150 T800,100 L800,200 L0,200 Z"
                fill="url(#chartGradient)"
              />
              {/* Current year line */}
              <path
                d="M0,160 Q100,140 200,165 T400,120 T600,150 T800,100"
                fill="none"
                stroke="#F4600C"
                strokeWidth="2.5"
              />
              {/* Last year dashed */}
              <path
                d="M0,175 Q100,165 200,185 T400,155 T600,170 T800,145"
                fill="none"
                stroke="#E8D5C4"
                strokeWidth="2"
                strokeDasharray="5 4"
              />
            </svg>
            <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              <span>01 Tháng 10</span>
              <span>10 Tháng 10</span>
              <span>20 Tháng 10</span>
              <span>30 Tháng 10</span>
            </div>
          </div>
        </div>

        {/* Vehicle distribution donut */}
        <div
          className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-sm flex flex-col"
          style={{ border: '1px solid #E8D5C4' }}
        >
          <h4
            className="text-xl font-semibold mb-1"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1A1410' }}
          >
            Phân bổ loại xe
          </h4>
          <p className="text-stone-500 text-sm mb-6">Thị phần theo phương tiện</p>

          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Donut ring */}
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="48" fill="none" stroke="#f5f5f4" strokeWidth="16" />
                <circle
                  cx="60" cy="60" r="48" fill="none" stroke="#F4600C" strokeWidth="16"
                  strokeDasharray={`${0.58 * 301.6} ${301.6}`}
                />
                <circle
                  cx="60" cy="60" r="48" fill="none" stroke="#FFB347" strokeWidth="16"
                  strokeDasharray={`${0.32 * 301.6} ${301.6}`}
                  strokeDashoffset={`-${0.58 * 301.6}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>42</span>
                <span className="text-[9px] uppercase font-bold text-stone-400">Xe chạy</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 w-full space-y-2.5">
              {[
                { label: 'Giường nằm', pct: '58%', color: '#F4600C' },
                { label: 'Limousine',  pct: '32%', color: '#FFB347' },
                { label: 'Ghế ngồi',  pct: '10%', color: '#e7e5e4' },
              ].map(({ label, pct, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <span className="text-sm font-bold">{pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Table & Hot Routes Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-8">
        {/* Recent Bookings */}
        <div
          className="lg:col-span-6 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col"
          style={{ border: '1px solid #E8D5C4' }}
        >
          <div
            className="p-6 flex justify-between items-center"
            style={{ borderBottom: '1px solid #F9F2EC' }}
          >
            <h4
              className="text-xl font-semibold"
              style={{ fontFamily: 'Playfair Display, serif', color: '#1A1410' }}
            >
              Vé đặt gần đây
            </h4>
            <button className="text-sm font-bold hover:underline" style={{ color: '#F4600C' }}>
              Xem tất cả
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead
                className="text-[10px] uppercase font-bold tracking-wider"
                style={{ backgroundColor: '#F9F2EC', color: '#6b7280' }}
              >
                <tr>
                  <th className="px-6 py-4">Mã vé</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Tuyến đường</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody style={{ borderTop: 'none' }}>
                {RECENT_BOOKINGS.map((b) => (
                  <tr
                    key={b.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid #F9F2EC' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#fafaf9')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                  >
                    <td className="px-6 py-4 font-bold" style={{ color: '#F4600C' }}>{b.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: '#e7e5e4' }}
                        >
                          {b.customerInitials}
                        </div>
                        <span className="text-sm">{b.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">{b.route}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <StatusBadge status={b.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hot Routes */}
        <div
          className="lg:col-span-4 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col"
          style={{ border: '1px solid #E8D5C4' }}
        >
          <div className="p-6" style={{ borderBottom: '1px solid #F9F2EC' }}>
            <h4
              className="text-xl font-semibold"
              style={{ fontFamily: 'Playfair Display, serif', color: '#1A1410' }}
            >
              Tuyến hot nhất
            </h4>
          </div>
          <div className="p-6 space-y-5">
            {HOT_ROUTES.map((route) => (
              <div key={route.rank} className="flex items-center gap-4">
                <RankBadge rank={route.rank} />
                <div className="flex-1">
                  <p className="text-sm font-bold">{route.name}</p>
                  <p className="text-xs text-stone-500">{route.tripsPerWeek} chuyến/tuần</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: '#F4600C' }}>{route.fillRate}%</p>
                  <p className="text-[10px] text-stone-400 font-bold uppercase">Lấp đầy</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Activity Timeline & Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Activity Timeline */}
        <div
          className="bg-white p-8 rounded-3xl shadow-sm"
          style={{ border: '1px solid #E8D5C4' }}
        >
          <h4
            className="text-xl font-semibold mb-8"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1A1410' }}
          >
            Nhật ký hoạt động
          </h4>
          <div className="relative space-y-7">
            {/* vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-stone-100" />
            {ACTIVITY_ITEMS.map((item, i) => (
              <div key={i} className="relative pl-12">
                <div
                  className="absolute left-[13px] top-1.5 w-2.5 h-2.5 rounded-full ring-4"
                  style={{
                    backgroundColor: item.color,
                    ringColor: `${item.color}33`,
                    boxShadow: `0 0 0 4px ${item.color}22`,
                  }}
                />
                <p className="text-xs text-stone-400 mb-0.5">{item.time}</p>
                <p className="text-sm font-bold text-on-surface">{item.title}</p>
                <p className="text-sm text-stone-500">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="bg-white p-8 rounded-3xl shadow-sm"
          style={{ border: '1px solid #E8D5C4' }}
        >
          <h4
            className="text-xl font-semibold mb-8"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1A1410' }}
          >
            Thao tác nhanh
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: 'add_circle',             label: 'Thêm Chuyến' },
              { icon: 'mail',                   label: 'Gửi Thông Báo' },
              { icon: 'description',            label: 'Xuất Báo Cáo' },
              { icon: 'account_balance_wallet', label: 'Rút Tiền' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group"
                style={{ borderColor: '#F9F2EC', color: '#6b7280' }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = '#F4600C';
                  el.style.backgroundColor = '#FFF4ED';
                  el.style.color = '#F4600C';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = '#F9F2EC';
                  el.style.backgroundColor = 'transparent';
                  el.style.color = '#6b7280';
                }}
              >
                <span className="material-symbols-outlined text-3xl mb-3">{icon}</span>
                <span className="text-sm font-bold text-center leading-snug">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};