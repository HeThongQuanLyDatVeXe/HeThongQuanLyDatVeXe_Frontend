import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { PermissionRequest } from '../../types/user-service/request/PermissionRequest';
import type { PermissionResponse } from '../../types/user-service/response/PermissionResponse';
import type { RoleRequest } from '../../types/user-service/request/RoleRequest';
import type { RoleResponse } from '../../types/user-service/response/RoleResponse';

// ===== PERMISSION SERVICE =====
export const permissionService = {
  create(data: PermissionRequest) {
    return axiosInstance.post<ApiResponse<PermissionResponse>>('/identity/permissions', data);
  },

  getAll() {
    return axiosInstance.get<ApiResponse<PermissionResponse[]>>('/identity/permissions');
  },

  getById(id: string) {
    return axiosInstance.get<ApiResponse<PermissionResponse>>(`/identity/permissions/${id}`);
  },

  update(id: string, data: PermissionRequest) {
    return axiosInstance.put<ApiResponse<PermissionResponse>>(`/identity/permissions/${id}`, data);
  },

  delete(id: string) {
    return axiosInstance.delete<ApiResponse<void>>(`/identity/permissions/${id}`);
  },
};

// ===== ROLE SERVICE =====
export const roleService = {
  create(data: RoleRequest) {
    return axiosInstance.post<ApiResponse<RoleResponse>>('/identity/roles', data);
  },

  getAll() {
    return axiosInstance.get<ApiResponse<RoleResponse[]>>('/identity/roles');
  },

  getById(id: string) {
    return axiosInstance.get<ApiResponse<RoleResponse>>(`/identity/roles/${id}`);
  },

  update(id: string, data: RoleRequest) {
    return axiosInstance.put<ApiResponse<RoleResponse>>(`/identity/roles/${id}`, data);
  },

  delete(id: string) {
    return axiosInstance.delete<ApiResponse<void>>(`/identity/roles/${id}`);
  },
};