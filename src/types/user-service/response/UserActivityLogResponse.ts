export interface UserActivityLogResponse {
  id: string;
  userId: string;
  action: string;
  detail: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}
