import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/user-service/useAuth';
import { ROUTES } from '../../constants/routes';
import { bookingService } from '../../services/booking-service/bookingService';
import { publicTripService } from '../../services/trip-service/publicTripService';
import { paymentService } from '../../services/payment-service/paymentService';

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';
export type TabFilter = 'all' | BookingStatus;

export interface Booking {
  id: string;
  realId?: string;
  status: BookingStatus;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  operator: string;
  seatInfo: string;
  totalPrice: string;
  rawBookingStatus?: string;
  rawPaymentStatus?: string;
  rawBooking?: any;
}

export const MOCK_BOOKINGS: Booking[] = [
  {
    id:            '#VN18392',
    status:        'upcoming',
    origin:        'Hà Nội',
    destination:   'TP.HCM',
    departureTime: '07:00',
    arrivalTime:   '14:30',
    date:          '21/05/2026',
    operator:      'Hải Vân Limousine',
    seatInfo:      '1 Giường nằm',
    totalPrice:    '850.000đ',
  },
  {
    id:            '#VN09211',
    status:        'completed',
    origin:        'Đà Nẵng',
    destination:   'Huế',
    departureTime: '15:00',
    arrivalTime:   '18:00',
    date:          '10/04/2026',
    operator:      'Phượng Hoàng',
    seatInfo:      '2 Ghế ngồi',
    totalPrice:    '320.000đ',
  },
  {
    id:            '#VN07743',
    status:        'cancelled',
    origin:        'TP.HCM',
    destination:   'Đà Lạt',
    departureTime: '09:00',
    arrivalTime:   '15:00',
    date:          '05/03/2026',
    operator:      'Phương Trang',
    seatInfo:      '2 Ghế ngồi',
    totalPrice:    '240.000đ',
  },
];

export const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; barColor: string; badgeBg: string; badgeColor: string; opacity: string }
> = {
  upcoming:  { label: 'Sắp khởi hành', barColor: '#feb246', badgeBg: '#fee3d9', badgeColor: '#5a4137',  opacity: '1' },
  completed: { label: 'Đã hoàn thành', barColor: '#A8BCA1', badgeBg: '#ffe9e2', badgeColor: '#5a4137',  opacity: '0.75' },
  cancelled: { label: 'Đã hủy',        barColor: '#ba1a1a', badgeBg: '#ffdad6', badgeColor: '#93000a', opacity: '0.65' },
};

export const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all',       label: 'Tất cả'         },
  { key: 'upcoming',  label: 'Sắp khởi hành'  },
  { key: 'completed', label: 'Đã hoàn thành'  },
  { key: 'cancelled', label: 'Đã hủy'         },
];

export const SIDEBAR_NAV = [
  { label: 'Thông tin cá nhân', icon: 'person',              to: ROUTES.PROFILE },
  { label: 'Vé của tôi',        icon: 'confirmation_number', to: ROUTES.MY_BOOKINGS, active: true },
];

export const useMyBookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 5;

  // Custom Detailed Filters
  const [bookingFilter, setBookingFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // PayOS Embedded Modal States & Refs for Unpaid Booking "Thanh toán ngay"
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [activeBookingForPayment, setActiveBookingForPayment] = useState<any>(null);
  const hasNavigatedRef = useRef(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingService.getBookingsByUser(user.id, currentPage, pageSize);
        const data = res.data.result || res.data.data;
        const rawList = data?.content || [];
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
        
        // Fetch trip details for all unique tripIds
        const uniqueTripIds = Array.from(new Set(rawList.map((b: any) => b.tripId))) as string[];
        const tripDetailsMap: Record<string, any> = {};
        
        await Promise.all(
          uniqueTripIds.map(async (tripId: string) => {
            try {
              const tripRes = await publicTripService.getTripById(tripId);
              const tripObj = tripRes.data.result || tripRes.data.data;
              if (tripObj) {
                tripDetailsMap[tripId] = tripObj;
              }
            } catch (err) {
              console.error("Failed to fetch trip details for " + tripId, err);
            }
          })
        );
        
        // Map raw bookings to UI Bookings
        const mappedList: Booking[] = rawList.map((b: any) => {
          const tripInfo = tripDetailsMap[b.tripId];
          const depTime = tripInfo?.departureDatetime 
            ? new Date(tripInfo.departureDatetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
            : '00:00';
          const arrTime = tripInfo?.arrivalDatetime 
            ? new Date(tripInfo.arrivalDatetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
            : '00:00';
          const depDate = tripInfo?.departureDatetime 
            ? new Date(tripInfo.departureDatetime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
            : '';
            
          let uiStatus: BookingStatus = 'upcoming';
          if (b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'EXPIRED') {
            uiStatus = 'cancelled';
          } else if (tripInfo?.departureDatetime && new Date(tripInfo.departureDatetime).getTime() < Date.now()) {
            uiStatus = 'completed';
          }
          
          return {
            id: b.bookingCode,
            realId: b.id, // Keep the real UUID for cancellation/change actions!
            status: uiStatus,
            origin: tripInfo?.route?.originCityName || '—',
            destination: tripInfo?.route?.destinationCityName || '—',
            departureTime: depTime,
            arrivalTime: arrTime,
            date: depDate,
            operator: [tripInfo?.vehicle?.brand, tripInfo?.vehicle?.model].filter(Boolean).join(' ') || 'Hãng Xe DiVeNha',
            seatInfo: `${b.seats?.map((s: any) => s.seatNumberSnapshot).join(', ')} (${b.seats?.length} vé)`,
            totalPrice: b.totalAmount > 0 ? `${b.totalAmount.toLocaleString('vi-VN')}đ` : '0đ',
            rawBookingStatus: b.bookingStatus,
            rawPaymentStatus: b.paymentStatus,
            rawBooking: b
          };
        });
        
        setBookings(mappedList);
      } catch (err) {
        console.error("Failed to load real bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user?.id, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTabChange = (tab: TabFilter) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  const handleBookingFilterChange = (filter: string) => {
    setBookingFilter(filter);
    setCurrentPage(0);
  };

  const handlePaymentFilterChange = (filter: string) => {
    setPaymentFilter(filter);
    setCurrentPage(0);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesTab = activeTab === 'all' || b.status === activeTab;
    const matchesBooking = bookingFilter === 'ALL' || b.rawBookingStatus === bookingFilter;
    const matchesPayment = paymentFilter === 'ALL' || b.rawPaymentStatus === paymentFilter;
    return matchesTab && matchesBooking && matchesPayment;
  });

  const nextTrip = bookings.find((b) => b.status === 'upcoming');

  const avatarInitials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'NT';

  const handleNavigateProfile = () => {
    navigate(ROUTES.PROFILE);
  };

  const handlePayNow = async (bookingCode: string) => {
    try {
      setLoading(true);
      const res = await bookingService.getBookingByCode(bookingCode);
      const bookingData = res.data.result || res.data.data;
      if (!bookingData) return;

      setActiveBookingForPayment(bookingData);
      hasNavigatedRef.current = false;

      let checkoutUrl = '';
      try {
        const payRes = await paymentService.getPaymentByBookingId(bookingData.id);
        const payData = payRes.data.result || payRes.data.data || payRes.data;
        if (payData && payData.checkoutUrl) {
          checkoutUrl = payData.checkoutUrl;
        }
      } catch (e) {
        console.log("No existing payment link, creating new one...", e);
      }

      if (!checkoutUrl) {
        const payRes = await paymentService.createPaymentLink({
          bookingId: bookingData.id,
          bookingCode: bookingData.bookingCode,
          amount: 10000, // 10k mock for scanning
          description: `Ve xe ${bookingData.bookingCode}`
        });
        const payData = payRes.data.result || payRes.data.data;
        checkoutUrl = payData?.checkoutUrl || '';
      }

      if (checkoutUrl) {
        setPaymentUrl(checkoutUrl);
        setShowPaymentModal(true);

        setTimeout(() => {
          const payosInstance = (window as any).PayOSCheckout;
          if (payosInstance) {
            const config = {
              RETURN_URL: window.location.origin,
              ELEMENT_ID: "embedded-payment-container",
              CHECKOUT_URL: checkoutUrl,
              embedded: true,
              onSuccess: async (event: any) => {
                console.log("PayOS SDK onSuccess event:", event);
                try {
                  await paymentService.confirmPaymentSuccess(
                    bookingData.id,
                    event.paymentLinkId || 'txn-ref'
                  );

                  // Synchronously confirm booking to bypass Kafka latency/failures
                  await bookingService.confirmBooking(bookingData.id, {
                    transactionRef: event.paymentLinkId || 'txn-ref',
                    provider: 'PAYOS'
                  });
                  console.log("Synchronous booking confirmation completed successfully.");
                } catch (e) {
                  console.error("confirmPaymentSuccess failed", e);
                }
              },
              onCancel: () => {
                console.log("PayOS SDK onCancel");
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
              console.error("SDK open failed, redirecting", sdkError);
              window.location.href = checkoutUrl;
            }
          } else {
            window.location.href = checkoutUrl;
          }
        }, 300);
      } else {
        alert("Không thể khởi tạo cổng thanh toán PayOS.");
      }
    } catch (err: any) {
      console.error("Failed to start payment", err);
      alert("Lỗi khởi tạo thanh toán: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClosePaymentModal = async () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    const snapshot = activeBookingForPayment;
    setShowPaymentModal(false);
    setActiveBookingForPayment(null);
    setPaymentUrl('');

    if (snapshot) {
      setLoading(true);
      try {
        // Query the server one final time to check if the payment actually succeeded
        const checkRes = await bookingService.getBookingByCode(snapshot.bookingCode);
        const latestBooking = checkRes.data.result || checkRes.data.data;
        
        if (
          latestBooking &&
          latestBooking.bookingStatus === 'CONFIRMED' &&
          latestBooking.paymentStatus === 'PAID'
        ) {
          alert("Thanh toán thành công! Vé xe của bạn đã được xác nhận.");
        } else {
          alert("Đã đóng trình thanh toán. Bạn có thể thực hiện thanh toán lại bất kỳ lúc nào trong mục 'Vé của tôi' trước khi vé hết hạn.");
        }
        window.location.reload();
      } catch (err) {
        console.error("Failed to check booking status on modal close:", err);
        // Fallback reload anyway to show latest status
        window.location.reload();
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!showPaymentModal || !activeBookingForPayment) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await bookingService.getBookingByCode(activeBookingForPayment.bookingCode);
        const latestBooking = res.data.result || res.data.data;

        if (
          latestBooking &&
          latestBooking.bookingStatus === 'CONFIRMED' &&
          latestBooking.paymentStatus === 'PAID'
        ) {
          clearInterval(intervalId);
          pollingIntervalRef.current = null;

          setShowPaymentModal(false);
          alert("Thanh toán thành công! Vé xe của bạn đã được xác nhận.");
          window.location.reload();
        }
      } catch (e) {
        console.error("Polling payment status failed", e);
      }
    }, 2500);

    pollingIntervalRef.current = intervalId;

    return () => {
      clearInterval(intervalId);
      pollingIntervalRef.current = null;
    };
  }, [showPaymentModal, activeBookingForPayment]);

  return {
    user,
    activeTab,
    setActiveTab: handleTabChange,
    filteredBookings,
    nextTrip,
    avatarInitials,
    handleNavigateProfile,
    TABS,
    SIDEBAR_NAV,
    MOCK_BOOKINGS: bookings,
    STATUS_CONFIG,
    loading,
    showPaymentModal,
    paymentUrl,
    activeBookingForPayment,
    handlePayNow,
    handleClosePaymentModal,
    currentPage,
    setCurrentPage: handlePageChange,
    totalPages,
    totalElements,
    bookingFilter,
    setBookingFilter: handleBookingFilterChange,
    paymentFilter,
    setPaymentFilter: handlePaymentFilterChange
  };
};
