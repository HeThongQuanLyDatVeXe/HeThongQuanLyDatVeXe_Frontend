// ─── Enums ──────────────────────────────────────────────────────────────────
export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'ON_TRIP' | 'SUSPENDED' | 'ON_LEAVE';
export type LicenseClass = 'B1' | 'B2' | 'C' | 'D' | 'E' | 'F';

// ─── Response DTOs ──────────────────────────────────────────────────────────
export interface DriverResponse {
  id: string;
  userId?: string;
  employeeCode: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth?: string;
  idCardNumber?: string;
  licenseNumber: string;
  licenseClass: LicenseClass;
  licenseExpiry: string;
  experienceYears?: number;
  status: DriverStatus;
  avatarUrl?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// ─── Request DTOs ───────────────────────────────────────────────────────────
export interface CreateDriverRequest {
  fullName: string;
  phoneNumber: string;
  email?: string;
  dateOfBirth?: string;
  idCardNumber?: string;
  licenseNumber: string;
  licenseClass: LicenseClass;
  licenseExpiry: string;
  experienceYears?: number;
  avatarUrl?: string;
  address?: string;
  notes?: string;
  userId?: string;
}

export interface UpdateDriverRequest {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: string;
  idCardNumber?: string;
  licenseNumber?: string;
  licenseClass?: LicenseClass;
  licenseExpiry?: string;
  experienceYears?: number;
  avatarUrl?: string;
  address?: string;
  notes?: string;
}

export interface UpdateDriverStatusRequest {
  status: DriverStatus;
}

// ─── Schedule & Availability ────────────────────────────────────────────────
export type AvailabilityType = 'AVAILABLE' | 'TRAINING' | 'BLOCKED' | 'SICK_LEAVE' | 'DAY_OFF';

export interface DriverAvailabilityResponse {
  id: string;
  driverId: string;
  date: string;
  type: AvailabilityType;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityEntry {
  date: string;
  type: AvailabilityType;
  note?: string;
}

export interface UpdateDriverAvailabilityRequest {
  entries: AvailabilityEntry[];
}

// ─── External Aggregation (Schedule & Reviews) ──────────────────────────────
export interface DriverScheduleResponse {
  id: string; // tripId
  routeId: string;
  vehicleId: string;
  departureDatetime: string;
  arrivalDatetime: string;
  status: string;
  routeName?: string; // aggregated
}

export interface DriverReviewResponse {
  id: string;
  driverId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName?: string;
}
