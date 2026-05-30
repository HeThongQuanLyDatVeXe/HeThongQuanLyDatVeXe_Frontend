import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/layouts/AdminLayout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Alert } from '../components/common/Alert';
import { bookingService } from '../services/booking-service/bookingService';
import { adminTripService } from '../services/trip-service/adminTripService';
import { publicTripService } from '../services/trip-service/publicTripService';
import type { BookingResponse, BookingHistoryResponse, TicketResponse, BookingSeatResponse } from '../services/booking-service/bookingService';
import type { TripResponse, SeatInfo } from '../types/trip-service/Trip';

export const AdminBookingsPage: React.FC = () => {
  // --- State for Bookings List ---
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Search, filter and pagination
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>(''); // empty means All
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 10;

  // Selected booking for detail view
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [bookingHistories, setBookingHistories] = useState<Record<string, BookingHistoryResponse[]>>({});
  const [bookingTickets, setBookingTickets] = useState<Record<string, TicketResponse[]>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

  // --- Modals State ---
  // Cancel Booking
  const [cancelTarget, setCancelTarget] = useState<BookingResponse | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Yêu cầu từ khách hàng');
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);

  // Change Seat
  const [changeSeatTarget, setChangeSeatTarget] = useState<{ booking: BookingResponse; seat: BookingSeatResponse } | null>(null);
  const [availableSeats, setAvailableSeats] = useState<SeatInfo[]>([]);
  const [loadingSeatMap, setLoadingSeatMap] = useState<boolean>(false);
  const [selectedNewSeat, setSelectedNewSeat] = useState<SeatInfo | null>(null);
  const [changeSeatLoading, setChangeSeatLoading] = useState<boolean>(false);
  const [seatDeck, setSeatDeck] = useState<'lower' | 'upper'>('lower');

  // Change Trip
  const [changeTripTarget, setChangeTripTarget] = useState<BookingResponse | null>(null);
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [loadingTrips, setLoadingTrips] = useState<boolean>(false);
  const [tripSearch, setTripSearch] = useState<string>('');
  const [selectedNewTrip, setSelectedNewTrip] = useState<TripResponse | null>(null);
  const [newTripSeats, setNewTripSeats] = useState<SeatInfo[]>([]);
  const [loadingNewTripSeats, setLoadingNewTripSeats] = useState<boolean>(false);
  const [newTripDeck, setNewTripDeck] = useState<'lower' | 'upper'>('lower');
  // Maps oldBookingSeatId -> newSeatInfo
  const [seatAssignments, setSeatAssignments] = useState<Record<string, SeatInfo>>({});
  const [currentlyMappingSeatId, setCurrentlyMappingSeatId] = useState<string | null>(null);
  const [changeTripLoading, setChangeTripLoading] = useState<boolean>(false);

  // Success/Error Alerts
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active dropdown for options menu
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // --- Fetch Bookings ---
  const fetchBookings = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await bookingService.getAllBookings(
        search || undefined,
        statusFilter || undefined,
        currentPage,
        pageSize
      );
      const data = res.data?.result;
      if (data) {
        setBookings(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch bookings', err);
      setErrorMsg('Không thể tải danh sách đặt vé. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter]);

  // Debounced search on enter/submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchBookings();
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCurrentPage(0);
  };

  // --- Expand Booking Details (History & Tickets) ---
  const toggleExpandBooking = async (booking: BookingResponse) => {
    const isCurrentlyExpanded = expandedBookingId === booking.id;
    if (isCurrentlyExpanded) {
      setExpandedBookingId(null);
      return;
    }

    setExpandedBookingId(booking.id);
    
    // Skip fetching if already loaded
    if (bookingHistories[booking.id] && bookingTickets[booking.id]) {
      return;
    }

    setLoadingDetails(prev => ({ ...prev, [booking.id]: true }));
    try {
      const [historyRes, ticketsRes] = await Promise.all([
        bookingService.getBookingHistory(booking.id),
        bookingService.getTickets(booking.id)
      ]);
      
      if (historyRes.data?.result) {
        setBookingHistories(prev => {
          const next = { ...prev };
          next[booking.id] = historyRes.data.result!;
          return next;
        });
      }
      if (ticketsRes.data?.result) {
        setBookingTickets(prev => {
          const next = { ...prev };
          next[booking.id] = ticketsRes.data.result!;
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to fetch details for booking ' + booking.id, err);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [booking.id]: false }));
    }
  };

  // --- Hủy Đặt Vé Actions ---
  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await bookingService.cancelBooking(cancelTarget.id, {
        reason: cancelReason,
        changedBy: 'Admin Override'
      });
      setAlert({ type: 'success', message: `Hủy thành công vé ${cancelTarget.bookingCode}!` });
      setCancelTarget(null);
      // Reload details
      fetchBookings();
    } catch (err: any) {
      console.error(err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Có lỗi xảy ra khi hủy đặt vé.' });
    } finally {
      setCancelLoading(false);
    }
  };

  // --- Đổi Ghế Actions ---
  const openChangeSeatModal = async (booking: BookingResponse, seat: BookingSeatResponse) => {
    setChangeSeatTarget({ booking, seat });
    setSelectedNewSeat(null);
    setAvailableSeats([]);
    setLoadingSeatMap(true);
    try {
      const res = await publicTripService.getSeatMap(booking.tripId);
      if (res.data?.result?.seats) {
        setAvailableSeats(res.data.result.seats);
      }
    } catch (err) {
      console.error('Failed to fetch seat map', err);
    } finally {
      setLoadingSeatMap(false);
    }
  };

  const handleChangeSeat = async () => {
    if (!changeSeatTarget || !selectedNewSeat) return;
    setChangeSeatLoading(true);
    try {
      await bookingService.changeSeat(changeSeatTarget.booking.id, {
        bookingSeatId: changeSeatTarget.seat.id,
        newSeatId: selectedNewSeat.seatId || '',
        newSeatNumber: selectedNewSeat.seatNumber,
        changedBy: 'Admin Override'
      });
      setAlert({
        type: 'success',
        message: `Đổi ghế thành công từ ${changeSeatTarget.seat.seatNumberSnapshot} sang ${selectedNewSeat.seatNumber}!`
      });
      setChangeSeatTarget(null);
      fetchBookings();
    } catch (err: any) {
      console.error(err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Không thể đổi ghế. Có thể ghế đã bị khóa hoặc hết hạn.' });
    } finally {
      setChangeSeatLoading(false);
    }
  };

  // --- Đổi Trip Actions ---
  const openChangeTripModal = async (booking: BookingResponse) => {
    setChangeTripTarget(booking);
    setSelectedNewTrip(null);
    setNewTripSeats([]);
    setSeatAssignments({});
    setCurrentlyMappingSeatId(booking.seats[0]?.id || null);
    setLoadingTrips(true);
    try {
      const res = await adminTripService.getAllTrips({ size: 100 });
      if (res.data?.result?.content) {
        // Filter out completed or cancelled trips, and exclude the current trip
        const filtered = res.data.result.content.filter(t => t.id !== booking.tripId && t.status === 'SCHEDULED');
        setTrips(filtered);
      }
    } catch (err) {
      console.error('Failed to load trips', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleSelectNewTrip = async (trip: TripResponse) => {
    setSelectedNewTrip(trip);
    setNewTripSeats([]);
    setLoadingNewTripSeats(true);
    try {
      const res = await publicTripService.getSeatMap(trip.id);
      if (res.data?.result?.seats) {
        setNewTripSeats(res.data.result.seats);
      }
    } catch (err) {
      console.error('Failed to load seat map for trip ' + trip.id, err);
    } finally {
      setLoadingNewTripSeats(false);
    }
  };

  const handleSelectSeatForTripChange = (seat: SeatInfo) => {
    if (!changeTripTarget || !currentlyMappingSeatId) return;
    
    // Assign the seat to the currently selected seat map
    setSeatAssignments(prev => ({
      ...prev,
      [currentlyMappingSeatId]: seat
    }));

    // Find next seat in booking that hasn't been assigned yet
    const currentIdx = changeTripTarget.seats.findIndex(s => s.id === currentlyMappingSeatId);
    if (currentIdx < changeTripTarget.seats.length - 1) {
      setCurrentlyMappingSeatId(changeTripTarget.seats[currentIdx + 1].id);
    }
  };

  const handleChangeTrip = async () => {
    if (!changeTripTarget || !selectedNewTrip) return;

    // Verify all seats are mapped
    const allSeatsAssigned = changeTripTarget.seats.every(s => !!seatAssignments[s.id]);
    if (!allSeatsAssigned) {
      setAlert({ type: 'error', message: 'Vui lòng chọn đầy đủ ghế mới cho hành khách!' });
      return;
    }

    setChangeTripLoading(true);
    try {
      // Map seats for the API request
      const seatsData = changeTripTarget.seats.map(s => {
        const assignedSeat = seatAssignments[s.id];
        return {
          seatId: assignedSeat.seatId || '',
          seatNumber: assignedSeat.seatNumber,
          price: changeTripTarget.totalAmount / changeTripTarget.seats.length // simple estimate or same price
        };
      });

      await bookingService.changeTrip(changeTripTarget.id, {
        newTripId: selectedNewTrip.id,
        seats: seatsData,
        changedBy: 'Admin Override'
      });

      setAlert({
        type: 'success',
        message: `Đổi chuyến thành công cho vé ${changeTripTarget.bookingCode} sang chuyến ${selectedNewTrip.tripCode || selectedNewTrip.id.substring(0,8)}!`
      });
      setChangeTripTarget(null);
      fetchBookings();
    } catch (err: any) {
      console.error(err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Có lỗi xảy ra khi đổi chuyến đi.' });
    } finally {
      setChangeTripLoading(false);
    }
  };

  // --- Rendering Helpers ---
  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '—';
    const date = new Date(isoStr);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã xác nhận</span>;
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Đang chờ</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Đã hủy</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Hết hạn</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã thanh toán</span>;
      case 'UNPAID':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Chưa thanh toán</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  // Seating grid rendering logic for Change Seat Modal
  const renderSeatMapGrid = (
    seatsList: SeatInfo[], 
    selectedSeat: SeatInfo | null,
    onSelect: (seat: SeatInfo) => void,
    deck: 'lower' | 'upper',
    setDeck: (d: 'lower' | 'upper') => void,
    alreadyAssignedSeats: string[] = [] // Seats that are selected in Change Trip
  ) => {
    const lowerDeck = seatsList.filter(s => s.floor === 1 || s.seatNumber.startsWith('A'));
    const upperDeck = seatsList.filter(s => s.floor === 2 || s.seatNumber.startsWith('B'));
    const currentDeckSeats = deck === 'lower' ? lowerDeck : upperDeck;
    const hasDecks = upperDeck.length > 0;

    // Grouping
    const rows: Record<number, SeatInfo[]> = {};
    currentDeckSeats.forEach(s => {
      const row = s.rowNumber || 0;
      if (!rows[row]) rows[row] = [];
      rows[row].push(s);
    });
    const sortedRows = Object.entries(rows).sort(([a], [b]) => Number(a) - Number(b));
    const maxCols = Math.max(...currentDeckSeats.map(s => s.columnNumber || 1), 3);

    return (
      <div className="flex flex-col items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
        {hasDecks && (
          <div className="flex gap-2 mb-2 bg-slate-200/60 p-1 rounded-lg">
            <button
              onClick={() => setDeck('lower')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${deck === 'lower' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600'}`}
            >
              Tầng Dưới
            </button>
            <button
              onClick={() => setDeck('upper')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${deck === 'upper' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600'}`}
            >
              Tầng Trên
            </button>
          </div>
        )}

        <div className="flex gap-4 mb-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-white border border-slate-300"></div>Trống</div>
          <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-amber-500"></div>Đang chọn</div>
          <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-slate-300"></div>Đã bán</div>
        </div>

        {/* Steering wheel placeholder */}
        <div className="w-full max-w-[280px] flex justify-start mb-2 pl-4 opacity-40">
          <span className="material-symbols-outlined text-xl">radio_button_unchecked</span>
        </div>

        <div className="space-y-3 w-full max-w-[280px]">
          {sortedRows.map(([rowNum, rowSeats]) => (
            <div key={rowNum} className="flex justify-center gap-2">
              {Array.from({ length: maxCols }, (_, colIdx) => {
                const seat = rowSeats.find(s => (s.columnNumber || 0) === colIdx + 1);
                const isAisle = maxCols >= 3 && colIdx === Math.floor(maxCols / 2) - 1;
                
                if (!seat) return <div key={colIdx} className="w-12 h-12" />;

                const isOccupied = seat.status === 'BOOKED' || seat.status === 'HELD' || seat.status === 'BLOCKED';
                const isTempAssigned = alreadyAssignedSeats.includes(seat.seatNumber);
                const isSelected = selectedSeat?.seatNumber === seat.seatNumber;

                let btnClass = "border-slate-300 bg-white hover:border-amber-500 text-slate-800";
                let iconClass = "text-slate-400";
                let disabled = false;

                if (isOccupied || isTempAssigned) {
                  btnClass = "bg-slate-300 border-transparent text-slate-600 opacity-60 cursor-not-allowed";
                  iconClass = "text-slate-500";
                  disabled = true;
                } else if (isSelected) {
                  btnClass = "bg-amber-600 border-transparent text-white ring-2 ring-amber-600 ring-offset-1";
                  iconClass = "text-white";
                }

                return (
                  <React.Fragment key={colIdx}>
                    <button
                      disabled={disabled}
                      onClick={() => onSelect(seat)}
                      className={`w-12 h-14 rounded-lg border flex flex-col items-center justify-center transition-all ${btnClass}`}
                    >
                      <span className={`material-symbols-outlined text-[14px] ${iconClass}`}>bed</span>
                      <span className="text-[10px] font-bold mt-0.5">{seat.seatNumber}</span>
                    </button>
                    {isAisle && <div className="w-4" />}
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      {/* Alert Banner */}
      {alert && (
        <div className="fixed top-6 right-6 z-[9999] max-w-md shadow-lg animate-slide-in bg-white rounded-lg">
          <div className="relative">
            <Alert
              type={alert.type}
              message={alert.message}
            />
            <button 
              onClick={() => setAlert(null)}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Quản lý đặt vé & vận hành
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tổng cộng: <strong className="text-amber-600 font-semibold">{totalElements}</strong> lượt đặt chỗ trong hệ thống
          </p>
        </div>
        
        {/* Quick actions or Stats summaries */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={fetchBookings} className="flex items-center gap-1.5 h-11 border border-slate-200 bg-white">
            <span className="material-symbols-outlined text-lg">refresh</span>
            Tải lại
          </Button>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tìm kiếm đặt vé</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <Input
                placeholder="Tìm mã đặt vé, tên khách hàng, email hoặc số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-slate-50 border-slate-200/80 focus:bg-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button type="submit" className="flex-1 md:flex-none h-11 bg-amber-600 hover:bg-amber-700 text-white font-bold px-6">
              Tìm kiếm
            </Button>
            {(search || statusFilter) && (
              <Button type="button" variant="ghost" onClick={handleResetFilters} className="h-11 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600">
                Xóa lọc
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar">
        {[
          { label: 'Tất cả đặt vé', value: '' },
          { label: 'Chờ thanh toán (PENDING)', value: 'PENDING' },
          { label: 'Đã xác nhận (CONFIRMED)', value: 'CONFIRMED' },
          { label: 'Đã hủy chuyến (CANCELLED)', value: 'CANCELLED' },
          { label: 'Vé hết hạn (EXPIRED)', value: 'EXPIRED' }
        ].map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => {
                setStatusFilter(tab.value);
                setCurrentPage(0);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-600 border-amber-600 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden mb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-3">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-sm font-semibold">Đang truy vấn dữ liệu...</span>
          </div>
        ) : errorMsg ? (
          <div className="p-12 text-center">
            <div className="text-red-500 font-semibold mb-2">{errorMsg}</div>
            <Button onClick={fetchBookings}>Thử lại</Button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-3">confirmation_number</span>
            <p className="text-slate-500 font-semibold">Không tìm thấy mã đặt vé nào tương thích.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã đặt vé / Khách</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin chuyến xe</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Ghế đã đặt</th>
                  <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số tiền</th>
                  <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Thanh toán</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => {
                  const isExpanded = expandedBookingId === booking.id;
                  return (
                    <React.Fragment key={booking.id}>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        {/* Booking Code & Customer */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span 
                              onClick={() => {
                                navigator.clipboard.writeText(booking.bookingCode);
                                setAlert({ type: 'success', message: 'Đã copy mã đặt vé: ' + booking.bookingCode });
                              }}
                              className="font-bold text-amber-700 hover:text-amber-800 cursor-pointer flex items-center gap-1 group text-sm"
                            >
                              {booking.bookingCode}
                              <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">content_copy</span>
                            </span>
                            <span className="font-semibold text-slate-700 mt-1">{booking.customerName}</span>
                            <span className="text-xs text-slate-400 mt-0.5">{booking.customerPhone}</span>
                            <span className="text-[11px] text-slate-400 truncate max-w-[180px]">{booking.customerEmail}</span>
                          </div>
                        </td>

                        {/* Trip info */}
                        <td className="py-4 px-6 text-slate-700">
                          <div className="flex flex-col text-xs gap-0.5">
                            <span className="font-semibold text-slate-800">Mã chuyến: {booking.tripId.substring(0, 8).toUpperCase()}</span>
                            <span className="text-slate-500">Khởi hành: {formatDate(booking.createdAt)}</span>
                          </div>
                        </td>

                        {/* Seats */}
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {booking.seats.map((seat) => (
                              <span 
                                key={seat.id} 
                                className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs"
                              >
                                {seat.seatNumberSnapshot}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-6 text-right font-extrabold text-slate-800">
                          {formatVnd(booking.totalAmount)}
                        </td>

                        {/* Booking status */}
                        <td className="py-4 px-6 text-center">
                          {getStatusBadge(booking.bookingStatus)}
                        </td>

                        {/* Payment status */}
                        <td className="py-4 px-6 text-center">
                          {getPaymentBadge(booking.paymentStatus)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Expand toggle */}
                            <button
                              onClick={() => toggleExpandBooking(booking)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Xem chi tiết & lịch sử đặt vé"
                            >
                              <span className="material-symbols-outlined text-lg">
                                {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                              </span>
                            </button>

                            {/* Options dropdown */}
                            {booking.bookingStatus !== 'CANCELLED' && booking.bookingStatus !== 'EXPIRED' && (
                              <div className="relative">
                                <button 
                                  onClick={() => setActiveDropdownId(activeDropdownId === booking.id ? null : booking.id)}
                                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-lg">more_vert</span>
                                </button>
                                
                                {activeDropdownId === booking.id && (
                                  <>
                                    {/* Invisible overlay to close on click outside */}
                                    <div 
                                      className="fixed inset-0 z-40 cursor-default" 
                                      onClick={() => setActiveDropdownId(null)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-fade-in text-left">
                                      <button
                                        onClick={() => {
                                          setActiveDropdownId(null);
                                          openChangeSeatModal(booking, booking.seats[0]);
                                        }}
                                        className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-700 flex items-center gap-2 cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-base">event_seat</span>
                                        Đổi ghế
                                      </button>
                                      <button
                                        onClick={() => {
                                          setActiveDropdownId(null);
                                          openChangeTripModal(booking);
                                        }}
                                        className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-700 flex items-center gap-2 cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-base">alt_route</span>
                                        Đổi chuyến xe (Trip)
                                      </button>
                                      <div className="border-t border-slate-100 my-1"></div>
                                      <button
                                        onClick={() => {
                                          setActiveDropdownId(null);
                                          setCancelTarget(booking);
                                          setCancelReason('Yêu cầu từ khách hàng');
                                        }}
                                        className="w-full px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-base">cancel</span>
                                        Hủy vé (Cancel)
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable row: Logs, timeline, receipts */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="bg-slate-50/50 p-6 border-t border-b border-slate-100">
                            {loadingDetails[booking.id] ? (
                              <div className="flex items-center justify-center py-6 gap-2">
                                <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-slate-500 font-bold">Đang tải lịch sử đặt vé...</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left column: Booking history timeline */}
                                <div>
                                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base text-amber-600">history</span>
                                    Lịch sử cập nhật / Nhật ký
                                  </h4>
                                  
                                  {(!bookingHistories[booking.id] || bookingHistories[booking.id].length === 0) ? (
                                    <p className="text-xs text-slate-400 italic">Không tìm thấy nhật ký chỉnh sửa.</p>
                                  ) : (
                                    <div className="relative border-l border-slate-200 ml-2.5 pl-4 space-y-4">
                                      {bookingHistories[booking.id].map((log) => (
                                        <div key={log.id} className="relative">
                                          {/* Dot */}
                                          <div className="absolute left-[-21.5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-slate-400" />
                                          <div className="flex flex-col text-xs">
                                            <span className="font-semibold text-slate-700">
                                              {log.action} : {log.oldStatus} ➔ <strong className="text-slate-800 font-extrabold">{log.newStatus}</strong>
                                            </span>
                                            {log.reason && <span className="text-slate-500 mt-0.5">Lý do: {log.reason}</span>}
                                            <span className="text-[10px] text-slate-400 mt-1">
                                              Bởi: {log.changedBy} • {formatDate(log.createdAt)}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Right column: Tickets information */}
                                <div>
                                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base text-amber-600">qr_code_2</span>
                                    Thông tin vé điện tử (E-Tickets)
                                  </h4>

                                  {(!bookingTickets[booking.id] || bookingTickets[booking.id].length === 0) ? (
                                    <p className="text-xs text-slate-400 italic">Chưa tạo vé cho đặt chỗ này (Có thể do chưa thanh toán hoặc đã hủy).</p>
                                  ) : (
                                    <div className="space-y-3">
                                      {bookingTickets[booking.id].map((ticket) => (
                                        <div key={ticket.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                                          <div className="flex flex-col text-xs">
                                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                              Vé: <strong className="text-amber-700">{ticket.ticketCode}</strong>
                                            </span>
                                            <span className="text-slate-400 text-[10px] mt-0.5">Phát hành: {formatDate(ticket.issueAt)}</span>
                                          </div>
                                          
                                          {ticket.qrCode && (
                                            <div className="w-12 h-12 bg-slate-100 flex items-center justify-center rounded-lg border border-slate-200/80 p-0.5">
                                              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.qrCode)}`} className="w-full h-full object-contain" alt="Ticket QR" />
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-100 py-4 px-6 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              Trang {currentPage + 1} / {totalPages} (Hiển thị {bookings.length} trên {totalElements} kết quả)
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                className="px-3 py-1.5 text-xs border border-slate-200 bg-white hover:bg-slate-50 rounded-lg font-bold text-slate-600 disabled:opacity-50 transition-all cursor-pointer"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-8 h-8 text-xs rounded-lg font-extrabold transition-all cursor-pointer ${
                    currentPage === i
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                className="px-3 py-1.5 text-xs border border-slate-200 bg-white hover:bg-slate-50 rounded-lg font-bold text-slate-600 disabled:opacity-50 transition-all cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: HỦY ĐẶT VÉ */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Xác nhận hủy đặt vé">
        <div className="space-y-4 text-left">
          <p className="text-sm text-slate-600">
            Bạn đang yêu cầu hủy đặt vé <strong className="text-rose-600">{cancelTarget?.bookingCode}</strong> của khách hàng <strong>{cancelTarget?.customerName}</strong>. 
            Hành động này sẽ giải phóng toàn bộ số ghế đã đặt.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lý do hủy đặt vé</label>
            <Input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do chi tiết..."
              className="h-11"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <Button variant="ghost" onClick={() => setCancelTarget(null)} className="flex-1 border border-slate-200">Hủy</Button>
            <Button 
              loading={cancelLoading} 
              onClick={handleCancelBooking} 
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: ĐỔI GHẾ */}
      <Modal open={!!changeSeatTarget} onClose={() => setChangeSeatTarget(null)} title="Thay đổi chỗ ngồi (Đổi ghế)" size="lg">
        <div className="space-y-4 text-left">
          {changeSeatTarget && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col text-xs gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã đặt vé:</span>
                <span className="font-bold text-slate-800">{changeSeatTarget.booking.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-bold text-slate-800">{changeSeatTarget.booking.customerName}</span>
              </div>
              
              <div className="flex justify-between mt-1 pt-1 border-t border-slate-200">
                <span className="text-slate-500">Chọn hành khách đổi ghế:</span>
                <select
                  value={changeSeatTarget.seat.id}
                  onChange={(e) => {
                    const selectedSeatId = e.target.value;
                    const foundSeat = changeSeatTarget.booking.seats.find(s => s.id === selectedSeatId);
                    if (foundSeat) {
                      setChangeSeatTarget({ ...changeSeatTarget, seat: foundSeat });
                      setSelectedNewSeat(null);
                    }
                  }}
                  className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-bold text-amber-700 outline-none"
                >
                  {changeSeatTarget.booking.seats.map(s => (
                    <option key={s.id} value={s.id}>Hành khách ({s.seatNumberSnapshot})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chọn vị trí ghế trống mới</label>
            {loadingSeatMap ? (
              <div className="flex items-center justify-center py-10 gap-2">
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-400 font-bold">Đang tải sơ đồ ghế...</span>
              </div>
            ) : (
              renderSeatMapGrid(
                availableSeats, 
                selectedNewSeat, 
                (seat) => setSelectedNewSeat(seat), 
                seatDeck, 
                setSeatDeck
              )
            )}
          </div>

          {selectedNewSeat && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-center text-xs font-bold text-amber-800 animate-fade-in">
              Bạn chọn đổi từ ghế <strong className="text-rose-600">{changeSeatTarget?.seat.seatNumberSnapshot}</strong> sang ghế <strong className="text-emerald-600">{selectedNewSeat.seatNumber}</strong>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <Button variant="ghost" onClick={() => setChangeSeatTarget(null)} className="flex-1 border border-slate-200">Hủy</Button>
            <Button 
              disabled={!selectedNewSeat}
              loading={changeSeatLoading} 
              onClick={handleChangeSeat} 
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: ĐỔI TRIP (CHUYẾN ĐI) */}
      <Modal open={!!changeTripTarget} onClose={() => setChangeTripTarget(null)} title="Thay đổi chuyến xe (Đổi chuyến/Trip)" size="2xl">
        <div className="space-y-4 text-left">
          {changeTripTarget && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500">Đặt vé hiện tại:</span>
                <span className="font-extrabold text-slate-800 text-sm">{changeTripTarget.bookingCode}</span>
                <span className="text-slate-500 mt-1">Khách hàng:</span>
                <span className="font-semibold text-slate-700">{changeTripTarget.customerName} ({changeTripTarget.customerPhone})</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-slate-200 pl-4">
                <span className="text-slate-500">Danh sách ghế cũ cần đổi:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {changeTripTarget.seats.map((s) => {
                    const isAssigned = !!seatAssignments[s.id];
                    return (
                      <button
                        key={s.id}
                        onClick={() => setCurrentlyMappingSeatId(s.id)}
                        className={`px-3 py-1 rounded font-bold border transition-all text-xs flex items-center gap-1 ${
                          currentlyMappingSeatId === s.id
                            ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                            : isAssigned
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {s.seatNumberSnapshot}
                        {isAssigned && <span className="material-symbols-outlined text-[12px]">check_circle</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: SELECT TRIP */}
          {!selectedNewTrip ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Bước 1: Chọn chuyến xe mới</label>
                <div className="relative w-44">
                  <input
                    type="text"
                    placeholder="Lọc mã chuyến..."
                    value={tripSearch}
                    onChange={(e) => setTripSearch(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1 outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {loadingTrips ? (
                <div className="flex justify-center items-center py-10">
                  <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 custom-scrollbar">
                  {trips
                    .filter(t => !tripSearch || (t.tripCode && t.tripCode.toLowerCase().includes(tripSearch.toLowerCase())) || t.id.toLowerCase().includes(tripSearch.toLowerCase()))
                    .map(trip => (
                      <div 
                        key={trip.id} 
                        onClick={() => handleSelectNewTrip(trip)}
                        className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-amber-700">Mã chuyến: {trip.tripCode || trip.id.substring(0,8).toUpperCase()}</span>
                          <span className="text-slate-500 mt-0.5">Khởi hành: {formatDate(trip.departureDatetime)}</span>
                          <span className="text-slate-400 text-[10px]">Xe: {trip.vehicle?.brand} ({trip.vehicle?.licensePlate})</span>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {trip.availableSeats} chỗ trống
                          </span>
                        </div>
                      </div>
                    ))}
                  {trips.length === 0 && (
                    <div className="p-8 text-center text-slate-400 italic">Không tìm thấy chuyến xe thay thế phù hợp.</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // STEP 2: ASSIGN SEATS IN NEW TRIP
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="text-xs">
                  <span className="text-slate-500">Chuyến mới đã chọn: </span>
                  <strong className="text-amber-700 font-bold">{selectedNewTrip.tripCode || selectedNewTrip.id.substring(0,8).toUpperCase()}</strong>
                  <span className="text-slate-400"> ({formatDate(selectedNewTrip.departureDatetime)})</span>
                </div>
                <button 
                  onClick={() => setSelectedNewTrip(null)}
                  className="text-xs text-rose-500 font-bold hover:underline"
                >
                  Chọn chuyến khác
                </button>
              </div>

              <div>
                {currentlyMappingSeatId && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs font-semibold text-amber-800 mb-3 text-center">
                    Vui lòng chọn 1 ghế trống cho hành khách <strong className="text-amber-900 font-bold">
                      {changeTripTarget?.seats.find(s => s.id === currentlyMappingSeatId)?.seatNumberSnapshot}
                    </strong>
                  </div>
                )}

                {loadingNewTripSeats ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  renderSeatMapGrid(
                    newTripSeats,
                    currentlyMappingSeatId ? (seatAssignments[currentlyMappingSeatId] || null) : null,
                    handleSelectSeatForTripChange,
                    newTripDeck,
                    setNewTripDeck,
                    Object.values(seatAssignments).map(s => s.seatNumber) // Disable already assigned seats
                  )
                )}
              </div>

              {/* Show review assignments */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-600 block mb-1">Tóm tắt ánh xạ ghế mới:</span>
                {changeTripTarget?.seats.map((s) => {
                  const assigned = seatAssignments[s.id];
                  return (
                    <div key={s.id} className="flex justify-between">
                      <span className="text-slate-500">Ghế cũ {s.seatNumberSnapshot}:</span>
                      {assigned ? (
                        <span className="font-bold text-emerald-600">➔ Ghế mới {assigned.seatNumber} ({assigned.seatType})</span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa ánh xạ</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <Button variant="ghost" onClick={() => setChangeTripTarget(null)} className="flex-1 border border-slate-200">Hủy</Button>
            {selectedNewTrip && (
              <Button 
                disabled={!changeTripTarget?.seats.every(s => !!seatAssignments[s.id])}
                loading={changeTripLoading} 
                onClick={handleChangeTrip} 
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                Lưu đổi chuyến xe
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};
