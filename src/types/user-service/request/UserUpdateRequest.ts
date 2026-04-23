import type { Gender } from "../enums";

export interface UserUpdateRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  avatarUrl?: string;
  roleIds?: string[];
}