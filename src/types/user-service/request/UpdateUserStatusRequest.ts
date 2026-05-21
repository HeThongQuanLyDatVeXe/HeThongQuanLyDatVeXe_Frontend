import type { UserStatus } from '../enums';

export interface UpdateUserStatusRequest {
  status: UserStatus;
}
