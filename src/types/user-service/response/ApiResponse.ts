export interface ApiResponse<T> {
  code?: number;
  success?: boolean;
  message?: string;
  result?: T;
  data?: T;
}