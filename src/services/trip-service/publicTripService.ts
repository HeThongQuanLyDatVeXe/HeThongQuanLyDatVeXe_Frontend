import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { PageResponse } from '../../types/user-service/response/PageResponse';
import type { 
  TripResponse, 
  TripSearchRequest, 
  SeatMapResponse, 
  AvailableSeatsResponse 
} from '../../types/trip-service/Trip';

const TRIP_PUBLIC_BASE = '/trip/trips';

export const publicTripService = {
  searchTrips(params: TripSearchRequest) {
    return axiosInstance.get<ApiResponse<PageResponse<TripResponse>>>(`${TRIP_PUBLIC_BASE}/search`, { params });
  },

  getTripById(id: string) {
    return axiosInstance.get<ApiResponse<TripResponse>>(`${TRIP_PUBLIC_BASE}/${id}`);
  },

  getAvailableSeats(id: string) {
    return axiosInstance.get<ApiResponse<AvailableSeatsResponse>>(`${TRIP_PUBLIC_BASE}/${id}/available-seats`);
  },

  getSeatMap(id: string) {
    return axiosInstance.get<ApiResponse<SeatMapResponse>>(`${TRIP_PUBLIC_BASE}/${id}/seat-map`);
  },

  getTripsByRoute(routeId: string, page = 0, size = 10) {
    return axiosInstance.get<ApiResponse<PageResponse<TripResponse>>>(`${TRIP_PUBLIC_BASE}/route/${routeId}`, { params: { page, size } });
  }
};
