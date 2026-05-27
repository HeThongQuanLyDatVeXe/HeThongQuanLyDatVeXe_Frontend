import React from 'react';

interface Booking {
    id: string;
    customerInitials: string;
    customerName: string;
    route: string;
    status: 'success' | 'pending' | 'cancelled';
}

interface AdminRecentBookingsProps {
    bookings: Booking[];
}

const StatusBadge: React.FC<{ status: Booking['status'] }> = ({ status }) => {
    const map = {
        success: { label: 'Thành công', bg: '#dcfce7', color: '#15803d' },
        pending: { label: 'Đang xử lý', bg: '#ffedd5', color: '#c2410c' },
        cancelled: { label: 'Đã hủy', bg: '#fee2e2', color: '#b91c1c' },
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

export const AdminRecentBookings: React.FC<AdminRecentBookingsProps> = ({ bookings }) => {
    return (
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
                        {bookings.map((b) => (
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
    );
};
