import React from 'react';
import { Link } from 'react-router-dom';

interface MyBookingsSidebarProps {
    user: any;
    avatarInitials: string;
    SIDEBAR_NAV: { label: string; icon: string; to: string; active?: boolean }[];
}

export const MyBookingsSidebar: React.FC<MyBookingsSidebarProps> = ({ user, avatarInitials, SIDEBAR_NAV }) => {
    return (
        <aside className="hidden md:flex flex-col col-span-3 gap-6 sticky top-28 h-fit">
            {/* User profile card */}
            <div
                className="rounded-xl p-5 border flex items-center gap-4"
                style={{
                    backgroundColor: 'var(--color-surface-container-lowest)',
                    borderColor: 'var(--color-outline-variant)',
                    boxShadow: '0 8px 20px rgba(92,64,51,0.06)',
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
                                    color: 'var(--color-primary)',
                                    fontWeight: 700,
                                    borderLeft: '3px solid var(--color-primary)',
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
    );
};
