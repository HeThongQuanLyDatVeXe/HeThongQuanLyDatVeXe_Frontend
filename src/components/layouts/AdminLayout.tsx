import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/user-service/useAuth';
import { ROUTES } from '../../constants/routes';

const navItems = [
    { label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: '⊞' },
    { label: 'Người dùng', path: ROUTES.ADMIN_USERS, icon: '👥' },
    { label: 'Vai trò', path: ROUTES.ADMIN_ROLES, icon: '🔐' },
    { label: 'Quyền hạn', path: ROUTES.ADMIN_PERMISSIONS, icon: '🛡️' },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate(ROUTES.ADMIN_LOGIN);
    };

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside
                className={`flex flex-col bg-slate-900 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">D</span>
                    </div>
                    {!collapsed && (
                        <span className="text-white font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Admin
                        </span>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="ml-auto text-slate-400 hover:text-white transition-colors"
                    >
                        {collapsed ? '→' : '←'}
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    {navItems.map(({ label, path, icon }) => {
                        const active = location.pathname === path;
                        return (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg mb-1 transition-all ${active
                                        ? 'bg-amber-500 text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <span className="text-lg flex-shrink-0">{icon}</span>
                                {!collapsed && <span className="text-sm font-medium">{label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="border-t border-slate-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {user?.fullName?.[0]?.toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium truncate">{user?.fullName}</p>
                                <p className="text-slate-400 text-xs truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <button
                            onClick={handleLogout}
                            className="mt-3 w-full text-left text-xs text-slate-400 hover:text-amber-400 transition-colors"
                        >
                            Đăng xuất →
                        </button>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
};