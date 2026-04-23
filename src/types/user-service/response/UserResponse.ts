import type { Gender, UserStatus } from "../enums";
import type { RoleResponse } from "./RoleResponse";

export interface UserResponse {
  id: string;
  email: string;
  phoneNumber?: string;
  fullName: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: Gender;
  status: UserStatus;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  hasPassword: boolean;
  roles: RoleResponse[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}