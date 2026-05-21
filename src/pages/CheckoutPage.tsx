import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { mockRoutes } from './RoutesPage';
import { ROUTES } from '../constants/routes';

interface CheckoutState {
    selectedSeats: string[];
    currentRoute: any;
    totalAmount: number;
}

export const CheckoutPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Recover details from route state
    const passedState = location.state as CheckoutState | null;

    // Default route resolve
    const route = mockRoutes.find((r) => r.id === id);
    const defaultRoute = {
        id: 'default',
        from: 'Sài Gòn',
        to: 'Đà Lạt',
        duration: '7 tiếng di chuyển',
        price: 420000,
        operator: 'Phương Trang',
        vehicleType: 'Giường nằm VIP 34 chỗ'
    };

    const currentRoute = passedState?.currentRoute || route 
        ? {
            ...(passedState?.currentRoute || route),
            operator: passedState?.currentRoute?.operator || 'Phương Trang',
            vehicleType: passedState?.currentRoute?.vehicleType || 'Giường nằm VIP 34 chỗ'
          }
        : defaultRoute;

    const selectedSeats = passedState?.selectedSeats || ['A12', 'A13'];
    const baseTotal = passedState?.totalAmount || (currentRoute.price * selectedSeats.length);

    // Form inputs state
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'momo' | 'vnpay' | 'card'>('momo');

    // Form errors state
    const [formErrors, setFormErrors] = useState<{ fullName?: string; phoneNumber?: string }>({});

    // Promo code state
    const [promoInput, setPromoInput] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

    // Submission states
    const [isProcessing, setIsProcessing] = useState(false);

    // Scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleApplyPromo = () => {
        const cleanPromo = promoInput.trim().toUpperCase();
        if (!cleanPromo) return;

        if (cleanPromo === 'HOMING' || cleanPromo === 'DIVENHA') {
            setAppliedDiscount(50000);
            setPromoMessage({ text: 'Áp dụng mã thành công! Giảm -50.000đ', isError: false });
        } else {
            setAppliedDiscount(0);
            setPromoMessage({ text: 'Mã khuyến mãi không hợp lệ!', isError: true });
        }
    };

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        const errors: { fullName?: string; phoneNumber?: string } = {};
        if (!fullName.trim()) {
            errors.fullName = 'Họ và tên không được để trống!';
        }
        
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!phoneNumber) {
            errors.phoneNumber = 'Số điện thoại không được để trống!';
        } else if (!phoneRegex.test(phoneNumber.trim())) {
            errors.phoneNumber = 'Số điện thoại không hợp lệ! (Ví dụ: 0987654321)';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            // Scroll to form errors
            window.scrollTo({ top: 150, behavior: 'smooth' });
            return;
        }

        setFormErrors({});
        setIsProcessing(true);

        // Simulate booking API call with loading animation
        setTimeout(() => {
            const bookingCode = `DVN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            setIsProcessing(false);
            
            navigate(`/tuyen-duong/${currentRoute.id}/dat-cho-thanh-cong`, {
                state: {
                    bookingCode,
                    fullName: fullName.trim(),
                    phoneNumber: phoneNumber.trim(),
                    email: email.trim(),
                    selectedSeats,
                    currentRoute,
                    totalPaid: Math.max(0, baseTotal - appliedDiscount)
                }
            });
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-background text-on-background font-body-md antialiased relative flex flex-col pb-16">
            {/* Standard Header Layout */}
            <Header />

            {/* Grain Overlay */}
            <div className="grain-overlay" />

            {/* Main Content */}
            <main className="flex-grow pt-[104px] pb-xl px-8 max-w-[1200px] mx-auto w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                    
                    {/* LEFT COLUMN: Passenger details & payments */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* Passenger information form */}
                        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_8px_20px_rgba(92,64,51,0.05)] relative overflow-hidden group">
                            <h2 className="text-xl font-bold text-on-surface mb-8 flex items-center gap-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                                <span className="material-symbols-outlined text-primary font-bold">person</span>
                                Thông tin hành khách
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                                        HỌ VÀ TÊN <span className="text-primary">*</span>
                                    </label>
                                    <input 
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className={`w-full bg-surface border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none ${
                                            formErrors.fullName ? 'border-error' : 'border-outline-variant'
                                        }`}
                                        placeholder="Nhập họ và tên đầy đủ"
                                    />
                                    {formErrors.fullName && (
                                        <p className="text-xs text-error font-semibold mt-1">{formErrors.fullName}</p>
                                    )}
                                </div>

                                {/* Phone Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                                        SỐ ĐIỆN THOẠI <span className="text-primary">*</span>
                                    </label>
                                    <input 
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className={`w-full bg-surface border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none ${
                                            formErrors.phoneNumber ? 'border-error' : 'border-outline-variant'
                                        }`}
                                        placeholder="Nhập số điện thoại"
                                    />
                                    {formErrors.phoneNumber && (
                                        <p className="text-xs text-error font-semibold mt-1">{formErrors.phoneNumber}</p>
                                    )}
                                </div>

                                {/* Email Input */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                                        EMAIL (TÙY CHỌN)
                                    </label>
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                        placeholder="Nhận thông tin vé qua email"
                                    />
                                </div>

                                {/* Notes Input */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                                        GHI CHÚ (TÙY CHỌN)
                                    </label>
                                    <textarea 
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none h-24"
                                        placeholder="Ví dụ: Điểm đón cụ thể, yêu cầu đặc biệt..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Payment methods section */}
                        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_8px_20px_rgba(92,64,51,0.05)] relative overflow-hidden">
                            <h2 className="text-xl font-bold text-on-surface mb-8 flex items-center gap-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                                <span className="material-symbols-outlined text-primary font-bold">payments</span>
                                Phương thức thanh toán
                            </h2>

                            <div className="space-y-4">
                                {/* Momo */}
                                <label className={`relative flex items-center p-5 border rounded-xl cursor-pointer hover:border-primary transition-colors bg-surface group ${
                                    paymentMethod === 'momo' ? 'border-primary bg-surface-container-low ring-1 ring-primary' : 'border-outline-variant'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        checked={paymentMethod === 'momo'}
                                        onChange={() => setPaymentMethod('momo')}
                                        className="sr-only" 
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                                        paymentMethod === 'momo' ? 'border-primary' : 'border-outline'
                                    }`}>
                                        {paymentMethod === 'momo' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <div className="flex-grow text-left">
                                        <span className="text-base font-semibold text-on-surface block">Ví MoMo</span>
                                        <span className="text-sm text-on-surface-variant block mt-0.5">Thanh toán nhanh chóng qua ứng dụng MoMo</span>
                                    </div>
                                    <span className="material-symbols-outlined text-primary text-[32px]">account_balance_wallet</span>
                                </label>

                                {/* VNPay */}
                                <label className={`relative flex items-center p-5 border rounded-xl cursor-pointer hover:border-primary transition-colors bg-surface group ${
                                    paymentMethod === 'vnpay' ? 'border-primary bg-surface-container-low ring-1 ring-primary' : 'border-outline-variant'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        checked={paymentMethod === 'vnpay'}
                                        onChange={() => setPaymentMethod('vnpay')}
                                        className="sr-only" 
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                                        paymentMethod === 'vnpay' ? 'border-primary' : 'border-outline'
                                    }`}>
                                        {paymentMethod === 'vnpay' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <div className="flex-grow text-left">
                                        <span className="text-base font-semibold text-on-surface block">VNPAY</span>
                                        <span className="text-sm text-on-surface-variant block mt-0.5">Quét mã QR qua ứng dụng ngân hàng</span>
                                    </div>
                                    <span className="material-symbols-outlined text-primary text-[32px]">qr_code_scanner</span>
                                </label>

                                {/* Credit Card */}
                                <label className={`relative flex items-center p-5 border rounded-xl cursor-pointer hover:border-primary transition-colors bg-surface group ${
                                    paymentMethod === 'card' ? 'border-primary bg-surface-container-low ring-1 ring-primary' : 'border-outline-variant'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        checked={paymentMethod === 'card'}
                                        onChange={() => setPaymentMethod('card')}
                                        className="sr-only" 
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                                        paymentMethod === 'card' ? 'border-primary' : 'border-outline'
                                    }`}>
                                        {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <div className="flex-grow text-left">
                                        <span className="text-base font-semibold text-on-surface block">Thẻ tín dụng / Ghi nợ</span>
                                        <span className="text-sm text-on-surface-variant block mt-0.5">Visa, Mastercard, JCB</span>
                                    </div>
                                    <span className="material-symbols-outlined text-primary text-[32px]">credit_card</span>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: Sticky summary panel */}
                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-[120px] bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_12px_32px_rgba(92,64,51,0.1)] relative overflow-hidden flex flex-col h-full text-left">
                            
                            <h3 className="text-lg font-bold text-on-surface mb-6 border-b border-outline-variant pb-4 border-dashed relative z-10" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Tóm tắt chuyến đi
                            </h3>

                            <div className="space-y-6 flex-grow relative z-10">
                                {/* Route details */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">{currentRoute.from}</span>
                                        <span className="material-symbols-outlined text-outline text-[18px]">arrow_right_alt</span>
                                        <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">{currentRoute.to}</span>
                                    </div>
                                    <div className="text-base font-semibold text-on-surface">{currentRoute.operator} • {currentRoute.vehicleType}</div>
                                    
                                    <div className="text-sm text-on-surface-variant mt-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                                        <span>22:30, T6, 24 Thg 11, 2026</span>
                                    </div>
                                    
                                    <div className="text-sm text-on-surface-variant mt-1.5 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">chair</span>
                                        <span>Ghế: {selectedSeats.join(', ')}</span>
                                    </div>
                                </div>

                                <div className="border-t border-outline-variant border-dashed"></div>

                                {/* Promo code input block */}
                                <div className="space-y-2">
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value)}
                                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-4 pr-24 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                            placeholder="Mã khuyến mãi (Ví dụ: HOMING)"
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleApplyPromo}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-primary-hover transition-colors uppercase px-3 py-1.5 rounded-md hover:bg-surface-container-high cursor-pointer"
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                    
                                    {promoMessage && (
                                        <p className={`text-xs font-semibold mt-1 text-left ${
                                            promoMessage.isError ? 'text-error' : 'text-primary'
                                        }`}>
                                            {promoMessage.text}
                                        </p>
                                    )}
                                </div>

                                <div className="border-t border-outline-variant border-dashed"></div>

                                {/* Price breakdown */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm text-on-surface-variant">
                                        <span>Giá vé ({selectedSeats.length} x {currentRoute.price.toLocaleString()}đ)</span>
                                        <span>{baseTotal.toLocaleString()}đ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-on-surface-variant">
                                        <span>Phụ phí</span>
                                        <span>0đ</span>
                                    </div>
                                    {appliedDiscount > 0 && (
                                        <div className="flex justify-between items-center text-sm text-primary font-semibold">
                                            <span>Giảm giá</span>
                                            <span>-{appliedDiscount.toLocaleString()}đ</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-outline-variant mt-4 pt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-base text-on-surface font-semibold">Tổng tiền</span>
                                        <span className="text-xl font-bold text-primary">
                                            {Math.max(0, baseTotal - appliedDiscount).toLocaleString()}đ
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout CTA */}
                            <button 
                                type="button"
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                className="mt-8 w-full bg-[#F4600C] text-white font-semibold text-base py-4 rounded-xl hover:bg-[#c94c00] active:scale-98 transition-all shadow-lg hover:shadow-xl relative z-10 flex items-center justify-center gap-2 cursor-pointer border-none uppercase tracking-wider disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang thanh toán...
                                    </>
                                ) : (
                                    <>
                                        Xác nhận & Thanh toán
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </>
                                )}
                            </button>
                            
                            <p className="text-xs text-on-surface-variant text-center mt-4 relative z-10 leading-relaxed">
                                Bằng việc bấm xác nhận, bạn đồng ý với các{' '}
                                <a className="text-primary hover:underline font-semibold" href="#">điều khoản</a> của chúng tôi.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
