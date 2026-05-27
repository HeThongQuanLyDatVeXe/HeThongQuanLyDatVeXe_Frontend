import React from 'react';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { useBookingPage } from '../hooks/pages/useBookingPage';

// Components
import { BookingPassengerInfo } from '../components/booking/BookingPassengerInfo';
import { BookingSeatDetails } from '../components/booking/BookingSeatDetails';
import { BookingPaymentMethods } from '../components/booking/BookingPaymentMethods';
import { BookingSummary } from '../components/booking/BookingSummary';

export const BookingPage: React.FC = () => {
    const {
        state,
        user,
        isAuthenticated,
        fullName,
        setFullName,
        phone,
        setPhone,
        email,
        setEmail,
        notes,
        setNotes,
        paymentMethod,
        setPaymentMethod,
        promoCode,
        setPromoCode,
        discount,
        promoMsg,
        errors,
        processing,
        agreedTerms,
        setAgreedTerms,
        finalTotal,
        paymentOptions,
        handleApplyPromo,
        handleSubmit,
        handleNavigateRoutes,
        handleNavigateLogin
    } = useBookingPage();

    // ── Guards ──
    if (!state?.trip || !state?.selectedSeats?.length) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <span className="material-symbols-outlined text-6xl text-outline">error_outline</span>
                <h2 className="text-xl font-bold text-on-surface">Không có thông tin đặt vé</h2>
                <p className="text-on-surface-variant">Vui lòng quay lại chọn chuyến và ghế trước.</p>
                <button onClick={handleNavigateRoutes} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-xl cursor-pointer">Quay lại tuyến đường</button>
            </div>
        );
    }

    const { trip, selectedSeats, seatDetails, totalAmount } = state;

    // ── Helpers ──
    const fmtPrice = (n: number) => n > 0 ? `${n.toLocaleString('vi-VN')}đ` : '0đ';
    const fmtTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

    return (
        <div className="min-h-screen bg-background text-on-background font-body-md antialiased relative flex flex-col">
            <Header />
            <div className="grain-overlay" />

            <main className="flex-grow pt-[104px] pb-xl px-8 max-w-[1200px] mx-auto w-full relative z-10">
                {/* Breadcrumb */}
                <div className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant">
                    <button onClick={handleNavigateRoutes} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none">Tuyến đường</button>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-on-surface font-semibold">Đặt vé</span>
                </div>

                {/* Auth Banner */}
                {!isAuthenticated && (
                    <div className="mb-8 bg-gradient-to-r from-[#FFF4ED] to-[#FFEADB] border border-[#F4600C]/20 rounded-xl p-5 flex items-center gap-4">
                        <span className="material-symbols-outlined text-primary text-[32px]">login</span>
                        <div className="flex-1">
                            <p className="font-semibold text-on-surface">Bạn chưa đăng nhập</p>
                            <p className="text-sm text-on-surface-variant">Đăng nhập để tự động điền thông tin và quản lý vé dễ dàng hơn.</p>
                        </div>
                        <button onClick={handleNavigateLogin} className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-[#c84d04] transition-colors cursor-pointer">
                            Đăng nhập
                        </button>
                    </div>
                )}

                {isAuthenticated && (
                    <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                        </div>
                        <div>
                            <p className="font-semibold text-green-800">Xin chào, {user?.fullName}</p>
                            <p className="text-sm text-green-600">Thông tin của bạn đã được tự động điền bên dưới.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-7 space-y-8">

                            {/* ── Step 1: Passenger Info ── */}
                            <BookingPassengerInfo
                                fullName={fullName} setFullName={setFullName}
                                phone={phone} setPhone={setPhone}
                                email={email} setEmail={setEmail}
                                notes={notes} setNotes={setNotes}
                                errors={errors}
                                isAuthenticated={isAuthenticated} user={user}
                            />

                            {/* ── Step 2: Seat Details ── */}
                            <BookingSeatDetails
                                seatDetails={seatDetails}
                                selectedSeats={selectedSeats}
                                totalAmount={totalAmount}
                                fmtPrice={fmtPrice}
                            />

                            {/* ── Step 3: Payment ── */}
                            <BookingPaymentMethods
                                paymentOptions={paymentOptions}
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                            />
                        </div>

                        {/* RIGHT COLUMN — Sticky summary */}
                        <BookingSummary
                            trip={trip}
                            selectedSeats={selectedSeats}
                            promoCode={promoCode} setPromoCode={setPromoCode}
                            handleApplyPromo={handleApplyPromo}
                            promoMsg={promoMsg}
                            totalAmount={totalAmount}
                            discount={discount}
                            finalTotal={finalTotal}
                            agreedTerms={agreedTerms} setAgreedTerms={setAgreedTerms}
                            errors={errors}
                            processing={processing}
                            fmtPrice={fmtPrice}
                            fmtTime={fmtTime}
                            fmtDate={fmtDate}
                        />
                    </div>
                </form>
            </main>
            <Footer />
        </div>
    );
};
