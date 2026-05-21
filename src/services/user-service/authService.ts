import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { AuthenticationResponse } from '../../types/user-service/response/AuthenticationResponse';
import type { InitiateRegistrationRequest } from '../../types/user-service/request/InitiateRegistrationRequest';
import type { LoginRequest } from '../../types/user-service/request/LoginRequest';
import type { LogoutRequest } from '../../types/user-service/request/LogoutRequest';
import type { RefreshTokenRequest } from '../../types/user-service/request/RefreshTokenRequest';
import type { ForgotPasswordRequest } from '../../types/user-service/request/ForgotPasswordRequest';
import type { ResetPasswordRequest } from '../../types/user-service/request/ResetPasswordRequest';
import type { VerifyOtpRequest } from '../../types/user-service/request/VerifyOtpRequest';
import type { ResendOtpRequest } from '../../types/user-service/request/ResendOtpRequest';

const BASE = '/identity/auth';

export const authService = {
  register(data: InitiateRegistrationRequest) {
    return axiosInstance.post<ApiResponse<void>>(`${BASE}/register`, data);
  },

  login(data: LoginRequest) {
    return axiosInstance.post<ApiResponse<AuthenticationResponse>>(`${BASE}/login`, data);
  },

  logout(data: LogoutRequest) {
    return axiosInstance.post<ApiResponse<void>>(`${BASE}/logout`, data);
  },

  refreshToken(data: RefreshTokenRequest) {
    return axiosInstance.post<ApiResponse<AuthenticationResponse>>(`${BASE}/refresh-token`, data);
  },

  forgotPassword(data: ForgotPasswordRequest) {
    return axiosInstance.post<ApiResponse<void>>(`${BASE}/forgot-password`, data);
  },

  resetPassword(data: ResetPasswordRequest) {
    return axiosInstance.post<ApiResponse<void>>(`${BASE}/reset-password`, data);
  },

  verifyOtp(data: VerifyOtpRequest) {
    return axiosInstance.post<ApiResponse<void>>(`${BASE}/verify-otp`, data);
  },

  resendOtp(data: ResendOtpRequest) {
    return axiosInstance.post<ApiResponse<void>>(`${BASE}/resend-otp`, data);
  },

  oauthLogin(provider: string, code: string) {
    return axiosInstance.post<ApiResponse<AuthenticationResponse>>(`${BASE}/oauth/${provider}`, null, {
      params: { code },
    });
  },
};