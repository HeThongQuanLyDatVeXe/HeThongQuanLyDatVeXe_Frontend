import React from 'react';
import { AdminLayout } from '../components/layouts/AdminLayout';
import { useAdminDashboardPage, PERIOD_LABELS } from '../hooks/pages/admin/useAdminDashboardPage';
import type { Period } from '../hooks/pages/admin/useAdminDashboardPage';

// Components
import { AdminKPICards } from '../components/admin/dashboard/AdminKPICards';
import { AdminChartsRow } from '../components/admin/dashboard/AdminChartsRow';
import { AdminRecentBookings } from '../components/admin/dashboard/AdminRecentBookings';
import { AdminHotRoutes } from '../components/admin/dashboard/AdminHotRoutes';

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminDashboard: React.FC = () => {
  const {
    user,
    loading,
    period,
    setPeriod,
    kpiCards,
    recentBookings,
    hotRoutes,
    dailyRevenues,
    vehicleDistribution
  } = useAdminDashboardPage();

  return (
    <AdminLayout>
      {/* ── Period header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4">
        <div className="text-left">
          <h1
            className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Tổng quan hệ thống
          </h1>
          <p className="text-slate-500 text-sm">
            Xin chào, <strong className="text-amber-700 font-bold">{user?.fullName ?? 'Quản trị viên'}</strong>. Đây là tóm tắt vận hành hôm nay.
          </p>
        </div>
        
        {/* Period toggle tabs */}
        <div
          className="bg-white p-1 rounded-xl flex self-start sm:self-auto border border-slate-200/80 shadow-sm"
        >
          {(['today', 'week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              style={
                period === p
                  ? { backgroundColor: '#FFF4ED', color: '#F4600C' }
                  : { color: '#64748b' }
              }
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Row ── */}
      {loading && kpiCards.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200/60 p-6 animate-pulse" />
          ))}
        </div>
      ) : (
        <AdminKPICards kpiCards={kpiCards} />
      )}

      {/* ── Charts Row ── */}
      <AdminChartsRow 
        dailyRevenues={dailyRevenues} 
        vehicleDistribution={vehicleDistribution} 
        loading={loading}
      />

      {/* ── Table & Hot Routes Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-8">
        <AdminRecentBookings bookings={recentBookings} />
        <AdminHotRoutes routes={hotRoutes} />
      </div>
    </AdminLayout>
  );
};