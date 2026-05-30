import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/user-service/useAuth';
import { ROUTES } from '../../constants/routes';
import { publicTripService } from '../../services/trip-service/publicTripService';
import { priceService } from '../../services/price-service/priceService';

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

  const [liveTrip, setLiveTrip] = useState<any>(state?.trip || null);
  const [liveTotalAmount, setLiveTotalAmount] = useState<number>(state?.totalAmount || 0);
  const [liveSeatDetails, setLiveSeatDetails] = useState<any[]>(state?.seatDetails || []);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchLiveData = () => {
      if (tripId) {
        Promise.all([
          publicTripService.getTripById(tripId),
          publicTripService.getSeatMap(tripId).catch(() => ({ data: { result: null } } as any))
        ]).then(async ([tripRes, seatMapRes]) => {
          const payload = tripRes.data.result || tripRes.data.data;
          const seatMapPayload = seatMapRes.data?.result || seatMapRes.data?.data;
          if (payload) {
          let newPrice = payload.prices?.[0]?.finalPrice || payload.prices?.[0]?.basePrice || payload.price || 0;
          
          // Fallback to route-level pricing if trip has no specific prices
          let routeTiers: any[] = [];
          if (newPrice === 0 && payload.routeId) {
              try {
                  const priceRes = await priceService.getPricingByRoute(payload.routeId);
                  const pp = priceRes.data.result || priceRes.data.data;
                  routeTiers = (pp as any)?.priceTiers || [];
                  if (routeTiers.length > 0) {
                      newPrice = routeTiers[0].finalPrice || routeTiers[0].basePrice || routeTiers[0].minPrice || 0;
                  }
              } catch (err) {
                  console.error('Failed to fetch route pricing', err);
              }
          }

          let updatedSeatDetails = state?.seatDetails || [];
          if (state?.seatDetails?.length) {
            updatedSeatDetails = state.seatDetails.map((s: any) => {
              // Extract latest seatType from seatMap if available
              let currentSeatType = s.seatType;
              if (seatMapPayload && seatMapPayload.seats) {
                  const latestSeat = seatMapPayload.seats.find((mapSeat: any) => mapSeat.seatNumber === s.seatNumber);
                  if (latestSeat && latestSeat.seatType) {
                      currentSeatType = latestSeat.seatType;
                  }
              }

              let pPrice = newPrice; 
              const pe = payload.prices?.find((p: any) => p.seatType === currentSeatType) || payload.prices?.[0];
              if (pe) {
                  pPrice = pe.finalPrice || pe.basePrice;
              } else if (routeTiers.length > 0) {
                  const tier = routeTiers.find((t: any) => t.seatType === currentSeatType) || routeTiers[0];
                  pPrice = tier?.finalPrice || tier?.basePrice || tier?.minPrice || 0;
              }
              return { ...s, seatType: currentSeatType, price: pPrice };
            });
            const sum = updatedSeatDetails.reduce((acc: number, s: any) => acc + s.price, 0);
            setLiveTotalAmount(sum);
            setLiveSeatDetails(updatedSeatDetails);
          } else if (state?.selectedSeats?.length) {
            // Recalculate accurately if we have seatMap but no seatDetails
            if (seatMapPayload && seatMapPayload.seats) {
                let sum = 0;
                for (const sn of state.selectedSeats) {
                    const latestSeat = seatMapPayload.seats.find((mapSeat: any) => mapSeat.seatNumber === sn);
                    const st = latestSeat?.seatType || 'REGULAR';
                    const pe = payload.prices?.find((p: any) => p.seatType === st) || payload.prices?.[0];
                    let pPrice = newPrice;
                    if (pe) {
                        pPrice = pe.finalPrice || pe.basePrice;
                    } else if (routeTiers.length > 0) {
                        const tier = routeTiers.find((t: any) => t.seatType === st) || routeTiers[0];
                        pPrice = tier?.finalPrice || tier?.basePrice || tier?.minPrice || 0;
                    }
                    sum += pPrice;
                }
                setLiveTotalAmount(sum);
            } else {
                setLiveTotalAmount(newPrice * state.selectedSeats.length);
            }
          }

          const mappedTrip = {
            id: payload.id,
            from: payload.route?.originCityName || '—',
            to: payload.route?.destinationCityName || '—',
            routeName: payload.route?.name || '',
            duration: payload.route?.durationMinutes ? `${Math.floor(payload.route.durationMinutes / 60)} giờ` : '',
            price: newPrice,
            vehicleType: payload.vehicle?.vehicleTypeName || '—',
            vehicleFullName: [payload.vehicle?.brand, payload.vehicle?.model].filter(Boolean).join(' ') || '',
            licensePlate: payload.vehicle?.licensePlate || '—',
            departureDatetime: payload.departureDatetime,
            arrivalDatetime: payload.arrivalDatetime,
            tripCode: payload.tripCode || '',
          };
          setLiveTrip(mappedTrip);
        }
      }).catch(console.error);
      }
    };
    
    fetchLiveData();

    const handleDataChanged = () => {
      fetchLiveData();
    };
    window.addEventListener('public-data-changed', handleDataChanged);
    return () => window.removeEventListener('public-data-changed', handleDataChanged);
  }, [tripId, state?.selectedSeats]);

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

  const finalTotal = Math.max(0, liveTotalAmount - discount);

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
          currentTrip: liveTrip, 
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
    state: { ...state, trip: liveTrip, currentTrip: liveTrip, totalAmount: liveTotalAmount, seatDetails: liveSeatDetails },
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
