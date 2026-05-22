import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { PageResponse } from '../../types/user-service/response/PageResponse';
import type { VehicleResponse, CreateVehicleRequest, UpdateVehicleRequest, UpdateVehicleStatusRequest, VehicleTypeResponse } from '../../types/vehicle-service/Vehicle';

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
    return axiosInstance.get<ApiResponse<VehicleTypeResponse[]>>(`${VEHICLE_BASE}/types`);
  }
};
