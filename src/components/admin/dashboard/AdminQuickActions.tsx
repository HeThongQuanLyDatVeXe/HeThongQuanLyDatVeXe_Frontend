import React from 'react';

export const AdminQuickActions: React.FC = () => {
    return (
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
                    { icon: 'add_circle', label: 'Thêm Chuyến' },
                    { icon: 'mail', label: 'Gửi Thông Báo' },
                    { icon: 'description', label: 'Xuất Báo Cáo' },
                    { icon: 'account_balance_wallet', label: 'Rút Tiền' },
                ].map(({ icon, label }) => (
                    <button
                        key={label}
                        className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group cursor-pointer"
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
    );
};
