import React from 'react';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { useCheckoutPage } from '../hooks/pages/useCheckoutPage';

// Components
import { PassengerForm } from '../components/checkout/PassengerForm';
import { PaymentMethods } from '../components/checkout/PaymentMethods';
import { CheckoutSummary } from '../components/checkout/CheckoutSummary';

export const CheckoutPage: React.FC = () => {
    const {
        navigate,
        passedState,
        currentTrip,
        selectedSeats,
        baseTotal,
        fullName,
        setFullName,
        phoneNumber,
        setPhoneNumber,
        email,
        setEmail,
        notes,
        setNotes,
        paymentMethod,
        setPaymentMethod,
        formErrors,
        promoInput,
        setPromoInput,
        appliedDiscount,
        promoMessage,
        isProcessing,
        handleApplyPromo,
        handleCreateBooking,
        handleProcessPayment,
        handleResetToStep1,
        handleNavigateRoutes,
        paymentUrl,
        createdBooking,
        paymentError,
        activeStep
    } = useCheckoutPage();

    if (!passedState?.currentTrip || !passedState?.selectedSeats?.length) {
        // No valid state: redirect back
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <span className="material-symbols-outlined text-6xl text-outline">error_outline</span>
                <h2 className="text-xl font-bold text-on-surface">Không có thông tin đặt vé</h2>
                <p className="text-on-surface-variant">Vui lòng quay lại chọn chuyến và ghế trước.</p>
                <button onClick={handleNavigateRoutes} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-xl cursor-pointer">
                    Quay lại tuyến đường
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-on-background font-body-md antialiased relative flex flex-col pb-16">
            {/* Standard Header Layout */}
            <Header />

            {/* Grain Overlay */}
            <div className="grain-overlay" />

            {/* Main Content */}
            <main className="flex-grow pt-[104px] pb-xl px-4 md:px-8 max-w-[1200px] mx-auto w-full relative z-10">
                
                {/* Visual Premium Stepper Header */}
                <div className="max-w-[760px] mx-auto w-full mb-12 px-4 relative">
                    <div className="flex items-center justify-between relative">
                        {/* Stepper Progress Bar Background */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
                        {/* Stepper Progress Bar Active Highlight */}
                        <div 
                            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-[#c84d04] -translate-y-1/2 z-0 transition-all duration-500 ease-out rounded-full" 
                            style={{ width: activeStep === 1 ? '0%' : activeStep === 2 ? '50%' : '100%' }}
                        />

                        {/* Step 1 */}
                        <div className="flex flex-col items-center relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                                activeStep >= 1 ? 'bg-gradient-to-tr from-amber-500 to-[#c84d04] text-white shadow-md shadow-orange-500/20' : 'bg-white border-2 border-slate-200 text-slate-400'
                            }`}>
                                {activeStep > 1 ? (
                                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                                ) : '1'}
                            </div>
                            <span className={`text-[10px] md:text-[11px] font-extrabold mt-2 tracking-wide uppercase ${activeStep >= 1 ? 'text-[#261813]' : 'text-slate-400'}`}>Thông tin khách hàng</span>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                                activeStep >= 2 ? 'bg-gradient-to-tr from-amber-500 to-[#c84d04] text-white shadow-md shadow-orange-500/20' : 'bg-white border-2 border-slate-200 text-slate-400'
                            }`}>
                                {activeStep > 2 ? (
                                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                                ) : '2'}
                            </div>
                            <span className={`text-[10px] md:text-[11px] font-extrabold mt-2 tracking-wide uppercase ${activeStep >= 2 ? 'text-[#261813]' : 'text-slate-400'}`}>Thanh toán vé xe</span>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                                activeStep >= 3 ? 'bg-gradient-to-tr from-amber-500 to-[#c84d04] text-white shadow-md shadow-orange-500/20' : 'bg-white border-2 border-slate-200 text-slate-400'
                            }`}>
                                {activeStep > 3 ? (
                                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                                ) : '3'}
                            </div>
                            <span className={`text-[10px] md:text-[11px] font-extrabold mt-2 tracking-wide uppercase ${activeStep >= 3 ? 'text-[#261813]' : 'text-slate-400'}`}>Hoàn tất đặt vé</span>
                        </div>
                    </div>
                </div>

                {/* Conditional Wizard View Render */}
                
                {activeStep === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left animate-fade-in">
                        {/* LEFT COLUMN: Passenger details form */}
                        <div className="lg:col-span-8 space-y-12">
                            <PassengerForm
                                fullName={fullName}
                                setFullName={setFullName}
                                phoneNumber={phoneNumber}
                                setPhoneNumber={setPhoneNumber}
                                email={email}
                                setEmail={setEmail}
                                notes={notes}
                                setNotes={setNotes}
                                formErrors={formErrors}
                            />
                        </div>

                        {/* RIGHT COLUMN: Sticky summary panel */}
                        <div className="lg:col-span-4 relative">
                            <CheckoutSummary
                                currentTrip={currentTrip}
                                selectedSeats={selectedSeats}
                                baseTotal={baseTotal}
                                promoInput={promoInput}
                                setPromoInput={setPromoInput}
                                handleApplyPromo={handleApplyPromo}
                                promoMessage={promoMessage}
                                appliedDiscount={appliedDiscount}
                                handleCheckout={handleCreateBooking}
                                isProcessing={isProcessing}
                                buttonText="Đặt vé & Tiếp tục"
                            />
                        </div>
                    </div>
                )}

                {activeStep === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left animate-fade-in">
                        {/* LEFT COLUMN: Passenger Details Review Card & Payment selection/QR */}
                        <div className="lg:col-span-8 space-y-8">
                            
                            {/* Premium Booking Details Card */}
                            <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_rgba(92,64,51,0.06)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                                
                                <div className="flex justify-between items-center mb-6 pb-6 border-b border-outline-variant">
                                    <div>
                                        <span className="text-[10px] text-slate-400 tracking-widest font-extrabold uppercase">Mã đặt vé của bạn</span>
                                        <h4 className="text-xl md:text-2xl font-extrabold text-[#F4600C] tracking-wide mt-1 font-mono">
                                            {createdBooking?.bookingCode}
                                        </h4>
                                    </div>
                                    <button 
                                        onClick={handleResetToStep1}
                                        className="text-xs font-bold text-slate-500 hover:text-red-500 transition-all duration-200 flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-red-200 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-sm">restart_alt</span>
                                        Hủy & Tạo mới
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#4a352b]">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[#F4600C] text-[18px]">person</span>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Họ và tên khách hàng</p>
                                                <p className="font-bold text-xs mt-0.5">{fullName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[#F4600C] text-[18px]">call</span>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Số điện thoại</p>
                                                <p className="font-bold text-xs mt-0.5">{phoneNumber}</p>
                                            </div>
                                        </div>
                                        {email && (
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-[#F4600C] text-[18px]">mail</span>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Thư điện tử (Email)</p>
                                                    <p className="font-bold text-xs mt-0.5 truncate max-w-[240px]">{email}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[#F4600C] text-[18px]">directions_bus</span>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Chuyến đi</p>
                                                <p className="font-bold text-xs mt-0.5">
                                                    {currentTrip?.from || currentTrip?.route?.originCityName} ➜ {currentTrip?.to || currentTrip?.route?.destinationCityName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[#F4600C] text-[18px]">chair</span>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Vị trí ghế đã chọn</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedSeats.map(seat => (
                                                        <span key={seat} className="bg-orange-50 text-[#F4600C] border border-orange-200/50 px-2 py-0.5 rounded-md font-extrabold text-[10px] tracking-wide">
                                                            {seat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic selection or embedded VietQR container */}
                            {paymentUrl ? (
                                <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_rgba(92,64,51,0.06)] space-y-6">
                                    <div className="flex justify-between items-center pb-4 border-b border-outline-variant border-dashed">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <h5 className="font-bold text-sm text-on-surface">Quét mã QR liên ngân hàng VietQR</h5>
                                        </div>
                                        <p className="text-xs font-extrabold text-[#F4600C] bg-orange-50 border border-orange-100 px-3.5 py-1 rounded-full">
                                            Thanh toán: 10.000₫
                                        </p>
                                    </div>

                                    {paymentError && (
                                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-left flex items-start gap-3 animate-fade-in">
                                            <span className="material-symbols-outlined text-red-500 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                                            <div>
                                                <h4 className="font-bold text-xs text-red-800">Lỗi xác nhận thanh toán</h4>
                                                <p className="text-[10px] text-red-600/90 font-medium mt-0.5 leading-relaxed">{paymentError}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Inline Iframe mounting container */}
                                    <div id="embedded-payment-container" className="relative w-full h-[400px] bg-slate-50/50 border border-slate-200/60 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                                        <div className="loading-spinner-wrapper flex flex-col items-center gap-3 text-slate-400">
                                            <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-xs font-medium tracking-wide">Đang kết nối cổng thanh toán PayOS...</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-slate-400 font-semibold pt-2">
                                        <span className="flex items-center gap-1 text-emerald-600">
                                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                            Bảo mật mã hóa SSL 256-bit
                                        </span>
                                        <button 
                                            onClick={() => handleResetToStep1()}
                                            className="text-[#F4600C] hover:underline font-bold bg-transparent border-none cursor-pointer"
                                        >
                                            Thay đổi thông tin vé
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <PaymentMethods 
                                        paymentMethod={paymentMethod} 
                                        setPaymentMethod={setPaymentMethod} 
                                    />
                                    <button 
                                        onClick={handleProcessPayment}
                                        disabled={isProcessing}
                                        className="w-full bg-[#F4600C] text-white font-bold text-base py-4 rounded-xl hover:bg-[#c94c00] active:scale-98 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border-none uppercase tracking-wider disabled:opacity-75 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang khởi tạo QR...
                                            </>
                                        ) : (
                                            <>
                                                Tiến hành thanh toán (Nhận mã QR)
                                                <span className="material-symbols-outlined text-[18px]">credit_card</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Sticky summary panel */}
                        <div className="lg:col-span-4 relative">
                            <CheckoutSummary
                                currentTrip={currentTrip}
                                selectedSeats={selectedSeats}
                                baseTotal={baseTotal}
                                promoInput={promoInput}
                                setPromoInput={setPromoInput}
                                handleApplyPromo={handleApplyPromo}
                                promoMessage={promoMessage}
                                appliedDiscount={appliedDiscount}
                                handleCheckout={handleProcessPayment}
                                isProcessing={isProcessing}
                                buttonText={paymentUrl ? "Đang thanh toán..." : "Thực hiện thanh toán"}
                            />
                        </div>
                    </div>
                )}

                {activeStep === 3 && (
                    <div className="max-w-[720px] mx-auto w-full animate-fade-in-up">
                        {/* Premium Ticket Card Success */}
                        <div className="bg-surface-container-low border border-emerald-100 rounded-3xl p-6 md:p-10 shadow-[0_24px_50px_-15px_rgba(16,185,129,0.08)] relative overflow-hidden text-center flex flex-col items-center">
                            
                            {/* Success Glowing Shield */}
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-6 scale-100 animate-pulse">
                                <span className="material-symbols-outlined text-4xl font-extrabold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            </div>
                            
                            <h4 className="text-2xl font-extrabold text-emerald-800 tracking-tight mb-2 uppercase">Đặt vé thành công!</h4>
                            <p className="text-xs text-emerald-600/90 font-semibold max-w-[400px] leading-relaxed mb-8">
                                Cảm ơn quý khách! Vé điện tử của bạn đã được xác nhận thanh toán thành công và gửi tới địa chỉ email đăng ký.
                            </p>

                            {/* Electronic Ticket Details Box */}
                            <div className="w-full bg-[#f8faf8] border border-slate-200/50 rounded-2xl p-6 md:p-8 text-left space-y-6 relative overflow-hidden">
                                <div className="absolute -left-3 top-[105px] w-6 h-6 rounded-full bg-background border-r border-slate-200/50 pointer-events-none" />
                                <div className="absolute -right-3 top-[105px] w-6 h-6 rounded-full bg-background border-l border-slate-200/50 pointer-events-none" />

                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Mã đặt vé (Booking Code)</p>
                                        <p className="text-xl font-extrabold text-emerald-700 tracking-wider font-mono mt-1">
                                            {createdBooking?.bookingCode}
                                        </p>
                                    </div>
                                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full border border-emerald-200">
                                        Đã thanh toán
                                    </span>
                                </div>

                                <div className="border-t border-slate-200/60 border-dashed" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#4a352b]">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Tên hành khách</p>
                                            <p className="font-bold text-xs mt-0.5">{fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Số điện thoại liên hệ</p>
                                            <p className="font-bold text-xs mt-0.5">{phoneNumber}</p>
                                        </div>
                                        {email && (
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Địa chỉ email nhận vé</p>
                                                <p className="font-bold text-xs mt-0.5 truncate max-w-[280px]">{email}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Chuyến xe hành trình</p>
                                            <p className="font-bold text-xs mt-0.5">
                                                {currentTrip?.from || currentTrip?.route?.originCityName} ➜ {currentTrip?.to || currentTrip?.route?.destinationCityName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Vị trí giường/ghế ngồi</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {selectedSeats.map(seat => (
                                                    <span key={seat} className="bg-emerald-50 text-emerald-800 border border-emerald-200/50 px-2.5 py-0.5 rounded-md font-extrabold text-[10px]">
                                                        {seat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Tổng tiền vé đã thanh toán</p>
                                            <p className="font-extrabold text-sm text-emerald-800 mt-0.5">
                                                {(createdBooking?.totalAmount || Math.max(0, baseTotal - appliedDiscount)).toLocaleString()}đ
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 Action buttons */}
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                <button 
                                    onClick={() => navigate('/')}
                                    className="w-full bg-[#F4600C] hover:bg-[#c94c00] text-white font-bold text-sm py-3.5 rounded-xl active:scale-98 transition-all shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-sm">home</span>
                                    Về trang chủ
                                </button>
                                <button 
                                    onClick={() => navigate('/lich-su-dat-ve')}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm py-3.5 rounded-xl active:scale-98 transition-all cursor-pointer border border-slate-200 flex items-center justify-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-sm">history</span>
                                    Lịch sử đặt vé
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};
