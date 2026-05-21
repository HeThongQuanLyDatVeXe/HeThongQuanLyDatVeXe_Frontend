import type { OtpPurpose } from '../enums';

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
  purpose: OtpPurpose;
}
