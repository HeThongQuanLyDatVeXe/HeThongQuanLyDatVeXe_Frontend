import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { PageResponse } from '../../types/user-service/response/PageResponse';
import type {
  VehicleResponse, CreateVehicleRequest, UpdateVehicleRequest, UpdateVehicleStatusRequest,
  VehicleTypeResponse, CreateVehicleTypeRequest, UpdateVehicleTypeRequest,
  SeatLayoutResponse, CreateSeatLayoutRequest, UpdateSeatLayoutRequest, TripSeatOverrideResponse, CreateTripSeatOverrideRequest,
  MaintenanceLogResponse, CreateMaintenanceRequest, UpdateMaintenanceRequest
} from '../../types/vehicle-service/Vehicle';

const VEHICLE_BASE = '/vehicle';

export const vehicleService = {
  getAllVehicles(params?: { status?: string; vehicleTypeId?: string; page?: number; size?: number; sortBy?: string; sortDir?: string }) {
    return axiosInstance.get<ApiResponse<PageResponse<VehicleResponse>>>(`${VEHICLE_BASE}/vehicles`, { params });
  },

  getVehicleById(id: string) {
    return axiosInstance.get<ApiResponse<VehicleResponse>>(`${VEHICLE_BASE}/vehicles/${id}`);
  },

  createVehicle(data: CreateVehicleRequest) {
    return axiosInstance.post<ApiResponse<VehicleResponse>>(`${VEHICLE_BASE}/admin/vehicles`, data);
  },

  updateVehicle(id: string, data: UpdateVehicleRequest) {
    return axiosInstance.put<ApiResponse<VehicleResponse>>(`${VEHICLE_BASE}/admin/vehicles/${id}`, data);
  },

  deleteVehicle(id: string) {
    return axiosInstance.delete<ApiResponse<void>>(`${VEHICLE_BASE}/admin/vehicles/${id}`);
  },

  updateVehicleStatus(id: string, data: UpdateVehicleStatusRequest) {
    return axiosInstance.put<ApiResponse<VehicleResponse>>(`${VEHICLE_BASE}/admin/vehicles/${id}/status`, data);
  },

  getVehicleTypes() {
    return axiosInstance.get<ApiResponse<PageResponse<VehicleTypeResponse>>>(`${VEHICLE_BASE}/vehicle-types`);
  },

  getVehicleTypeById(id: string) {
    return axiosInstance.get<ApiResponse<VehicleTypeResponse>>(`${VEHICLE_BASE}/vehicle-types/${id}`);
  },

  createVehicleType(data: CreateVehicleTypeRequest) {
    return axiosInstance.post<ApiResponse<VehicleTypeResponse>>(`${VEHICLE_BASE}/admin/vehicle-types`, data);
  },

  updateVehicleType(id: string, data: UpdateVehicleTypeRequest) {
    return axiosInstance.put<ApiResponse<VehicleTypeResponse>>(`${VEHICLE_BASE}/admin/vehicle-types/${id}`, data);
  },

  deleteVehicleType(id: string) {
    return axiosInstance.delete<ApiResponse<void>>(`${VEHICLE_BASE}/admin/vehicle-types/${id}`);
  },

  // ─── Seat Layouts ────────────────────────────────────────────────────────
  getSeatLayout(vehicleId: string) {
    return axiosInstance.get<ApiResponse<SeatLayoutResponse[]>>(`${VEHICLE_BASE}/vehicles/${vehicleId}/seat-layout`);
  },

  createSeatLayout(vehicleId: string, data: CreateSeatLayoutRequest) {
    return axiosInstance.post<ApiResponse<SeatLayoutResponse[]>>(`${VEHICLE_BASE}/admin/vehicles/${vehicleId}/seat-layout`, data);
  },

  updateSeatLayout(id: string, data: UpdateSeatLayoutRequest) {
    return axiosInstance.put<ApiResponse<SeatLayoutResponse>>(`${VEHICLE_BASE}/admin/seat-layouts/${id}`, data);
  },

  getTripSeatOverrides(tripId: string) {
    return axiosInstance.get<ApiResponse<TripSeatOverrideResponse[]>>(`${VEHICLE_BASE}/admin/trips/${tripId}/seat-overrides`);
  },

  createTripSeatOverride(tripId: string, data: CreateTripSeatOverrideRequest) {
    return axiosInstance.post<ApiResponse<TripSeatOverrideResponse[]>>(`${VEHICLE_BASE}/admin/trips/${tripId}/seat-overrides`, data);
  },

  // ─── Maintenance ──────────────────────────────────────────────────────────
  getMaintenanceHistory(vehicleId: string) {
    return axiosInstance.get<ApiResponse<MaintenanceLogResponse[]>>(`${VEHICLE_BASE}/admin/vehicles/${vehicleId}/maintenance-history`);
  },

  createMaintenanceLog(vehicleId: string, data: CreateMaintenanceRequest) {
    return axiosInstance.post<ApiResponse<MaintenanceLogResponse>>(`${VEHICLE_BASE}/admin/vehicles/${vehicleId}/maintenance`, data);
  },

  getAllMaintenanceSchedules(params?: { status?: string; page?: number; size?: number }) {
    return axiosInstance.get<ApiResponse<PageResponse<MaintenanceLogResponse>>>(`${VEHICLE_BASE}/admin/maintenance-schedules`, { params });
  },

  updateMaintenanceStatus(id: string, data: UpdateMaintenanceRequest) {
    return axiosInstance.put<ApiResponse<MaintenanceLogResponse>>(`${VEHICLE_BASE}/admin/maintenance/${id}`, data);
  },

  deleteMaintenanceLog(id: string) {
    return axiosInstance.delete<ApiResponse<void>>(`${VEHICLE_BASE}/admin/maintenance/${id}`);
  }
};
