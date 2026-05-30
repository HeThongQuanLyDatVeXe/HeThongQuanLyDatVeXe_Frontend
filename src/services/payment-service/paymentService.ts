import { bookingAxiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';

export interface PaymentRequest {
  bookingId: string;
  bookingCode: string;
  amount: number;
  description: string;
}

export interface PaymentResponse {
  paymentId: string;
  paymentCode: string;
  orderCode: number;
  checkoutUrl: string;
  qrCode: string;
  paymentLinkId: string;
}

export const paymentService = {
  createPaymentLink(data: PaymentRequest) {
    // Backend payment controller mapping: POST /api/payments/qr
    // bookingAxiosInstance uses base /api, so '/payments/qr' maps to gateway's /api/payments/qr
    return bookingAxiosInstance.post<any>('/payments/qr', data).then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<PaymentResponse> };
    });
  },

  confirmPaymentSuccess(bookingId: string, transactionId: string) {
    // Backend payment controller mapping: POST /api/payments/success
    return bookingAxiosInstance.post<any>('/payments/success', {
      bookingId,
      transactionId
    }).then(res => {
      const rawData = res.data?.result || res.data?.data || res.data;
      return { data: { code: 200, result: rawData } as ApiResponse<any> };
    });
  },

  getPaymentByBookingId(bookingId: string) {
    // Backend payment controller mapping: GET /api/payments/booking/{bookingId}
    return bookingAxiosInstance.get<any>(`/payments/booking/${bookingId}`);
  }
};
