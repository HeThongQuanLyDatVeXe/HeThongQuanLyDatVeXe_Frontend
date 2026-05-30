import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { ROUTES } from '../constants/routes';
import { bookingService } from '../services/booking-service/bookingService';
import { publicTripService } from '../services/trip-service/publicTripService';
import { paymentService } from '../services/payment-service/paymentService';
import type { BookingResponse } from '../services/booking-service/bookingService';
import type { SeatInfo, TripResponse } from '../types/trip-service/Trip';

export const ChangeCancelTicketPage: React.FC = () => {
    const { bookingCode } = useParams<{ bookingCode: string }>();
    const navigate = useNavigate();

    // ── States ────────────────────────────────────────────────────────────────
    const [booking, setBooking] = useState<BookingResponse | null>(null);
    const [trip, setTrip] = useState<TripResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionType, setActionType] = useState<'cancel' | 'change_seat' | 'change_trip'>('cancel');

    // Cancellation States
    const [cancelReason, setCancelReason] = useState('Thay đổi kế hoạch / Lịch trình');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [submittingCancel, setSubmittingCancel] = useState(false);

    // Change Seat States
    const [seatMap, setSeatMap] = useState<SeatInfo[]>([]);
    const [loadingSeats, setLoadingSeats] = useState(false);
    const [selectedSeat, setSelectedSeat] = useState<SeatInfo | null>(null);
    const [submittingSeatChange, setSubmittingSeatChange] = useState(false);
    const [currentSeatToChange, setCurrentSeatToChange] = useState<any>(null);

    // Change Trip States
    const [otherTrips, setOtherTrips] = useState<TripResponse[]>([]);
    const [loadingOtherTrips, setLoadingOtherTrips] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<TripResponse | null>(null);
    const [tripSeatMap, setTripSeatMap] = useState<SeatInfo[]>([]);
    const [loadingTripSeats, setLoadingTripSeats] = useState(false);
    const [selectedTripSeat, setSelectedTripSeat] = useState<SeatInfo | null>(null);
    const [submittingTripChange, setSubmittingTripChange] = useState(false);

    // PayOS Embedded Modal States & Refs for Trip Change chênh lệch
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState('');
    const hasNavigatedRef = useRef(false);
    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


    // ── Load Initial Booking & Trip details ──────────────────────────────────
    useEffect(() => {
        if (!bookingCode) return;
        const loadBookingData = async () => {
            setLoading(true);
            try {
                const res = await bookingService.getBookingByCode(bookingCode);
                const bookingData = res.data.result || res.data.data;
                if (bookingData) {
                    setBooking(bookingData);
                    if (bookingData.seats && bookingData.seats.length > 0) {
                        setCurrentSeatToChange(bookingData.seats[0]);
                    }
                    // Fetch full trip details to get routes, departure times, etc.
                    const tripRes = await publicTripService.getTripById(bookingData.tripId);
                    const tripData = tripRes.data.result || tripRes.data.data;
                    if (tripData) {
                        setTrip(tripData);
                    }
                }
            } catch (err) {
                console.error("Failed to load booking details", err);
            } finally {
                setLoading(false);
            }
        };
        loadBookingData();
    }, [bookingCode]);

    // ── Load Seat Map for Change Seat ─────────────────────────────────────────
    useEffect(() => {
        if (actionType !== 'change_seat' || !booking?.tripId) return;
        const fetchSeatMap = async () => {
            setLoadingSeats(true);
            try {
                const res = await publicTripService.getSeatMap(booking.tripId);
                const payload = res.data.result || res.data.data;
                if (payload && payload.seats) {
                    setSeatMap(payload.seats);
                }
            } catch (err) {
                console.error("Failed to fetch seat map", err);
            } finally {
                setLoadingSeats(false);
            }
        };
        fetchSeatMap();
    }, [actionType, booking?.tripId]);

    // ── Load Other Trips for Reschedule/Change Trip ─────────────────────────
    useEffect(() => {
        if (actionType !== 'change_trip' || !trip?.routeId) return;
        const fetchOtherTrips = async () => {
            setLoadingOtherTrips(true);
            try {
                const res = await publicTripService.getTripsByRoute(trip.routeId);
                const payload = res.data.result || res.data.data;
                const tripList = payload?.content || payload || [];
                // Exclude current trip
                setOtherTrips(tripList.filter((t: TripResponse) => t.id !== trip.id));
            } catch (err) {
                console.error("Failed to load other trips", err);
            } finally {
                setLoadingOtherTrips(false);
            }
        };
        fetchOtherTrips();
    }, [actionType, trip?.routeId, trip?.id]);

    // ── Load Seat Map for Selected Alternative Trip ──────────────────────────
    useEffect(() => {
        if (!selectedTrip) return;
        const fetchTripSeats = async () => {
            setLoadingTripSeats(true);
            try {
                const res = await publicTripService.getSeatMap(selectedTrip.id);
                const payload = res.data.result || res.data.data;
                if (payload && payload.seats) {
                    setTripSeatMap(payload.seats);
                }
            } catch (err) {
                console.error("Failed to fetch trip seat map", err);
            } finally {
                setLoadingTripSeats(false);
            }
        };
        fetchTripSeats();
    }, [selectedTrip]);

    // ── Derived Flags ─────────────────────────────────────────────────────────
    const hasSeatChanged = booking?.histories?.some(
        (h) => h.reason?.startsWith('Changed seat')
    ) ?? false;

    // ── Calculations ─────────────────────────────────────────────────────────
    const hoursUntilDeparture = trip?.departureDatetime
        ? (new Date(trip.departureDatetime).getTime() - Date.now()) / (1000 * 60 * 60)
        : 0;

    let refundPercent = 100;
    if (hoursUntilDeparture < 12) {
        refundPercent = 0;
    } else if (hoursUntilDeparture < 24) {
        refundPercent = 70;
    }

    const baseAmount = booking?.totalAmount || 0;
    const refundAmount = (baseAmount * refundPercent) / 100;

    // ── Helper to handle navigate on successful trip rescheduling ───────────
    const navigateToTripChangeSuccess = () => {
        if (hasNavigatedRef.current) return;
        hasNavigatedRef.current = true;

        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }

        setShowPaymentModal(false);
        alert("Đổi chuyến xe mới thành công!");
        navigate(ROUTES.MY_BOOKINGS);
    };

    // ── Close modal: check real backend status before deciding where to go ──
    const handleClosePaymentModal = async () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }

        setSubmittingTripChange(true);
        try {
            // Workaround: blindly call confirmBooking when modal closes.
            await bookingService.confirmBooking(booking!.id, {
                transactionRef: 'manual-confirm',
                provider: 'PAYOS'
            });

            // Genuinely paid and changed!
            navigateToTripChangeSuccess();
        } catch (err) {
            console.error("Checking final transaction status failed", err);
            setShowPaymentModal(false);
            navigate(ROUTES.MY_BOOKINGS);
        } finally {
            setSubmittingTripChange(false);
        }
    };

    // ── Real-time Short Polling for Trip Change payment and DB update ───────
    useEffect(() => {
        if (!showPaymentModal || !booking || !selectedTrip) return;

        hasNavigatedRef.current = false;

        const intervalId = setInterval(async () => {
            try {
                // 1. Fetch latest payment state
                const paymentRes = await paymentService.getPaymentByBookingId(booking.id);
                const paymentData = paymentRes.data.result || paymentRes.data.data || paymentRes.data;

                // 2. Fetch latest booking state
                const bookingRes = await bookingService.getBookingByCode(booking.bookingCode);
                const latestBooking = bookingRes.data.result || bookingRes.data.data;

                if (
                    paymentData && paymentData.status === 'PAID' &&
                    latestBooking && latestBooking.tripId === selectedTrip.id
                ) {
                    clearInterval(intervalId);
                    pollingIntervalRef.current = null;
                    navigateToTripChangeSuccess();
                }
            } catch (err) {
                console.error("Polling booking change status failed", err);
            }
        }, 2500);

        pollingIntervalRef.current = intervalId;

        return () => {
            clearInterval(intervalId);
            pollingIntervalRef.current = null;
        };
    }, [showPaymentModal, booking, selectedTrip]);

    // ── Actions ────────────────────────────────────────────────────────────────
    const handleConfirmCancel = async () => {
        if (!booking) return;
        if (!agreeTerms) {
            alert("Vui lòng đồng ý với chính sách hủy vé để tiếp tục.");
            return;
        }
        setSubmittingCancel(true);
        try {
            await bookingService.cancelBooking(booking.id, {
                reason: cancelReason,
                changedBy: "customer"
            });
            alert("Vé của bạn đã được hủy thành công!");
            navigate(ROUTES.MY_BOOKINGS);
        } catch (err: any) {
            console.error("Cancellation failed", err);
            alert(err.response?.data?.message || err.message || "Hủy vé thất bại. Vui lòng thử lại.");
        } finally {
            setSubmittingCancel(false);
        }
    };

    const handleConfirmSeatChange = async () => {
        if (!booking || !selectedSeat) return;
        if (booking.seats.length === 0) return;
        setSubmittingSeatChange(true);
        try {
            await bookingService.changeSeat(booking.id, {
                bookingSeatId: currentSeatToChange?.id || booking.seats[0].id,
                newSeatId: selectedSeat.seatId || '',
                newSeatNumber: selectedSeat.seatNumber,
                changedBy: "customer"
            });
            alert(`Đổi sang ghế ${selectedSeat.seatNumber} thành công!`);
            navigate(ROUTES.MY_BOOKINGS);
        } catch (err: any) {
            console.error("Seat change failed", err);
            alert(err.response?.data?.message || err.message || "Đổi ghế thất bại. Vui lòng thử lại.");
        } finally {
            setSubmittingSeatChange(false);
        }
    };

    const handleConfirmTripChange = async () => {
        if (!booking || !selectedTrip || !selectedTripSeat) return;
        setSubmittingTripChange(true);
        try {
            await bookingService.changeTrip(booking.id, {
                newTripId: selectedTrip.id,
                seats: [{
                    seatId: selectedTripSeat.seatId || '',
                    seatNumber: selectedTripSeat.seatNumber,
                    price: selectedTrip.prices?.[0]?.finalPrice || selectedTrip.prices?.[0]?.basePrice || 0
                }],
                changedBy: "customer"
            });
            
            // Check if there is a price difference
            const oldTotalAmount = booking.totalAmount || 0;
            const newPrice = selectedTrip.prices?.[0]?.finalPrice || selectedTrip.prices?.[0]?.basePrice || 0;
            const priceDiff = newPrice - oldTotalAmount;
            
            if (priceDiff > 0) {
                // Reset hasNavigatedRef for safety
                hasNavigatedRef.current = false;
                
                let attempts = 0;
                let checkoutUrl = null;
                
                // Poll payments endpoint up to 10 times (~12 seconds total) to be extra resilient
                while (attempts < 10) {
                    await new Promise(resolve => setTimeout(resolve, 1200));
                    try {
                        const paymentRes = await paymentService.getPaymentByBookingId(booking.id);
                        const paymentData = paymentRes.data.result || paymentRes.data.data || paymentRes.data;
                        if (paymentData && paymentData.checkoutUrl) {
                            checkoutUrl = paymentData.checkoutUrl;
                            break;
                        }
                    } catch (e) {
                        console.log("Polling payment link...", e);
                    }
                    attempts++;
                }
                
                if (checkoutUrl) {
                    // Open the embedded PayOS payment modal and launch the SDK iframe!
                    setPaymentUrl(checkoutUrl);
                    setShowPaymentModal(true);
                    
                    setTimeout(() => {
                        const payosInstance = (window as any).PayOSCheckout;
                        if (payosInstance) {
                            const config = {
                                RETURN_URL: "http://localhost:3000/payments/return",
                                ELEMENT_ID: "embedded-payment-container",
                                CHECKOUT_URL: checkoutUrl,
                                embedded: true,
                                onSuccess: async (event: any) => {
                                    console.log("PayOS SDK onSuccess event:", event);
                                    try {
                                        await paymentService.confirmPaymentSuccess(
                                            booking.id,
                                            event.paymentLinkId || 'txn-ref'
                                        );

                                        // Synchronously confirm booking and finalize reschedule
                                        await bookingService.confirmBooking(booking.id, {
                                            transactionRef: event.paymentLinkId || 'txn-ref',
                                            provider: 'PAYOS'
                                        });
                                        console.log("Backend confirm and finalize OK.");
                                    } catch (e) {
                                        console.error("Failed to confirm success on backend", e);
                                    }
                                },
                                onCancel: () => {
                                    console.log("PayOS SDK onCancel: user cancelled payment");
                                }
                            };
                            try {
                                const { open } = payosInstance.usePayOS(config);
                                open();

                                // Hide loading spinner after iframe mounts so the QR is completely visible
                                setTimeout(() => {
                                    const spinner = document.querySelector("#embedded-payment-container .loading-spinner-wrapper");
                                    if (spinner) {
                                        (spinner as HTMLElement).style.display = 'none';
                                    }
                                }, 1800);
                            } catch (sdkError) {
                                console.error("SDK open failed, redirecting instead", sdkError);
                                window.location.href = checkoutUrl;
                            }
                        } else {
                            // Fallback if SDK is not loaded
                            window.location.href = checkoutUrl;
                        }
                    }, 300);
                } else {
                    alert("Không thể tải cổng thanh toán chênh lệch. Vui lòng kiểm tra và thanh toán lại trong phần Vé của tôi.");
                    navigate(ROUTES.MY_BOOKINGS);
                }
            } else {
                alert("Đổi chuyến xe mới thành công!");
                navigate(ROUTES.MY_BOOKINGS);
            }
        } catch (err: any) {
            console.error("Trip change failed", err);
            alert(err.response?.data?.message || err.message || "Đổi chuyến thất bại. Vui lòng thử lại.");
        } finally {
            setSubmittingTripChange(false);
        }
    };

    // ── Rendering Helpers ────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!booking || !trip) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
                <span className="material-symbols-outlined text-6xl text-outline">error_outline</span>
                <h2 className="text-xl font-bold text-on-surface">Không tìm thấy vé hợp lệ</h2>
                <button onClick={() => navigate(ROUTES.MY_BOOKINGS)} className="px-6 py-2 bg-primary text-on-primary rounded-xl">
                    Quay lại vé của tôi
                </button>
            </div>
        );
    }

    const fmtPrice = (n: number) => `${n.toLocaleString('vi-VN')}₫`;
    const fmtTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

    const renderSeatGrid = (
        seatsList: SeatInfo[], 
        isCurrentSeatFn: (seat: SeatInfo) => boolean,
        isSelectedFn: (seat: SeatInfo) => boolean,
        onSelectSeatFn: (seat: SeatInfo) => void,
        showCurrentIndicator = false
    ) => {
        if (!seatsList || seatsList.length === 0) return null;
        
        // Deduplicate seats by seatNumber to prevent database duplicate rows from breaking the UI
        const dedupedSeatsMap = new Map<string, SeatInfo>();
        for (const s of seatsList) {
            const existing = dedupedSeatsMap.get(s.seatNumber);
            if (!existing || (s.seatId && s.seatId.startsWith('50000000'))) {
                dedupedSeatsMap.set(s.seatNumber, s);
            }
        }
        const dedupedSeats = Array.from(dedupedSeatsMap.values());

        const floors = Array.from(new Set(dedupedSeats.map((s: any) => s.floor || 1))).sort((a: any, b: any) => a - b);
        
        return (
            <div className={`grid gap-6 w-full ${floors.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {floors.map((floor: any) => {
                    const floorSeats = dedupedSeats.filter((s: any) => (s.floor || 1) === floor);
                    const maxCol = Math.max(...floorSeats.map((s: any) => s.columnNumber || 3), 3);
                    const maxRow = Math.max(...floorSeats.map((s: any) => s.rowNumber || 4), 2);
                    const floorAvail = floorSeats.filter((s: any) => s.status === 'AVAILABLE').length;

                    const seatGrid = new Map<string, SeatInfo>();
                    for (const s of floorSeats) {
                        const r = s.rowNumber || Math.ceil(parseInt(s.seatNumber.replace(/\D/g, ''), 10) / 3) || 1;
                        const c = s.columnNumber || ((parseInt(s.seatNumber.replace(/\D/g, ''), 10) - 1) % 3) + 1;
                        seatGrid.set(`${r}-${c}`, s);
                    }

                    return (
                        <div key={floor} className="bg-white p-5 rounded-2xl border border-orange-100/50 shadow-sm relative text-center">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                                <h4 className="font-bold text-xs text-[#261813] uppercase tracking-wider">
                                    {floors.length > 1 ? `Tầng ${floor}` : 'Sơ đồ ghế'}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                    {floorAvail}/{floorSeats.length} ghế trống
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-[9px] uppercase tracking-widest text-slate-300 mb-4">Đầu xe</h3>
                            
                            <div
                                className="gap-2.5 mx-auto"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))`,
                                    maxWidth: `${Math.min(maxCol * 54, 280)}px`,
                                }}
                            >
                                {Array.from({ length: maxRow }, (_, r) =>
                                    Array.from({ length: maxCol }, (_, c) => {
                                        const row = r + 1;
                                        const col = c + 1;
                                        const seat = seatGrid.get(`${row}-${col}`);
                                        if (!seat) {
                                            return <div key={`empty-${floor}-${row}-${col}`} className="h-10" />;
                                        }
                                        
                                        const isCurrent = isCurrentSeatFn(seat);
                                        const isSelected = isSelectedFn(seat);
                                        const isHeld = ['HELD', 'LOCKED'].includes((seat.status || '').toUpperCase());
                                        const isSold = seat.status !== 'AVAILABLE' && !isCurrent && !isHeld;

                                        let btnClass = 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:bg-orange-50/20';
                                        if (isCurrent) {
                                            btnClass = 'border-primary/40 bg-orange-100/40 text-primary font-bold shadow-inner';
                                        } else if (isHeld) {
                                            btnClass = 'border-orange-400 bg-orange-50/50 text-orange-600 cursor-not-allowed';
                                        } else if (isSold) {
                                            btnClass = 'border-slate-100 bg-slate-100 text-slate-300 cursor-not-allowed';
                                        } else if (isSelected) {
                                            btnClass = 'border-primary bg-primary text-white scale-105 shadow-md shadow-orange-500/10';
                                        }

                                        return (
                                            <button
                                                key={`${floor}-${seat.seatId || seat.seatNumber}`}
                                                disabled={isSold || isHeld || isCurrent}
                                                onClick={() => onSelectSeatFn(seat)}
                                                className={`h-11 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all duration-200 ${btnClass} cursor-pointer`}
                                            >
                                                <span>{seat.seatNumber}</span>
                                                {isCurrent && showCurrentIndicator && (
                                                    <span className="text-[8px] font-normal opacity-85 mt-0.5">Hiện tại</span>
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col relative overflow-x-hidden">
            <Header />
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

            <main className="flex-grow pt-32 pb-24 px-4 relative z-10 max-w-[800px] mx-auto w-full">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-container-low text-primary mb-4 shadow-[0_8px_20px_rgba(92,64,51,0.08)]">
                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">Huỷ / Đổi vé</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">Vui lòng chọn thao tác bạn muốn thực hiện cho chuyến đi sắp tới.</p>
                </div>

                {/* Ticket Card Details */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_20px_rgba(92,64,51,0.05)] mb-10 overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary"></div>
                    <div className="p-6 pl-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Vé hiện tại</p>
                                <h3 className="font-headline-md text-headline-md text-on-background flex items-center gap-1.5">
                                    {trip.route?.originCityName}
                                    <span className="material-symbols-outlined text-sm align-middle text-primary">arrow_forward</span>
                                    {trip.route?.destinationCityName}
                                </h3>
                            </div>
                            <div className="bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant">
                                <span className="font-label-sm text-label-sm text-primary uppercase">Mã vé: {booking.bookingCode}</span>
                            </div>
                        </div>
                        <div className="border-t border-dashed border-outline-variant pt-4 flex flex-wrap gap-y-4 gap-x-8">
                            <div>
                                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase">Thời gian</p>
                                <p className="font-body-md text-body-md text-on-background font-medium">{fmtTime(trip.departureDatetime)}, {fmtDate(trip.departureDatetime)}</p>
                            </div>
                            <div>
                                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase">Ghế</p>
                                <p className="font-body-md text-body-md text-on-background font-medium">
                                    {booking.seats?.map(s => s.seatNumberSnapshot).join(', ')}
                                </p>
                            </div>
                            <div>
                                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase">Tổng tiền</p>
                                <p className="font-body-md text-body-md text-primary font-bold">{fmtPrice(booking.totalAmount)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flow Tabs */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <button
                        onClick={() => setActionType('cancel')}
                        className={`flex flex-col items-center p-5 rounded-xl border transition-all ${
                            actionType === 'cancel'
                                ? 'bg-surface-container-lowest border-2 border-primary shadow-[0_8px_20px_rgba(92,64,51,0.1)]'
                                : 'bg-surface-container-lowest border-outline-variant hover:border-primary/50'
                        }`}
                    >
                        <span className="material-symbols-outlined text-3xl mb-2 text-error">cancel</span>
                        <h4 className="font-semibold text-sm">Hủy vé</h4>
                    </button>

                    <button
                        onClick={() => !hasSeatChanged && setActionType('change_seat')}
                        disabled={hasSeatChanged}
                        title={hasSeatChanged ? 'Bạn đã đổi ghế 1 lần. Không thể đổi thêm.' : undefined}
                        className={`flex flex-col items-center p-5 rounded-xl border transition-all relative ${
                            hasSeatChanged
                                ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
                                : actionType === 'change_seat'
                                    ? 'bg-surface-container-lowest border-2 border-primary shadow-[0_8px_20px_rgba(92,64,51,0.1)]'
                                    : 'bg-surface-container-lowest border-outline-variant hover:border-primary/50'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-3xl mb-2 ${hasSeatChanged ? 'text-slate-300' : 'text-primary'}`}>chair</span>
                        <h4 className={`font-semibold text-sm ${hasSeatChanged ? 'text-slate-400' : ''}`}>Đổi ghế</h4>
                        {hasSeatChanged && (
                            <span className="text-[10px] text-slate-400 mt-1 leading-tight">Đã đổi 1 lần</span>
                        )}
                    </button>

                    <button
                        onClick={() => setActionType('change_trip')}
                        className={`flex flex-col items-center p-5 rounded-xl border transition-all ${
                            actionType === 'change_trip'
                                ? 'bg-surface-container-lowest border-2 border-primary shadow-[0_8px_20px_rgba(92,64,51,0.1)]'
                                : 'bg-surface-container-lowest border-outline-variant hover:border-primary/50'
                        }`}
                    >
                        <span className="material-symbols-outlined text-3xl mb-2 text-secondary">sync_alt</span>
                        <h4 className="font-semibold text-sm">Đổi chuyến</h4>
                    </button>
                </div>

                {/* ── FLOW A: CANCELLATION ────────────────────────────────────────── */}
                {actionType === 'cancel' && (
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_20px_rgba(92,64,51,0.05)] p-6 md:p-8 text-left">
                        <h2 className="font-headline-md text-headline-md text-on-background border-b border-outline-variant pb-4 mb-6">Chính sách hoàn tiền</h2>

                        {/* Refund Timeline */}
                        <div className="mb-8 relative pt-2">
                            <div className="absolute left-0 right-0 top-5 h-1 bg-outline-variant rounded-full"></div>
                            <div className="absolute left-0 top-5 h-1 bg-primary rounded-full" style={{ width: refundPercent === 100 ? '10%' : refundPercent === 70 ? '50%' : '90%' }}></div>
                            <div className="flex justify-between relative z-10">
                                <div className="flex flex-col items-center text-center w-1/3">
                                    <div className={`w-6 h-6 rounded-full border-4 border-surface-container-lowest mb-2 flex items-center justify-center relative ${refundPercent === 100 ? 'bg-primary' : 'bg-surface-variant'}`}>
                                        {refundPercent === 100 && <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50"></div>}
                                    </div>
                                    <p className="font-body-md text-body-md text-on-background font-medium">Hoàn 100%</p>
                                    <p className="font-label-sm text-label-sm text-on-surface-variant">Trước 24h</p>
                                </div>
                                <div className="flex flex-col items-center text-center w-1/3">
                                    <div className={`w-6 h-6 rounded-full border-4 border-surface-container-lowest mb-2 flex items-center justify-center relative ${refundPercent === 70 ? 'bg-primary' : 'bg-surface-variant'}`}>
                                        {refundPercent === 70 && <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50"></div>}
                                    </div>
                                    <p className="font-body-md text-body-md text-on-background font-medium">Hoàn 70%</p>
                                    <p className="font-label-sm text-label-sm text-on-surface-variant">Trước 12h</p>
                                </div>
                                <div className="flex flex-col items-center text-center w-1/3">
                                    <div className={`w-6 h-6 rounded-full border-4 border-surface-container-lowest mb-2 flex items-center justify-center relative ${refundPercent === 0 ? 'bg-primary' : 'bg-surface-variant'}`}>
                                        {refundPercent === 0 && <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50"></div>}
                                    </div>
                                    <p className="font-body-md text-body-md text-on-background font-medium">Không hoàn</p>
                                    <p className="font-label-sm text-label-sm text-on-surface-variant">Dưới 12h</p>
                                </div>
                            </div>
                        </div>

                        {/* Refund Summary Box */}
                        <div className="bg-[#FFF4ED] border border-primary/20 rounded-lg p-4 flex items-center justify-center mb-8">
                            <span className="material-symbols-outlined text-primary mr-2">account_balance_wallet</span>
                            <span className="font-body-lg text-body-lg text-on-background">
                                Số tiền bạn được hoàn: <strong className="text-primary font-bold">{fmtPrice(refundAmount)} ({refundPercent}%)</strong>
                            </span>
                        </div>

                        {/* Reason radio list */}
                        <h3 className="font-body-lg text-body-lg text-on-background font-medium mb-4">Lý do huỷ vé (Bắt buộc)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {['Thay đổi kế hoạch / Lịch trình', 'Đặt sai thông tin chuyến đi', 'Tìm được phương tiện khác', 'Lý do khác'].map((reason) => (
                                <label key={reason} className="flex items-start p-4 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors">
                                    <input
                                        type="radio"
                                        name="cancel_reason"
                                        value={reason}
                                        checked={cancelReason === reason}
                                        onChange={() => setCancelReason(reason)}
                                        className="mt-1 text-primary focus:ring-primary h-4 w-4"
                                    />
                                    <span className="ml-3 font-body-md text-body-md text-on-background">{reason}</span>
                                </label>
                            ))}
                        </div>

                        {/* Important Warning Banner */}
                        <div className="bg-[#FFF5F5] border border-error/20 rounded-lg p-4 mb-8">
                            <div className="flex items-start">
                                <span className="material-symbols-outlined text-error mr-3 mt-0.5">warning</span>
                                <div>
                                    <p className="font-body-md text-body-md text-on-background font-medium mb-2">Lưu ý quan trọng</p>
                                    <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-3">Hành động này không thể hoàn tác. Tiền sẽ được hoàn lại về tài khoản ngân hàng của bạn trong vòng 3-5 ngày làm việc.</p>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={agreeTerms}
                                            onChange={(e) => setAgreeTerms(e.target.checked)}
                                            className="text-error focus:ring-error rounded h-4 w-4"
                                        />
                                        <span className="ml-2 font-body-md text-body-md text-on-background text-sm">Tôi đã đọc và đồng ý với chính sách hủy vé.</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-between items-center">
                            <button onClick={() => navigate(ROUTES.MY_BOOKINGS)} className="px-6 py-3 rounded-lg font-body-md text-body-md font-medium text-on-surface-variant bg-surface border border-outline-variant hover:bg-surface-container-low transition-colors">
                                Quay lại
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                disabled={submittingCancel}
                                className="px-8 py-3 rounded-lg font-body-md text-body-md font-medium text-white bg-[#C62828] hover:bg-[#B71C1C] disabled:opacity-50 transition-colors flex items-center shadow-[0_4px_10px_rgba(198,40,40,0.3)] cursor-pointer"
                            >
                                <span className="material-symbols-outlined mr-2 text-sm">delete</span>
                                {submittingCancel ? 'Đang hủy...' : 'Xác nhận huỷ vé'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── FLOW B: CHANGE SEAT ─────────────────────────────────────────── */}
                {actionType === 'change_seat' && (
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_20px_rgba(92,64,51,0.05)] p-6 md:p-8 text-left">
                        <h2 className="font-headline-md text-headline-md text-on-background border-b border-outline-variant pb-4 mb-6">Chọn ghế muốn đổi</h2>

                        {loadingSeats ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {booking.seats && booking.seats.length > 1 && (
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                                        <p className="font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-3">Bạn muốn đổi ghế nào trong vé của bạn?</p>
                                        <div className="flex flex-wrap gap-3">
                                            {booking.seats.map((seat) => {
                                                const isCurrentSelected = currentSeatToChange?.id === seat.id;
                                                return (
                                                    <button
                                                        key={seat.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setCurrentSeatToChange(seat);
                                                            setSelectedSeat(null);
                                                        }}
                                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                            isCurrentSelected
                                                                ? 'border-primary bg-primary text-white shadow-sm'
                                                                : 'border-slate-200 bg-white text-slate-700 hover:border-primary/50'
                                                        }`}
                                                    >
                                                        Đổi ghế: {seat.seatNumberSnapshot}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <p className="text-sm text-on-surface-variant">Chọn một ghế trống dưới đây để thay thế cho ghế {currentSeatToChange ? `hiện tại của bạn (${currentSeatToChange.seatNumberSnapshot})` : 'hiện tại của bạn'}.</p>

                                {/* Seat Map Diagram */}
                                <div className="flex justify-center w-full">
                                    <div className="max-w-[600px] w-full bg-slate-50/50 border border-slate-100 rounded-3xl p-6">
                                        {renderSeatGrid(
                                            seatMap,
                                            (seat) => !!booking.seats?.some(s => s.seatNumberSnapshot === seat.seatNumber),
                                            (seat) => selectedSeat?.seatNumber === seat.seatNumber,
                                            (seat) => setSelectedSeat(seat),
                                            true
                                        )}
                                        <div className="mt-6 flex justify-center gap-6 text-xs text-slate-500 border-t border-slate-100 pt-4">
                                            <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-white border border-slate-200 rounded-md"></span>Trống</div>
                                            <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-slate-100 border border-slate-100 rounded-md"></span>Đã đặt</div>
                                            <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-orange-100/40 border border-primary/20 rounded-md"></span>Hiện tại</div>
                                            <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-primary rounded-md"></span>Chọn</div>
                                        </div>
                                    </div>
                                </div>

                                {selectedSeat && (
                                    <div className="bg-[#FFF4ED] border border-primary/20 rounded-lg p-4 text-center">
                                        <p className="text-on-background font-medium">
                                            Bạn đã chọn đổi ghế <strong className="text-primary text-base">{currentSeatToChange?.seatNumberSnapshot || booking.seats[0]?.seatNumberSnapshot}</strong> sang ghế mới: <strong className="text-primary text-lg">{selectedSeat.seatNumber}</strong>
                                        </p>
                                        <p className="text-xs text-on-surface-variant mt-1">Phí đổi ghế: <span className="text-green-600 font-bold">Miễn phí</span></p>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex justify-between items-center border-t border-outline-variant pt-6">
                                    <button onClick={() => navigate(ROUTES.MY_BOOKINGS)} className="px-6 py-3 rounded-lg font-body-md text-body-md font-medium text-on-surface-variant bg-surface border border-outline-variant hover:bg-surface-container-low transition-colors">
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handleConfirmSeatChange}
                                        disabled={submittingSeatChange || !selectedSeat}
                                        className="px-8 py-3 rounded-lg font-body-md text-body-md font-medium text-white bg-primary hover:bg-[#c84d04] disabled:opacity-50 transition-colors flex items-center shadow-[0_4px_10px_rgba(244,96,12,0.3)] cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined mr-2 text-sm">sync_alt</span>
                                        {submittingSeatChange ? 'Đang đổi...' : 'Xác nhận đổi ghế'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── FLOW C: CHANGE TRIP ─────────────────────────────────────────── */}
                {actionType === 'change_trip' && (
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_20px_rgba(92,64,51,0.05)] p-6 md:p-8 text-left">
                        <h2 className="font-headline-md text-headline-md text-on-background border-b border-outline-variant pb-4 mb-6">Chọn chuyến đi mới</h2>

                        {loadingOtherTrips ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-sm text-on-surface-variant">Chọn một chuyến xe khác trong danh sách chuyến đi của cùng tuyến đường:</p>

                                {/* Trip List Selector */}
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 border rounded-xl p-4 bg-slate-50">
                                    {otherTrips.length === 0 ? (
                                        <p className="text-center py-6 text-slate-500 text-sm">Không tìm thấy chuyến xe nào khác có sẵn.</p>
                                    ) : (
                                        otherTrips.map((otherTrip) => {
                                            const tripPrice = otherTrip.prices?.[0]?.finalPrice || otherTrip.prices?.[0]?.basePrice || 0;
                                            const priceDiff = tripPrice - baseAmount;
                                            const isSelected = selectedTrip?.id === otherTrip.id;

                                            return (
                                                <div
                                                    key={otherTrip.id}
                                                    onClick={() => { setSelectedTrip(otherTrip); setSelectedTripSeat(null); }}
                                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer bg-white ${
                                                        isSelected ? 'border-primary shadow-sm bg-orange-50/10' : 'border-outline-variant hover:border-primary/40'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center text-left">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-base text-slate-800">{fmtTime(otherTrip.departureDatetime)}</span>
                                                                <span className="text-slate-400 text-xs">&rarr;</span>
                                                                <span className="text-slate-600 text-sm">{fmtTime(otherTrip.arrivalDatetime)}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-1">{fmtDate(otherTrip.departureDatetime)}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">{otherTrip.vehicle?.vehicleTypeName} &bull; {otherTrip.availableSeats} ghế trống</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-bold text-slate-800 text-base">{fmtPrice(tripPrice)}</span>
                                                            <p className={`text-xs font-bold mt-1 ${priceDiff > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                                {priceDiff > 0 ? `+${fmtPrice(priceDiff)} chênh lệch` : 'Miễn phí đổi'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Step 2: Select Seat on the New Trip */}
                                {selectedTrip && (
                                    <div className="border-t border-outline-variant pt-6">
                                        <h3 className="font-bold text-base text-on-background mb-4">Chọn ghế ngồi trên chuyến mới</h3>

                                        {loadingTripSeats ? (
                                            <div className="flex justify-center py-6">
                                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-6 w-full">
                                                <div className="max-w-[600px] w-full bg-slate-50/50 border border-slate-100 rounded-3xl p-6">
                                                    {renderSeatGrid(
                                                        tripSeatMap,
                                                        () => false,
                                                        (seat) => selectedTripSeat?.seatNumber === seat.seatNumber,
                                                        (seat) => setSelectedTripSeat(seat),
                                                        false
                                                    )}
                                                    <div className="mt-6 flex justify-center gap-6 text-xs text-slate-500 border-t border-slate-100 pt-4">
                                                        <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-white border border-slate-200 rounded-md"></span>Trống</div>
                                                        <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-slate-100 border border-slate-100 rounded-md"></span>Đã đặt</div>
                                                        <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-primary rounded-md"></span>Chọn</div>
                                                    </div>
                                                </div>

                                                {selectedTripSeat && (
                                                    <div className="bg-[#FFF4ED] border border-primary/20 rounded-lg p-4 w-full text-center">
                                                        <p className="text-on-background font-medium">
                                                            Ghế đã chọn: <strong className="text-primary text-lg">{selectedTripSeat.seatNumber}</strong>
                                                        </p>
                                                        <p className="text-xs text-on-surface-variant mt-1">Chuyến xe: <strong>{fmtTime(selectedTrip.departureDatetime)} - {fmtDate(selectedTrip.departureDatetime)}</strong></p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex justify-between items-center border-t border-outline-variant pt-6">
                                    <button onClick={() => navigate(ROUTES.MY_BOOKINGS)} className="px-6 py-3 rounded-lg font-body-md text-body-md font-medium text-on-surface-variant bg-surface border border-outline-variant hover:bg-surface-container-low transition-colors">
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handleConfirmTripChange}
                                        disabled={submittingTripChange || !selectedTrip || !selectedTripSeat}
                                        className="px-8 py-3 rounded-lg font-body-md text-body-md font-medium text-white bg-primary hover:bg-[#c84d04] disabled:opacity-50 transition-colors flex items-center shadow-[0_4px_10px_rgba(244,96,12,0.3)] cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined mr-2 text-sm">sync</span>
                                        {submittingTripChange ? 'Đang đổi...' : 'Xác nhận đổi chuyến'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* PayOS Embedded Payment Modal for Fare Difference */}
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
                                    <h3 className="font-bold text-base text-[#261813] tracking-tight">Thanh toán chênh lệch</h3>
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
                                            {booking?.bookingCode}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-white/70 uppercase tracking-widest font-semibold">Hành khách</p>
                                        <p className="font-bold text-sm mt-1 truncate max-w-[160px]">{booking?.customerName}</p>
                                    </div>
                                </div>
                                
                                <div className="border-t border-white/20 my-3 border-dashed relative z-10" />
                                
                                <div className="flex justify-between items-end relative z-10">
                                    <div>
                                        <p className="text-[9px] text-white/70 uppercase tracking-widest font-semibold">Chuyến xe mới</p>
                                        <div className="flex items-center gap-1.5 mt-1 bg-white/15 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-xs">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            Ghế {selectedTripSeat?.seatNumber} &bull; {selectedTrip && fmtTime(selectedTrip.departureDatetime)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-white/70 uppercase tracking-widest font-semibold">Phần chênh lệch cần trả</p>
                                        <p className="text-xl font-extrabold tracking-tight mt-0.5 text-yellow-300 drop-shadow-xs">
                                            {selectedTrip && fmtPrice((selectedTrip.prices?.[0]?.finalPrice || selectedTrip.prices?.[0]?.basePrice || 0) - (booking?.totalAmount || 0))}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Embedded container where PayOS Checkout SDK renders the iframe */}
                            <div id="embedded-payment-container" className="relative w-full h-[400px] bg-slate-50/80 border border-slate-100 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                                <div className="loading-spinner-wrapper flex flex-col items-center gap-3 text-slate-400">
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
