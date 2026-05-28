import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { publicTripService } from '../../services/trip-service/publicTripService';
import { priceService } from '../../services/price-service/priceService';

export interface CheckoutState {
    selectedSeats: string[];
    currentTrip: any;
    totalAmount: number;
}

export const useCheckoutPage = () => {
    // Removed unused id
    const navigate = useNavigate();
    const location = useLocation();

    // Recover details from route state
    const passedState = location.state as CheckoutState | null;

    // Use local state for live data
    const [currentTrip, setCurrentTrip] = useState<any>(passedState?.currentTrip || null);
    const selectedSeats = passedState?.selectedSeats || [];
    const [baseTotal, setBaseTotal] = useState<number>(
        passedState?.totalAmount || (currentTrip?.price * selectedSeats.length) || 0
    );

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

    // Scroll to top and fetch latest trip data
    useEffect(() => {
        window.scrollTo(0, 0);
        
        const fetchLiveData = () => {
            const tripId = passedState?.currentTrip?.id;
            if (tripId) {
                Promise.all([
                    publicTripService.getTripById(tripId),
                    publicTripService.getSeatMap(tripId).catch(() => ({ data: { result: null } }))
                ]).then(async ([tripRes, seatMapRes]) => {
                    const payload = tripRes.data.result || tripRes.data.data;
                const seatMapPayload = seatMapRes.data?.result || seatMapRes.data?.data;
                if (payload) {
                    let newPrice = payload.prices?.[0]?.finalPrice || payload.prices?.[0]?.basePrice || payload.price || 0;
                    
                    let routeTiers: any[] = [];
                    // Fallback to route-level pricing if trip has no specific prices
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
                    setCurrentTrip(mappedTrip);
                    
                    if (selectedSeats.length > 0) {
                        if (seatMapPayload && seatMapPayload.seats) {
                            let sum = 0;
                            for (const sn of selectedSeats) {
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
                            setBaseTotal(sum);
                        } else {
                            setBaseTotal(newPrice * selectedSeats.length);
                        }
                    }
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
    }, [passedState?.currentTrip?.id, selectedSeats.length]);

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

    const handleCheckout = (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();

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
            
            navigate(`/tuyen-duong/${currentTrip.id}/dat-cho-thanh-cong`, {
                state: {
                    bookingCode,
                    fullName: fullName.trim(),
                    phoneNumber: phoneNumber.trim(),
                    email: email.trim(),
                    selectedSeats,
                    currentTrip,
                    totalPaid: Math.max(0, baseTotal - appliedDiscount)
                }
            });
        }, 1200);
    };

    const handleNavigateRoutes = () => {
        navigate(ROUTES.ROUTES);
    };

    return {
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
        handleCheckout,
        handleNavigateRoutes
    };
};
