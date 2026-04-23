import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { UserResponse } from '../../types/user-service/response/UserResponse';
import type { UserUpdateRequest } from '../../types/user-service/request/UserUpdateRequest';

const BASE = '/identity/users';

export const userService = {
  getMyInfo() {
    return axiosInstance.get<ApiResponse<UserResponse>>(`${BASE}/my-info`);
  },

  updateMyInfo(data: UserUpdateRequest) {
    return axiosInstance.put<ApiResponse<UserResponse>>(`${BASE}/my-info`, data);
  },

  // Admin only
  getUsers() {
    return axiosInstance.get<ApiResponse<UserResponse[]>>(BASE);
  },

  getUser(id: string) {
    return axiosInstance.get<ApiResponse<UserResponse>>(`${BASE}/${id}`);
  },

  updateUser(id: string, data: UserUpdateRequest) {
    return axiosInstance.put<ApiResponse<UserResponse>>(`${BASE}/${id}`, data);
  },

  deleteUser(id: string) {
    return axiosInstance.delete<ApiResponse<string>>(`${BASE}/${id}`);
  },
};