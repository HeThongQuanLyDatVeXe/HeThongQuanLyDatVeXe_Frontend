import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { PageResponse } from '../../types/user-service/response/PageResponse';
import type { 
  TripResponse, 
  CreateTripRequest, 
  UpdateTripRequest, 
  UpdateTripStatusRequest, 
  AdminTripFilterRequest 
} from '../../types/trip-service/Trip';

const TRIP_BASE = '/trip/admin/trips';

export const adminTripService = {
  getAllTrips(params?: AdminTripFilterRequest) {
    return axiosInstance.get<ApiResponse<PageResponse<TripResponse>>>(`${TRIP_BASE}`, { params });
  },

  createTrip(data: CreateTripRequest) {
    return axiosInstance.post<ApiResponse<TripResponse>>(`${TRIP_BASE}`, data);
  },

  updateTrip(id: string, data: UpdateTripRequest) {
    return axiosInstance.put<ApiResponse<TripResponse>>(`${TRIP_BASE}/${id}`, data);
  },

  deleteTrip(id: string) {
    return axiosInstance.delete<ApiResponse<void>>(`${TRIP_BASE}/${id}`);
  },

  updateTripStatus(id: string, data: UpdateTripStatusRequest) {
    return axiosInstance.put<ApiResponse<TripResponse>>(`${TRIP_BASE}/${id}/status`, data);
  }
};
