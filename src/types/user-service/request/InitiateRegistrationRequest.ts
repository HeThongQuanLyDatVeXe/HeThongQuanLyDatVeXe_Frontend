import type { Gender } from "../enums";

export interface InitiateRegistrationRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
}