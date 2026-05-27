import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

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

    const currentTrip = passedState?.currentTrip;
    const selectedSeats = passedState?.selectedSeats || [];
    const baseTotal = passedState?.totalAmount || (currentTrip?.price * selectedSeats.length) || 0;

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
