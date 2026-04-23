import type { PermissionResponse } from "./PermissionResponse";

export interface RoleResponse {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  permissions: PermissionResponse[];
  createdAt: string;
  updatedAt: string;
}