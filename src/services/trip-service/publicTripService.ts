import { axiosInstance } from '../../configurations/axios';
import { apiCache, CacheTTL } from '../../utils/apiCache';
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
    const cacheKey = `${TRIP_PUBLIC_BASE}/${id}`;
    const cached = apiCache.get<ApiResponse<TripResponse>>(cacheKey);
    if (cached) return Promise.resolve({ data: cached } as any);

    return axiosInstance.get<ApiResponse<TripResponse>>(`${TRIP_PUBLIC_BASE}/${id}`).then(res => {
      apiCache.set(cacheKey, res.data, CacheTTL.SHORT);
      return res;
    });
  },

  getAvailableSeats(id: string) {
    // Don't cache — seat availability changes in real-time
    return axiosInstance.get<ApiResponse<AvailableSeatsResponse>>(`${TRIP_PUBLIC_BASE}/${id}/available-seats`);
  },

  getSeatMap(id: string) {
    // Don't cache — seat map updates dynamically in real-time
    return axiosInstance.get<ApiResponse<SeatMapResponse>>(`${TRIP_PUBLIC_BASE}/${id}/seat-map`);
  },

  getTripsByRoute(routeId: string, page = 0, size = 10) {
    const cacheKey = `${TRIP_PUBLIC_BASE}/route/${routeId}`;
    const params = { page, size };
    const cached = apiCache.get<ApiResponse<PageResponse<TripResponse>>>(cacheKey, params);
    if (cached) return Promise.resolve({ data: cached } as any);

    return axiosInstance.get<ApiResponse<PageResponse<TripResponse>>>(`${TRIP_PUBLIC_BASE}/route/${routeId}`, { params }).then(res => {
      apiCache.set(cacheKey, res.data, CacheTTL.SHORT, params);
      return res;
    });
  }
};
