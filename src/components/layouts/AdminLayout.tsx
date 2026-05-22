import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/user-service/useAuth';
import { ROUTES } from '../../constants/routes';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavGroup {
  label?: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

// ─── Navigation structure (matches admin.html sidebar) ───────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Tổng quan',    path: ROUTES.ADMIN_DASHBOARD, icon: 'dashboard' },
    ],
  },
  {
    label: 'Quản lý vận hành',
    items: [
      { label: 'Tuyến đường',  path: ROUTES.ADMIN_ROUTES,    icon: 'route' },
      { label: 'Thành phố',    path: ROUTES.ADMIN_CITIES,    icon: 'location_city' },
      { label: 'Điểm dừng',    path: ROUTES.ADMIN_POINTS,    icon: 'location_on' },
      { label: 'Lịch trình',   path: ROUTES.ADMIN_TRIPS,     icon: 'calendar_month' },
      { label: 'Tài xế',       path: ROUTES.ADMIN_DRIVERS,   icon: 'badge' },
      { label: 'Vé',           path: '#',                    icon: 'confirmation_number' },
      { label: 'Xe',           path: ROUTES.ADMIN_VEHICLES,  icon: 'directions_bus' },
    ],
  },
  {
    label: 'Dữ liệu & Hệ thống',
    items: [
      { label: 'Người dùng',   path: ROUTES.ADMIN_USERS,     icon: 'group' },
      { label: 'Vai trò',      path: ROUTES.ADMIN_ROLES,     icon: 'security' },
      { label: 'Quyền hạn',   path: ROUTES.ADMIN_PERMISSIONS, icon: 'shield_person' },
      { label: 'Giá vé',      path: ROUTES.ADMIN_PRICING,     icon: 'payments' },
      { label: 'Hệ thống',    path: '#',                    icon: 'settings' },
    ],
  },
];



// ─── Component ───────────────────────────────────────────────────────────────

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.ADMIN_LOGIN);
  };


  return (
    <div
      className="font-body-md text-on-surface antialiased overflow-hidden flex h-screen"
      style={{ backgroundColor: '#F9F2EC' }}
    >
      {/* Noise overlay */}
      <div className="fixed inset-0 grain-overlay z-50 pointer-events-none" />

      {/* ── Sidebar ── */}
      <aside
        className="w-[260px] flex flex-col flex-shrink-0 h-full z-40 custom-scrollbar"
        style={{ backgroundColor: '#1A1410' }}
      >
        {/* Brand */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="italic text-2xl font-semibold"
              style={{ fontFamily: 'Playfair Display, serif', color: '#F4600C' }}
            >
              Đi Về Nhà
            </span>
          </div>
          <span
            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border"
            style={{
              backgroundColor: 'rgba(244,96,12,0.2)',
              color: '#F4600C',
              borderColor: 'rgba(244,96,12,0.3)',
            }}
          >
            Admin Panel
          </span>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 px-4 space-y-6 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#44372F #1A1410' }}
        >
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="px-4 mb-2 text-xs font-bold uppercase tracking-widest"
                   style={{ color: '#6B6060' }}>
                  {group.label}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.label} className="relative">
                      {isActive && (
                        <div
                          className="absolute left-[-16px] top-0 bottom-0 w-1 rounded-r"
                          style={{ backgroundColor: '#F4600C' }}
                        />
                      )}
                      <Link
                        to={item.path}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                        style={
                          isActive
                            ? {
                                background: 'linear-gradient(to right, rgba(244,96,12,0.2), transparent)',
                                color: '#F4600C',
                                fontWeight: 600,
                              }
                            : { color: '#A8978F' }
                        }
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
                            (e.currentTarget as HTMLElement).style.color = '#ffffff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = '#A8978F';
                          }
                        }}
                      >
                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Home button + Logout ── */}
        <div className="p-4 border-t" style={{ borderColor: '#2D2420' }}>
          {/* Go to Homepage — prominent CTA */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2 font-semibold transition-all group"
            style={{
              background: 'linear-gradient(135deg, #F4600C 0%, #c84d04 100%)',
              color: '#ffffff',
            }}
          >
            <span className="material-symbols-outlined text-xl">home</span>
            <span>Trang Chủ</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
            style={{ color: '#A8978F' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#A8978F';
            }}
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 overflow-y-auto p-8" style={{ scrollbarWidth: 'thin', scrollbarColor: '#44372F #F9F2EC' }}>
        {children}
      </div>

      {/* Floating support button */}
      <button
        className="fixed bottom-8 right-8 w-14 h-14 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-[60]"
        style={{ backgroundColor: '#1A1410' }}
        title="Hỗ trợ"
      >
        <span className="material-symbols-outlined">support_agent</span>
      </button>
    </div>
  );
};