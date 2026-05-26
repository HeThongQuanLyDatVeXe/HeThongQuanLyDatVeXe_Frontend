import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/user-service/useAuth';

interface BookingLocationState {
  selectedSeats: string[];
  seatDetails: { seatNumber: string; seatType: string; price: number }[];
  trip: any;
  totalAmount: number;
}

export const BookingPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const state = location.state as BookingLocationState | null;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // ── Form state ──
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'vnpay' | 'card'>('momo');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // ── Pre-fill user data ──
  useEffect(() => {
    if (isAuthenticated && user) {
      setFullName(user.fullName || '');
      setPhone(user.phoneNumber || '');
      setEmail(user.email || '');
    }
  }, [isAuthenticated, user]);

  // ── Guards ──
  if (!state?.trip || !state?.selectedSeats?.length) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-6xl text-outline">error_outline</span>
        <h2 className="text-xl font-bold text-on-surface">Không có thông tin đặt vé</h2>
        <p className="text-on-surface-variant">Vui lòng quay lại chọn chuyến và ghế trước.</p>
        <button onClick={() => navigate(ROUTES.ROUTES)} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-xl cursor-pointer">Quay lại tuyến đường</button>
      </div>
    );
  }

  const { trip, selectedSeats, seatDetails, totalAmount } = state;

  // ── Helpers ──
  const fmtPrice = (n: number) => n > 0 ? `${n.toLocaleString('vi-VN')}đ` : '0đ';
  const fmtTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    if (code === 'HOMING' || code === 'DIVENHA') {
      setDiscount(50000);
      setPromoMsg({ text: 'Áp dụng thành công! Giảm -50.000đ', ok: true });
    } else {
      setDiscount(0);
      setPromoMsg({ text: 'Mã khuyến mãi không hợp lệ!', ok: false });
    }
  };

  const finalTotal = Math.max(0, totalAmount - discount);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Họ và tên không được để trống';
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phone.trim()) e.phone = 'Số điện thoại không được để trống';
    else if (!phoneRegex.test(phone.trim())) e.phone = 'Số điện thoại không hợp lệ (VD: 0987654321)';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Email không hợp lệ';
    if (!agreedTerms) e.terms = 'Bạn cần đồng ý với điều khoản';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) { window.scrollTo({ top: 150, behavior: 'smooth' }); return; }
    setProcessing(true);
    setTimeout(() => {
      const bookingCode = `DVN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setProcessing(false);
      navigate(`/tuyen-duong/${tripId}/dat-cho-thanh-cong`, {
        state: { bookingCode, fullName: fullName.trim(), phoneNumber: phone.trim(), email: email.trim(), selectedSeats, currentTrip: trip, totalPaid: finalTotal }
      });
    }, 1500);
  };

  // ── Payment method config ──
  const paymentOptions = [
    { key: 'momo' as const, label: 'Ví MoMo', desc: 'Thanh toán nhanh chóng qua ứng dụng MoMo', icon: 'account_balance_wallet' },
    { key: 'vnpay' as const, label: 'VNPAY', desc: 'Quét mã QR qua ứng dụng ngân hàng', icon: 'qr_code_scanner' },
    { key: 'card' as const, label: 'Thẻ tín dụng / Ghi nợ', desc: 'Visa, Mastercard, JCB', icon: 'credit_card' },
  ];

  const InputField = ({ label, required, value, onChange, error, type = 'text', placeholder, disabled, span2 }: any) => (
    <div className={`space-y-2 ${span2 ? 'md:col-span-2' : ''}`}>
      <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input type={type} value={value} onChange={onChange} disabled={disabled}
        className={`w-full bg-surface border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none ${error ? 'border-red-400' : 'border-outline-variant'} ${disabled ? 'bg-surface-container-low text-on-surface-variant cursor-not-allowed' : ''}`}
        placeholder={placeholder} />
      {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md antialiased relative flex flex-col">
      <Header />
      <div className="grain-overlay" />

      <main className="flex-grow pt-[104px] pb-xl px-8 max-w-[1200px] mx-auto w-full relative z-10">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant">
          <button onClick={() => navigate(ROUTES.ROUTES)} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none">Tuyến đường</button>
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
            <button onClick={() => navigate(ROUTES.LOGIN)} className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-[#c84d04] transition-colors cursor-pointer">
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
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_8px_20px_rgba(92,64,51,0.05)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">1</div>
                  <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'Playfair Display, serif' }}>Thông tin hành khách</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Họ và tên" required value={fullName} onChange={(e: any) => setFullName(e.target.value)} error={errors.fullName} placeholder="Nhập họ và tên đầy đủ" disabled={isAuthenticated && !!user?.fullName} />
                  <InputField label="Số điện thoại" required type="tel" value={phone} onChange={(e: any) => setPhone(e.target.value)} error={errors.phone} placeholder="0987654321" disabled={isAuthenticated && !!user?.phoneNumber} />
                  <InputField label="Email" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} error={errors.email} placeholder="Nhận thông tin vé qua email" disabled={isAuthenticated && !!user?.email} span2 />
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">Ghi chú</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none h-24" placeholder="Điểm đón cụ thể, yêu cầu đặc biệt..." />
                  </div>
                </div>
              </section>

              {/* ── Step 2: Seat Details ── */}
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_8px_20px_rgba(92,64,51,0.05)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">2</div>
                  <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'Playfair Display, serif' }}>Chi tiết ghế đã chọn</h2>
                </div>
                <div className="space-y-3">
                  {(seatDetails || selectedSeats.map(s => ({ seatNumber: s, seatType: 'REGULAR', price: totalAmount / selectedSeats.length }))).map((seat: any) => (
                    <div key={seat.seatNumber} className="flex items-center justify-between p-4 bg-surface border border-outline-variant/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-[20px]">airline_seat_recline_extra</span>
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">Ghế {seat.seatNumber}</p>
                          <p className="text-xs text-on-surface-variant">{seat.seatType}</p>
                        </div>
                      </div>
                      <span className="font-bold text-primary">{fmtPrice(seat.price)}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Step 3: Payment ── */}
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_8px_20px_rgba(92,64,51,0.05)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">3</div>
                  <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'Playfair Display, serif' }}>Phương thức thanh toán</h2>
                </div>
                <div className="space-y-4">
                  {paymentOptions.map(opt => (
                    <label key={opt.key} className={`flex items-center p-5 border rounded-xl cursor-pointer hover:border-primary transition-all bg-surface group ${paymentMethod === opt.key ? 'border-primary bg-surface-container-low ring-1 ring-primary' : 'border-outline-variant'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === opt.key} onChange={() => setPaymentMethod(opt.key)} className="sr-only" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${paymentMethod === opt.key ? 'border-primary' : 'border-outline'}`}>
                        {paymentMethod === opt.key && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-grow text-left">
                        <span className="text-base font-semibold text-on-surface block">{opt.label}</span>
                        <span className="text-sm text-on-surface-variant block mt-0.5">{opt.desc}</span>
                      </div>
                      <span className="material-symbols-outlined text-primary text-[32px]">{opt.icon}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN — Sticky summary */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-[120px] space-y-6">

                {/* Trip summary card */}
                <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_12px_32px_rgba(92,64,51,0.1)] text-left">
                  <h3 className="text-lg font-bold text-on-surface mb-5 pb-4 border-b border-dashed border-outline-variant" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Tóm tắt chuyến đi
                  </h3>

                  <div className="space-y-4">
                    {/* Route */}
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">route</span>
                      <div>
                        <p className="font-semibold text-on-surface">{trip.from || trip.route?.originCityName} → {trip.to || trip.route?.destinationCityName}</p>
                        <p className="text-sm text-on-surface-variant">{trip.vehicleType || trip.vehicle?.vehicleTypeName}</p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">schedule</span>
                      <div>
                        <p className="font-semibold text-on-surface">{fmtTime(trip.departureDatetime)} → {fmtTime(trip.arrivalDatetime)}</p>
                        <p className="text-sm text-on-surface-variant">{fmtDate(trip.departureDatetime)}</p>
                      </div>
                    </div>

                    {/* Seats */}
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">chair</span>
                      <div>
                        <p className="font-semibold text-on-surface">{selectedSeats.length} ghế: {selectedSeats.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-outline-variant my-5" />

                  {/* Promo code */}
                  <div className="space-y-2 mb-5">
                    <div className="relative">
                      <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-4 pr-24 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Mã khuyến mãi" />
                      <button type="button" onClick={handleApplyPromo}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-primary-hover px-3 py-1.5 rounded-md hover:bg-surface-container-high cursor-pointer uppercase">Áp dụng</button>
                    </div>
                    {promoMsg && <p className={`text-xs font-semibold ${promoMsg.ok ? 'text-primary' : 'text-red-500'}`}>{promoMsg.text}</p>}
                  </div>

                  <div className="border-t border-dashed border-outline-variant mb-5" />

                  {/* Price breakdown */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Giá vé ({selectedSeats.length} ghế)</span>
                      <span>{fmtPrice(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Phụ phí</span><span>0đ</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-primary font-semibold">
                        <span>Giảm giá</span><span>-{fmtPrice(discount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-outline-variant mt-4 pt-4">
                    <div className="flex justify-between items-end">
                      <span className="text-base text-on-surface font-semibold">Tổng thanh toán</span>
                      <span className="text-2xl font-bold text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>{fmtPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 mt-6 cursor-pointer group">
                    <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-primary cursor-pointer rounded" />
                    <span className="text-xs text-on-surface-variant leading-relaxed">
                      Tôi đồng ý với <a className="text-primary hover:underline font-semibold" href="#">điều khoản sử dụng</a> và <a className="text-primary hover:underline font-semibold" href="#">chính sách bảo mật</a>
                    </span>
                  </label>
                  {errors.terms && <p className="text-xs text-red-500 font-semibold mt-1">{errors.terms}</p>}

                  {/* CTA */}
                  <button type="submit" disabled={processing}
                    className="mt-6 w-full bg-[#F4600C] text-white font-semibold text-base py-4 rounded-xl hover:bg-[#c94c00] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer border-none uppercase tracking-wider disabled:opacity-75 disabled:cursor-not-allowed">
                    {processing ? (
                      <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Đang xử lý...</>
                    ) : (
                      <>Xác nhận & Thanh toán<span className="material-symbols-outlined text-[18px]">lock</span></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};
