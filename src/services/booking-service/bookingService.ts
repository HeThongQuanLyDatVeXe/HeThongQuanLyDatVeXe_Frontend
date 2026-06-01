import { bookingAxiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';

export interface BookingSeatRequest {
  seatId: string;
  seatNumber: string;
  price: number;
}

export interface CreateBookingRequest {
  userId?: string | null;
  tripId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  seats: BookingSeatRequest[];
}

export interface BookingSeatResponse {
  id: string;
  bookingId: string;
  tripSeatId: string;
  seatNumberSnapshot: string;
  price: number;
  bookingSeatStatus: string;
  createdAt: string;
}

export interface BookingHistoryResponse {
  id: string;
  bookingId: string;
  action: string;
  oldStatus: string;
  newStatus: string;
  reason: string;
  changedBy: string;
  createdAt: string;
}

export interface TicketResponse {
  id: string;
  bookingId: string;
  ticketCode: string;
  qrCode: string;
  issueAt: string;
}

export interface BookingResponse {
  id: string;
  bookingCode: string;
  userId: string;
  tripId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  expiresAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  seats: BookingSeatResponse[];
  histories: BookingHistoryResponse[];
  tickets: TicketResponse[];
}

export interface CancelBookingRequest {
  reason: string;
  changedBy: string;
}

export interface ConfirmBookingRequest {
  transactionRef: string;
  provider: string;
}

export interface ChangeSeatRequest {
  bookingSeatId: string;
  newSeatId: string;
  newSeatNumber: string;
  changedBy: string;
}

export interface ChangeTripRequest {
  newTripId: string;
  seats: BookingSeatRequest[];
  changedBy: string;
}

export interface ChangeTripResponse {
  booking: BookingResponse;
  checkoutUrl?: string | null;
  amountDifference: number;
}

export const bookingService = {
  createBooking(data: CreateBookingRequest) {
    return bookingAxiosInstance.post<any>('/bookings', data).then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<BookingResponse> };
    });
  },

  getBookingByCode(bookingCode: string) {
    return bookingAxiosInstance.get<any>(`/bookings/code/${bookingCode}`).then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<BookingResponse> };
    });
  },

  getBookingsByUser(userId: string, page = 0, size = 10) {
    return bookingAxiosInstance.get<any>(`/bookings/user/${userId}`, { params: { page, size } }).then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<any> };
    });
  },

  cancelBooking(bookingId: string, data: CancelBookingRequest) {
    return bookingAxiosInstance.post<any>(`/bookings/${bookingId}/cancel`, data).then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<BookingResponse> };
    });
  },

  confirmBooking(bookingId: string, data: ConfirmBookingRequest) {
    return bookingAxiosInstance.post<any>(`/bookings/${bookingId}/confirm`, data).then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<BookingResponse> };
    });
  },

  getBookingHistory(bookingId: string) {
    return bookingAxiosInstance.get<any>(`/bookings/${bookingId}/histories`).then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<BookingHistoryResponse[]> };
    });
  },

  getTickets(bookingId: string) {
    return bookingAxiosInstance.get<any>(`/bookings/${bookingId}/tickets`).then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<TicketResponse[]> };
    });
  },

  changeSeat(bookingId: string, data: ChangeSeatRequest) {
    return bookingAxiosInstance.post<any>(`/bookings/${bookingId}/change-seat`, data).then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<BookingResponse> };
    });
  },

  changeTrip(bookingId: string, data: ChangeTripRequest) {
    return bookingAxiosInstance.post<any>(`/bookings/${bookingId}/change-trip`, data).then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<ChangeTripResponse> };
    });
  },

  getAllBookings(search?: string, status?: string, page = 0, size = 10) {
    return bookingAxiosInstance.get<any>('/bookings', { params: { search, status, page, size } }).then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<any> };
    });
  },

  getTripSeats(tripId: string) {
    return bookingAxiosInstance.get<any>(`/trip-seats/trips/${tripId}`).then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<any> };
    });
  },

  getDashboardStats() {
    return bookingAxiosInstance.get<any>('/bookings/dashboard-stats').then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<any> };
    });
  }
};
