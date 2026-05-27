import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/user-service/useAuth';
import { ROUTES } from '../../constants/routes';

export interface BookingLocationState {
  selectedSeats: string[];
  seatDetails: { seatNumber: string; seatType: string; price: number }[];
  trip: any;
  totalAmount: number;
}

export const useBookingPage = () => {
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

  const finalTotal = Math.max(0, (state?.totalAmount || 0) - discount);

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
        state: { 
          bookingCode, 
          fullName: fullName.trim(), 
          phoneNumber: phone.trim(), 
          email: email.trim(), 
          selectedSeats: state?.selectedSeats, 
          currentTrip: state?.trip, 
          totalPaid: finalTotal 
        }
      });
    }, 1500);
  };

  const paymentOptions = [
    { key: 'momo' as const, label: 'Ví MoMo', desc: 'Thanh toán nhanh chóng qua ứng dụng MoMo', icon: 'account_balance_wallet' },
    { key: 'vnpay' as const, label: 'VNPAY', desc: 'Quét mã QR qua ứng dụng ngân hàng', icon: 'qr_code_scanner' },
    { key: 'card' as const, label: 'Thẻ tín dụng / Ghi nợ', desc: 'Visa, Mastercard, JCB', icon: 'credit_card' },
  ];

  const handleNavigateRoutes = () => {
    navigate(ROUTES.ROUTES);
  };

  const handleNavigateLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  return {
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
  };
};
