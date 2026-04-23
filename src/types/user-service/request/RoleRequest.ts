export interface RoleRequest {
  name: string;
  description?: string;
  isActive?: boolean;
  permissionIds: string[];
}