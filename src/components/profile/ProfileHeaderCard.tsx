import React from 'react';
import type { UserResponse } from '../../types/user-service/response/UserResponse';

interface ProfileHeaderCardProps {
    user: UserResponse | null;
    avatarInitial: string;
    isAdmin?: boolean;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({ user, avatarInitial, isAdmin }) => {
    return (
        <div
            className="rounded-xl p-8 relative overflow-hidden"
            style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                border:          '1px solid var(--color-outline-variant)',
                boxShadow:       '0 8px 20px rgba(92,64,51,0.08)',
            }}
        >
            {/* Decorative circle */}
            <div
                className="absolute top-0 right-0 w-56 h-56 rounded-full -translate-y-1/2 translate-x-1/2"
                style={{ backgroundColor: 'rgba(161,59,0,0.05)' }}
            />

            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                {/* Avatar */}
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 overflow-hidden"
                    style={{
                        backgroundColor: 'var(--color-secondary-container)',
                        color:           'var(--color-on-secondary-container)',
                        fontFamily:      'Playfair Display, serif',
                    }}
                >
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        avatarInitial
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                    <h1
                        className="text-2xl font-semibold mb-1"
                        style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-surface)' }}
                    >
                        {user?.fullName ?? '—'}
                    </h1>
                    <p className="text-sm mb-3" style={{ color: 'var(--color-on-surface-variant)' }}>
                        {user?.email}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {/* Active status */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Hoạt động
                        </span>

                        {/* Email verified */}
                        {user?.isEmailVerified && (
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                                ✓ Email đã xác minh
                            </span>
                        )}

                        {/* Roles */}
                        {user?.roles?.map((r) => (
                            <span
                                key={r.id}
                                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                style={{
                                    backgroundColor: 'var(--color-secondary-fixed)',
                                    color:           'var(--color-on-secondary-fixed)',
                                }}
                            >
                                {r.name}
                            </span>
                        ))}

                        {/* Admin badge prominence */}
                        {isAdmin && (
                            <span
                                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                style={{ backgroundColor: '#F4600C', color: '#ffffff' }}
                            >
                                ⚡ Admin
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
