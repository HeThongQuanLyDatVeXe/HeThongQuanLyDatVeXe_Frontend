import React from 'react';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { useMyBookingsPage } from '../hooks/pages/useMyBookingsPage';

// Components
import { BookingCard } from '../components/my-bookings/BookingCard';
import { MyBookingsSidebar } from '../components/my-bookings/MyBookingsSidebar';
import { NextTripBanner } from '../components/my-bookings/NextTripBanner';

export const MyBookingsPage: React.FC = () => {
    const {
        user,
        activeTab,
        setActiveTab,
        filteredBookings,
        nextTrip,
        avatarInitials,
        handleNavigateProfile,
        TABS,
        SIDEBAR_NAV,
        MOCK_BOOKINGS,
        loading,
        showPaymentModal,
        paymentUrl,
        activeBookingForPayment,
        handlePayNow,
        handleClosePaymentModal,
        currentPage,
        setCurrentPage,
        totalPages,
        totalElements,
        bookingFilter,
        setBookingFilter,
        paymentFilter,
        setPaymentFilter
    } = useMyBookingsPage();

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            <Header />

            <main className="max-w-[1200px] mx-auto px-4 md:px-6 pt-28 pb-24 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* ── Sidebar ── */}
                <MyBookingsSidebar 
                    user={user} 
                    avatarInitials={avatarInitials} 
                    SIDEBAR_NAV={SIDEBAR_NAV} 
                />

                {/* ── Main Content ── */}
                <section className="col-span-1 md:col-span-9 flex flex-col gap-8 text-left">
                    {/* Page heading */}
                    <header className="flex flex-col gap-1">
                        <h1
                            className="text-3xl font-semibold"
                            style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-background)' }}
                        >
                            Vé của tôi
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                            Quản lý những chuyến hành trình sắp tới và đã qua của bạn.
                        </p>
                    </header>

                    {/* ── Next trip highlight banner ── */}
                    {nextTrip && (
                        <NextTripBanner 
                            nextTrip={nextTrip} 
                            handleNavigateProfile={handleNavigateProfile} 
                        />
                    )}

                    {/* ── Tab filters ── */}
                    <div
                        className="flex gap-6 border-b overflow-x-auto"
                        style={{ borderColor: 'var(--color-outline-variant)' }}
                    >
                        {TABS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className="pb-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 cursor-pointer"
                                style={
                                    activeTab === key
                                        ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontWeight: 700 }
                                        : { borderColor: 'transparent', color: 'var(--color-on-surface-variant)' }
                                }
                            >
                                {label}
                                {key !== 'all' && (
                                    <span
                                        className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                        style={{
                                            backgroundColor:
                                                activeTab === key ? 'var(--color-primary)' : 'var(--color-surface-container)',
                                            color: activeTab === key ? '#fff' : 'var(--color-on-surface-variant)',
                                        }}
                                    >
                                        {MOCK_BOOKINGS.filter((b) => b.status === key).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── Detailed Filter Options ── */}
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-start bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                        <div className="flex flex-col gap-1.5 flex-1 text-left">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Trạng thái đặt vé</span>
                            <select
                                value={bookingFilter}
                                onChange={(e) => setBookingFilter(e.target.value)}
                                className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                            >
                                <option value="ALL">Tất cả đặt vé</option>
                                <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
                                <option value="PENDING">Chờ thanh toán (PENDING)</option>
                                <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                                <option value="EXPIRED">Hết hạn (EXPIRED)</option>
                            </select>
                        </div>
                        
                        <div className="flex flex-col gap-1.5 flex-1 text-left">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Trạng thái thanh toán</span>
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                            >
                                <option value="ALL">Tất cả thanh toán</option>
                                <option value="PAID">Đã thanh toán (PAID)</option>
                                <option value="UNPAID">Chưa thanh toán (UNPAID)</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Booking cards ── */}
                    <div className="flex flex-col gap-5">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} onPayNow={handlePayNow} />
                            ))
                        ) : (
                            /* Empty state */
                            <div
                                className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed"
                                style={{ borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}
                            >
                                <span className="material-symbols-outlined text-5xl mb-3 opacity-40">
                                    confirmation_number
                                </span>
                                <p className="text-sm font-medium">Không có vé nào trong mục này.</p>
                            </div>
                        )}
                    </div>

                    {/* ── Sleek Premium Pagination ── */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-outline-variant pt-6 mt-4 flex-wrap gap-4">
                            <span className="text-xs text-on-surface-variant font-semibold">
                                Hiển thị trang {currentPage + 1} / {totalPages} (Tổng số {totalElements} vé)
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold transition-all duration-200 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    Trang trước
                                </button>
                                
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i)}
                                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                                            currentPage === i
                                                ? 'bg-[#F4600C] text-white border-[#F4600C] shadow-md shadow-orange-500/15'
                                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages - 1}
                                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold transition-all duration-200 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    Trang sau
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* PayOS Embedded Payment Modal for Pay Later */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1512]/60 backdrop-blur-md p-4 animate-fade-in animate-none">
                    <div className="bg-gradient-to-b from-white to-[#fffbfa]/95 backdrop-blur-md rounded-3xl border border-orange-100/50 shadow-[0_24px_60px_-15px_rgba(38,24,19,0.18)] max-w-[520px] w-full overflow-hidden flex flex-col relative animate-fade-in-up animate-none">
                        
                        {/* Modal Header */}
                        <div className="px-8 py-5 border-b border-orange-100/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-[#c84d04] flex items-center justify-center text-white shadow-md shadow-orange-500/10">
                                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>credit_card</span>
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-base text-[#261813] tracking-tight">Thanh toán vé xe</h3>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Cổng thanh toán bảo mật PayOS</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleClosePaymentModal}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-primary transition-all duration-200 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6 flex-grow overflow-y-auto max-h-[75vh]">
                            
                            {/* Premium Ticket Card Summary */}
                            <div className="bg-gradient-to-r from-amber-500 to-[#c84d04] rounded-2xl p-5 text-white shadow-lg shadow-orange-500/15 relative overflow-hidden text-left">
                                {/* Decorative ticket cutouts */}
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm" />
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm" />
                                
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div>
                                        <p className="text-[9px] text-white/70 uppercase tracking-widest font-semibold">Mã đặt vé</p>
                                        <p className="font-mono text-sm font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-md mt-1 backdrop-blur-xs inline-block">
                                            {activeBookingForPayment?.bookingCode}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-white/70 uppercase tracking-widest font-semibold">Hành khách</p>
                                        <p className="font-bold text-sm mt-1 truncate max-w-[160px]">{activeBookingForPayment?.customerName}</p>
                                    </div>
                                </div>
                                
                                <div className="border-t border-white/20 my-3 border-dashed relative z-10" />
                                
                                <div className="flex justify-between items-end relative z-10">
                                    <div>
                                        <p className="text-[9px] text-white/70 uppercase tracking-widest font-semibold">Hình thức</p>
                                        <div className="flex items-center gap-1.5 mt-1 bg-white/15 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-xs">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            Quét mã QR liên ngân hàng
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-white/70 uppercase tracking-widest font-semibold">Số tiền thanh toán</p>
                                        <p className="text-xl font-extrabold tracking-tight mt-0.5 text-yellow-300 drop-shadow-xs">
                                            10.000₫
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Embedded container where PayOS Checkout SDK renders the iframe */}
                            <div id="embedded-payment-container" className="relative w-full h-[400px] bg-slate-50/80 border border-slate-100 rounded-2xl overflow-hidden shadow-inner">
                                <div className="loading-spinner-wrapper absolute inset-0 bg-[#fffbfa]/95 flex flex-col items-center justify-center gap-3 text-slate-400 z-10">
                                    <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs font-medium tracking-wide">Đang kết nối cổng thanh toán PayOS...</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer with security trust badges */}
                        <div className="px-8 py-4 bg-[#fffbff]/70 border-t border-orange-100/30 flex justify-between items-center gap-3">
                            <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                Bảo mật 256-bit SSL
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        if (paymentUrl) window.location.href = paymentUrl;
                                    }}
                                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all duration-200 hover:border-slate-300 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    Mở trang mới
                                </button>
                                <button 
                                    onClick={handleClosePaymentModal}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-[#c84d04] hover:from-amber-600 hover:to-[#b04303] text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-md shadow-orange-500/10 hover:shadow-lg flex items-center gap-1 cursor-pointer"
                                >
                                    Đóng &amp; Thanh toán sau
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};
