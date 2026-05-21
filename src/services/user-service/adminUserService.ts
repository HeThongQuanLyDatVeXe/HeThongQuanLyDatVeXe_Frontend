import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { UserResponse } from '../../types/user-service/response/UserResponse';
import type { UserStatus } from '../../types/user-service/enums';
import type { UpdateUserStatusRequest } from '../../types/user-service/request/UpdateUserStatusRequest';
import type { UserActivityLogResponse } from '../../types/user-service/response/UserActivityLogResponse';
import type { Page } from '../../types/user-service/response/Page';

const BASE = '/identity/admin/users';

export const adminUserService = {
  getUsers() {
    return axiosInstance.get<ApiResponse<UserResponse[]>>(BASE);
  },

  getUser(id: string) {
    return axiosInstance.get<ApiResponse<UserResponse>>(`${BASE}/${id}`);
  },

  updateUserStatus(id: string, data: UpdateUserStatusRequest) {
    return axiosInstance.put<ApiResponse<UserResponse>>(`${BASE}/${id}/status`, data);
  },

  deleteUser(id: string) {
    return axiosInstance.delete<ApiResponse<void>>(`${BASE}/${id}`);
  },

  searchUsers(params: { keyword?: string; status?: UserStatus; page?: number; size?: number }) {
    return axiosInstance.get<ApiResponse<Page<UserResponse>>>(`${BASE}/search`, { params });
  },

  getUserActivity(id: string, params?: { page?: number; size?: number }) {
    return axiosInstance.get<ApiResponse<Page<UserActivityLogResponse>>>(`${BASE}/${id}/activity`, { params });
  },
};
