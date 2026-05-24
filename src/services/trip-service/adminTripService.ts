import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { PageResponse } from '../../types/user-service/response/PageResponse';
import type { 
  TripResponse, 
  CreateTripRequest, 
  UpdateTripRequest, 
  UpdateTripStatusRequest, 
  AdminTripFilterRequest,
  TripCrewResponse,
  AssignCrewRequest,
  TripTemplateResponse,
  CreateTripTemplateRequest,
  UpdateTripTemplateRequest,
  GenerateTripsRequest
} from '../../types/trip-service/Trip';

const TRIP_BASE = '/trip/admin/trips';
const TEMPLATE_BASE = '/trip/admin/trip-templates';

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
  },

  getTripById(id: string) {
    return axiosInstance.get<ApiResponse<TripResponse>>(`/trip/trips/${id}`);
  },

  cancelTrip(id: string, data?: { reason?: string }) {
    return axiosInstance.put<ApiResponse<TripResponse>>(`${TRIP_BASE}/${id}/cancel`, data);
  },

  getTripBookings(id: string) {
    return axiosInstance.get<ApiResponse<any[]>>(`${TRIP_BASE}/${id}/bookings`);
  },

  assignDriver(id: string, data: AssignCrewRequest) {
    return axiosInstance.put<ApiResponse<TripCrewResponse>>(`${TRIP_BASE}/${id}/assign-driver`, data);
  },

  assignStaff(id: string, data: AssignCrewRequest) {
    return axiosInstance.put<ApiResponse<TripCrewResponse>>(`${TRIP_BASE}/${id}/assign-staff`, data);
  },

  getTripCrew(id: string) {
    return axiosInstance.get<ApiResponse<TripCrewResponse[]>>(`${TRIP_BASE}/${id}/crew`);
  },

  // ─── Trip Templates ─────────────────────────────────────────────────────────
  getAllTripTemplates(params?: { page?: number; size?: number; routeId?: string }) {
    return axiosInstance.get<ApiResponse<PageResponse<TripTemplateResponse>>>(`${TEMPLATE_BASE}`, { params });
  },

  createTripTemplate(data: CreateTripTemplateRequest) {
    return axiosInstance.post<ApiResponse<TripTemplateResponse>>(`${TEMPLATE_BASE}`, data);
  },

  updateTripTemplate(id: string, data: UpdateTripTemplateRequest) {
    return axiosInstance.put<ApiResponse<TripTemplateResponse>>(`${TEMPLATE_BASE}/${id}`, data);
  },

  deleteTripTemplate(id: string) {
    return axiosInstance.delete<ApiResponse<void>>(`${TEMPLATE_BASE}/${id}`);
  },

  generateTripsFromTemplate(id: string, data: GenerateTripsRequest) {
    return axiosInstance.post<ApiResponse<TripResponse[]>>(`${TEMPLATE_BASE}/${id}/generate-trips`, data);
  }
};
