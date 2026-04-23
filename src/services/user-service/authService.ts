import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { AuthenticationResponse } from '../../types/user-service/response/AuthenticationResponse';
import type { ChangePasswordRequest } from '../../types/user-service/request/ChangePasswordRequest';
import type { InitiateRegistrationRequest } from '../../types/user-service/request/InitiateRegistrationRequest';
import type { IntrospectRequest } from '../../types/user-service/request/IntrospectRequest';
import type { IntrospectResponse } from '../../types/user-service/response/IntrospectResponse';
import type { LoginRequest } from '../../types/user-service/request/LoginRequest';
import type { LogoutRequest } from '../../types/user-service/request/LogoutRequest';
import type { RefreshTokenRequest } from '../../types/user-service/request/RefreshTokenRequest';
import type { ResendOtpRequest } from '../../types/user-service/request/ResendOtpRequest';
import type { UserResponse } from '../../types/user-service/response/UserResponse';
import type { VerifyRegistrationRequest } from '../../types/user-service/request/VerifyRegistrationRequest';


const BASE = '/identity/auth';
const USER_BASE = '/identity/users';

export const authService = {
  login(data: LoginRequest) {
    return axiosInstance.post<ApiResponse<AuthenticationResponse>>(`${BASE}/login`, data);
  },

  googleLogin(code: string) {
    return axiosInstance.post<ApiResponse<AuthenticationResponse>>(`${BASE}/google/login`, null, {
      params: { code },
    });
  },

  logout(data: LogoutRequest) {
    return axiosInstance.post<ApiResponse<void>>(`${BASE}/logout`, data);
  },

  refresh(data: RefreshTokenRequest) {
    return axiosInstance.post<ApiResponse<AuthenticationResponse>>(`${BASE}/refresh`, data);
  },

  introspect(data: IntrospectRequest) {
    return axiosInstance.post<ApiResponse<IntrospectResponse>>(`${BASE}/introspect`, data);
  },

  initiateRegistration(data: InitiateRegistrationRequest) {
    return axiosInstance.post<ApiResponse<void>>(`${USER_BASE}/registration/initiate`, data);
  },

  verifyAndCreateUser(data: VerifyRegistrationRequest) {
    return axiosInstance.post<ApiResponse<UserResponse>>(`${USER_BASE}/registration/verify`, data);
  },

  resendOtp(data: ResendOtpRequest) {
    return axiosInstance.post<ApiResponse<void>>(`${USER_BASE}/resend-otp`, data);
  },

  changePassword(data: ChangePasswordRequest) {
    return axiosInstance.patch<ApiResponse<void>>(`${USER_BASE}/my-info/password`, data);
  },
};