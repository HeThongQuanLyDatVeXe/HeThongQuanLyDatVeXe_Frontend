import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { PageResponse } from '../../types/user-service/response/PageResponse';
import type { 
  DriverResponse, 
  CreateDriverRequest, 
  UpdateDriverRequest, 
  UpdateDriverStatusRequest 
} from '../../types/driver-service/Driver';

const DRIVER_BASE = '/driver/admin/drivers';

export const adminDriverService = {
  getAllDrivers(params?: { status?: string; keyword?: string; page?: number; size?: number; sortBy?: string; sortDir?: string }) {
    return axiosInstance.get<ApiResponse<PageResponse<DriverResponse>>>(`${DRIVER_BASE}`, { params });
  },

  createDriver(data: CreateDriverRequest) {
    return axiosInstance.post<ApiResponse<DriverResponse>>(`${DRIVER_BASE}`, data);
  },

  updateDriver(id: string, data: UpdateDriverRequest) {
    return axiosInstance.put<ApiResponse<DriverResponse>>(`${DRIVER_BASE}/${id}`, data);
  },

  deleteDriver(id: string) {
    return axiosInstance.delete<ApiResponse<void>>(`${DRIVER_BASE}/${id}`);
  },

  updateDriverStatus(id: string, data: UpdateDriverStatusRequest) {
    return axiosInstance.put<ApiResponse<DriverResponse>>(`${DRIVER_BASE}/${id}/status`, data);
  }
};
