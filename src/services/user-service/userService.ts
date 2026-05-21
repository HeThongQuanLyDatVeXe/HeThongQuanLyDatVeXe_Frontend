import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { UserResponse } from '../../types/user-service/response/UserResponse';
import type { UserUpdateRequest } from '../../types/user-service/request/UserUpdateRequest';
import type { ChangePasswordRequest } from '../../types/user-service/request/ChangePasswordRequest';

const BASE = '/identity/users';

export const userService = {
  getProfile() {
    return axiosInstance.get<ApiResponse<UserResponse>>(`${BASE}/profile`);
  },

  updateProfile(data: UserUpdateRequest) {
    return axiosInstance.put<ApiResponse<UserResponse>>(`${BASE}/profile`, data);
  },

  changePassword(data: ChangePasswordRequest) {
    return axiosInstance.put<ApiResponse<void>>(`${BASE}/change-password`, data);
  },

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post<ApiResponse<string>>(`${BASE}/upload-avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteAccount() {
    return axiosInstance.delete<ApiResponse<void>>(`${BASE}/account`);
  },

  getMyBookings() {
    return axiosInstance.get<ApiResponse<string>>(`${BASE}/my-bookings`);
  },

  getMyLoyalty() {
    return axiosInstance.get<ApiResponse<string>>(`${BASE}/my-loyalty`);
  },
};