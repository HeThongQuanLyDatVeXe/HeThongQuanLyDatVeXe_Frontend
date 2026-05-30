import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePayOS } from '@payos/payos-checkout';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/user-service/useAuth';
import { bookingService } from '../../services/booking-service/bookingService';
import { paymentService } from '../../services/payment-service/paymentService';

export interface CheckoutState {
    selectedSeats: string[];
    currentTrip: any;
    totalAmount: number;
    seatDetails?: any[];
}

export const useCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();

    // Recover details from route state
    const passedState = location.state as CheckoutState | null;

    const currentTrip = passedState?.currentTrip;
    const selectedSeats = passedState?.selectedSeats || [];
    const baseTotal = passedState?.totalAmount || (currentTrip?.price * selectedSeats.length) || 0;

    // Wizard active step: 1 (Info), 2 (Payment & QR), 3 (Completed Ticket)
    const [activeStep, setActiveStep] = useState<number>(1);

    // Form inputs state
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'momo' | 'vnpay' | 'card'>('card');

    // Form errors state
    const [formErrors, setFormErrors] = useState<{ fullName?: string; phoneNumber?: string }>({});

    // Promo code state
    const [promoInput, setPromoInput] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

    // Submission states
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Stable cache key based on trip ID and selected seats
    const bookingCacheKey = currentTrip?.id && selectedSeats.length > 0
        ? `active_booking_${currentTrip.id}_${[...selectedSeats].sort().join('_')}`
        : null;

    // Load createdBooking from sessionStorage
    const [createdBooking, setCreatedBooking] = useState<any>(() => {
        if (bookingCacheKey) {
            const cached = window.sessionStorage.getItem(bookingCacheKey);
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch (e) {
                    console.error("Failed to parse cached booking", e);
                }
            }
        }
        return null;
    });

    const latestBookingRef = useRef<any>(null);
    const currentTripRef = useRef(currentTrip);
    const selectedSeatsRef = useRef(selectedSeats);
    const navigateRef = useRef(navigate);
    const createdBookingRef = useRef(createdBooking);
    const baseTotalRef = useRef(baseTotal);

    useEffect(() => {
        currentTripRef.current = currentTrip;
        selectedSeatsRef.current = selectedSeats;
        navigateRef.current = navigate;
        createdBookingRef.current = createdBooking;
        baseTotalRef.current = baseTotal;
    }, [currentTrip, selectedSeats, navigate, createdBooking, baseTotal]);

    // Pre-fill user data
    useEffect(() => {
        if (isAuthenticated && user) {
            setFullName(user.fullName || '');
            setPhoneNumber(user.phoneNumber || '');
            setEmail(user.email || '');
        }
    }, [isAuthenticated, user]);

    // Scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // ── Reset checkout session state when trip or selected seats change ───────
    useEffect(() => {
        console.log("Checkout session changed. Resetting states for key:", bookingCacheKey);
        
        let newBooking = null;
        if (bookingCacheKey) {
            const cached = window.sessionStorage.getItem(bookingCacheKey);
            if (cached) {
                try {
                    newBooking = JSON.parse(cached);
                } catch (e) {
                    console.error("Failed to parse cached booking", e);
                }
            }
        }
        
        setCreatedBooking(newBooking);
        setPaymentUrl('');
        setPaymentError(null);
        setIsProcessing(false);
        setPromoInput('');
        setAppliedDiscount(0);
        setPromoMessage(null);
        setFormErrors({});
        
        if (newBooking) {
            const verifyBooking = async () => {
                try {
                    const checkRes = await bookingService.getBookingByCode(newBooking.bookingCode);
                    const latestBooking = checkRes.data.result || checkRes.data.data;
                    if (latestBooking) {
                        if (latestBooking.bookingStatus === 'CANCELLED' || latestBooking.bookingStatus === 'EXPIRED') {
                            console.log("Cached booking has been cancelled/expired on backend. Resetting.");
                            if (bookingCacheKey) {
                                window.sessionStorage.removeItem(bookingCacheKey);
                            }
                            setCreatedBooking(null);
                            setActiveStep(1);
                        } else if (latestBooking.paymentStatus === 'PAID' || latestBooking.bookingStatus === 'CONFIRMED') {
                            console.log("Cached booking is already PAID. Directing to Step 3.");
                            latestBookingRef.current = latestBooking;
                            setCreatedBooking(latestBooking);
                            setActiveStep(3);
                        } else {
                            console.log("Cached booking is unpaid and valid. Restoring Step 2.");
                            setCreatedBooking(latestBooking);
                            setActiveStep(2);
                        }
                    }
                } catch (err) {
                    console.error("Checking cached booking failed. Defaulting to Step 2.", err);
                    setActiveStep(2);
                }
            };
            verifyBooking();
        } else {
            setActiveStep(1);
        }
    }, [bookingCacheKey]);

    // ── PayOS Checkout Hook State and Integration ──────────────────────────
    const [payOSConfig, setPayOSConfig] = useState<any>({
        RETURN_URL: window.location.origin,
        ELEMENT_ID: "embedded-payment-container",
        CHECKOUT_URL: null,
        embedded: true,
        onSuccess: async (event: any) => {
            console.log("PayOS onSuccess event:", event);
            const booking = createdBookingRef.current;
            if (!booking) return;
            setPaymentError(null);
            try {
                setIsProcessing(true);
                // Await confirmPaymentSuccess (POST /api/payments/success)
                await paymentService.confirmPaymentSuccess(
                    booking.id,
                    event.paymentLinkId || 'txn-ref'
                );

                // Await confirmBooking (POST /api/bookings/confirm)
                await bookingService.confirmBooking(booking.id, {
                    transactionRef: event.paymentLinkId || 'txn-ref',
                    provider: 'PAYOS'
                });
                console.log("Backend confirm OK.");

                // Instantly fetch booking state
                const checkRes = await bookingService.getBookingByCode(booking.bookingCode);
                const latestBooking = checkRes.data.result || checkRes.data.data;
                if (latestBooking) {
                    latestBookingRef.current = latestBooking;
                    setCreatedBooking(latestBooking);

                    // Clear session storage cache
                    if (bookingCacheKey) {
                        window.sessionStorage.removeItem(bookingCacheKey);
                    }

                    // Advance directly to Step 3
                    setActiveStep(3);
                }
            } catch (e: any) {
                console.error("Failed to confirm success on backend", e);
                const errMsg = e.response?.data?.message || e.message || "Xác nhận thanh toán thất bại trên hệ thống. Vui lòng liên hệ hỗ trợ.";
                setPaymentError(errMsg);
            } finally {
                setIsProcessing(false);
            }
        },
        onCancel: () => {
            console.log("PayOS onCancel: user cancelled payment");
        }
    });

    const { open, exit } = usePayOS(payOSConfig);

    // TryOpen Element-mount detection loop to solve React mounting race conditions
    useEffect(() => {
        if (payOSConfig.CHECKOUT_URL != null && activeStep === 2) {
            let attempts = 0;
            const tryOpen = () => {
                const container = document.getElementById("embedded-payment-container");
                if (container) {
                    try {
                        console.log("Found embedded container, opening PayOS iframe");
                        open();
                    } catch (e) {
                        console.error("Failed to open PayOS iframe", e);
                    }
                } else if (attempts < 15) {
                    attempts++;
                    setTimeout(tryOpen, 100);
                } else {
                    console.error("Element #embedded-payment-container not found after 1.5s");
                }
            };
            const timer = setTimeout(tryOpen, 150);
            return () => clearTimeout(timer);
        }
    }, [payOSConfig.CHECKOUT_URL, activeStep, open]);

    // Cleanup PayOS exit handler on unmount
    useEffect(() => {
        return () => {
            if (document.getElementById("embedded-payment-container")) {
                try {
                    exit();
                } catch (e) {
                    console.error("Cleanup PayOS exit failed", e);
                }
            }
        };
    }, [exit]);

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

    // ── Step 1: Create Booking Action ──────────────────────────────────────────
    const handleCreateBooking = async (e?: React.FormEvent | React.MouseEvent) => {
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
            window.scrollTo({ top: 150, behavior: 'smooth' });
            return;
        }

        setFormErrors({});
        setIsProcessing(true);

        const requestData = {
            userId: window.localStorage.getItem('user_id') || null,
            tripId: currentTrip.id,
            customerName: fullName.trim(),
            customerPhone: phoneNumber.trim(),
            customerEmail: email.trim(),
            totalAmount: Math.max(0, baseTotal - appliedDiscount),
            seats: (passedState as any)?.seatDetails?.map((s: any) => ({
                seatId: s.seatId,
                seatNumber: s.seatNumber,
                price: s.price
            })) || []
        };

        try {
            const res = await bookingService.createBooking(requestData);
            const booking = res.data.result || res.data.data;
            if (booking) {
                setCreatedBooking(booking);
                if (bookingCacheKey) {
                    window.sessionStorage.setItem(bookingCacheKey, JSON.stringify(booking));
                }
                setActiveStep(2);
                window.scrollTo(0, 0);
            } else {
                alert("Đặt vé thất bại! Phản hồi trống từ máy chủ.");
            }
        } catch (err: any) {
            console.error("Booking failed", err);
            alert(err.response?.data?.message || err.message || "Đặt vé thất bại! Vui lòng thử lại.");
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Step 2: Process payment link and render QR code directly inside Step 2 ──
    const handleProcessPayment = async () => {
        if (!createdBooking) return;
        setIsProcessing(true);
        setPaymentError(null);

        try {
            // Check if already paid first or if expired
            const checkRes = await bookingService.getBookingByCode(createdBooking.bookingCode);
            const latestBooking = checkRes.data.result || checkRes.data.data;
            if (latestBooking) {
                if (latestBooking.bookingStatus === 'CANCELLED' || latestBooking.bookingStatus === 'EXPIRED') {
                    alert("Đặt vé đã hết hạn hoặc bị hủy trên hệ thống! Quay lại điền thông tin mới.");
                    if (bookingCacheKey) {
                        window.sessionStorage.removeItem(bookingCacheKey);
                    }
                    setCreatedBooking(null);
                    setActiveStep(1);
                    setIsProcessing(false);
                    return;
                }

                if (latestBooking.paymentStatus === 'PAID' || latestBooking.bookingStatus === 'CONFIRMED') {
                    // Already paid! Skip QR and move straight to Step 3
                    latestBookingRef.current = latestBooking;
                    setCreatedBooking(latestBooking);
                    setActiveStep(3);
                    setIsProcessing(false);
                    return;
                }
            }
        } catch (err) {
            console.error("Checking booking status before payment link creation failed", err);
        }

        // Cleanly exit any ongoing checkout embedded sessions if element exists
        if (document.getElementById("embedded-payment-container")) {
            try {
                exit();
            } catch (err) {
                console.error("Failed to exit PayOS SDK", err);
            }
        }

        try {
            const payRes = await paymentService.createPaymentLink({
                bookingId: createdBooking.id,
                bookingCode: createdBooking.bookingCode,
                amount: 10000, // Fixed 10,000₫ for testing ease
                description: `Ve xe ${createdBooking.bookingCode}`
            });
            const payObj = payRes.data.result || payRes.data.data;
            const checkoutUrl = payObj?.checkoutUrl;
            
            if (checkoutUrl) {
                setPaymentUrl(checkoutUrl);
                setPayOSConfig((oldConfig: any) => ({
                    ...oldConfig,
                    CHECKOUT_URL: checkoutUrl
                }));
                // Hide loading spinner after iframe mounts so the QR is completely visible
                setTimeout(() => {
                    const spinner = document.querySelector("#embedded-payment-container .loading-spinner-wrapper");
                    if (spinner) {
                        (spinner as HTMLElement).style.display = 'none';
                    }
                }, 1800);
            } else {
                alert("Không thể tạo cổng thanh toán PayOS. Vui lòng liên hệ nhà quản lý.");
            }
        } catch (payErr) {
            console.error("Payment link creation failed", payErr);
            alert("Không khởi tạo được cổng thanh toán PayOS.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNavigateRoutes = () => {
        navigate(ROUTES.ROUTES);
    };

    // ── Resets the booking session and clears cache ──────────────────────────
    const handleResetToStep1 = () => {
        if (bookingCacheKey) {
            window.sessionStorage.removeItem(bookingCacheKey);
        }
        setCreatedBooking(null);
        setPaymentUrl('');
        setPayOSConfig((oldConfig: any) => ({
            ...oldConfig,
            CHECKOUT_URL: null
        }));
        setActiveStep(1);
        window.scrollTo(0, 0);
    };

    return {
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
        activeStep,
        setActiveStep
    };
};
