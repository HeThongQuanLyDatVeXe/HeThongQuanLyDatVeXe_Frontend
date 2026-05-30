import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Booking } from '../../hooks/pages/useMyBookingsPage';
import { STATUS_CONFIG } from '../../hooks/pages/useMyBookingsPage';

interface BookingCardProps {
    booking: Booking;
    onPayNow?: (bookingCode: string) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onPayNow }) => {
    const cfg = STATUS_CONFIG[booking.status];
    const navigate = useNavigate();

    return (
        <article
            className="bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col md:flex-row overflow-hidden transition-shadow hover:shadow-[0_8px_20px_rgba(92,64,51,0.1)] text-left"
            style={{ opacity: cfg.opacity, boxShadow: '0 2px 10px rgba(92,64,51,0.04)' }}
        >
            {/* Status bar */}
            <div className="w-2 flex-shrink-0 md:w-1.5" style={{ backgroundColor: cfg.barColor }} />

            <div className="flex-1 p-6 flex flex-col gap-4">
                {/* Top row: status badge + booking ID */}
                <div className="flex justify-between items-center flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span
                            className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider"
                            style={{ fontFamily: 'Cormorant Garamond, serif', backgroundColor: cfg.badgeBg, color: cfg.badgeColor }}
                        >
                            {cfg.label}
                        </span>

                        {booking.rawPaymentStatus === 'PAID' ? (
                            <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                                Đã thanh toán
                            </span>
                        ) : booking.rawPaymentStatus === 'UNPAID' ? (
                            <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
                                Chưa thanh toán
                            </span>
                        ) : null}
                    </div>
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
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/my-bookings/${booking.id}/change-cancel`)}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer whitespace-nowrap border-none"
                                    style={{ backgroundColor: 'var(--color-primary)' }}
                                >
                                    Tra cứu / Hủy đổi
                                </button>
                                
                                {booking.rawBookingStatus === 'PENDING' && booking.rawPaymentStatus === 'UNPAID' && onPayNow && (
                                    <button
                                        onClick={() => onPayNow(booking.id)}
                                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-[#c84d04] hover:from-amber-600 hover:to-[#b04303] transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-md shadow-orange-500/10 whitespace-nowrap border-none"
                                    >
                                        Thanh toán ngay
                                    </button>
                                )}
                            </div>
                        )}
                        {booking.status === 'completed' && (
                            <button
                                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-surface-container-high active:scale-95 border"
                                style={{
                                    color: 'var(--color-primary)',
                                    borderColor: 'var(--color-outline-variant)',
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
