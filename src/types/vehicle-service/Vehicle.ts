// ─── Enums ──────────────────────────────────────────────────────────────────
export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';
export type SeatType = 'REGULAR' | 'VIP' | 'BED' | 'LIMOUSINE' | 'DOUBLE_BED';

// ─── Response DTOs ──────────────────────────────────────────────────────────
export interface VehicleResponse {
  id: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  vehicleTypeCode: string;
  licensePlate: string;
  brand: string | null;
  model: string | null;
  manufactureYear: number | null;
  color: string | null;
  chassisNumber: string | null;
  engineNumber: string | null;
  registrationExpiry: string | null;
  insuranceExpiry: string | null;
  status: VehicleStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleTypeResponse {
  id: string;
  code: string;
  name: string;
  totalSeats: number;
  floors: number;
  amenities: Record<string, unknown> | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Request DTOs ───────────────────────────────────────────────────────────
export interface CreateVehicleRequest {
  vehicleTypeId: string;
  licensePlate: string;
  brand?: string;
  model?: string;
  manufactureYear?: number;
  color?: string;
  chassisNumber?: string;
  engineNumber?: string;
  registrationExpiry?: string | null;
  insuranceExpiry?: string | null;
  status: VehicleStatus;
  notes?: string;
}

export interface UpdateVehicleRequest {
  vehicleTypeId?: string;
  licensePlate?: string;
  brand?: string;
  model?: string;
  manufactureYear?: number;
  color?: string;
  chassisNumber?: string;
  engineNumber?: string;
  registrationExpiry?: string | null;
  insuranceExpiry?: string | null;
  notes?: string;
}

export interface UpdateVehicleStatusRequest {
  status: VehicleStatus;
}

export interface CreateVehicleTypeRequest {
  code: string;
  name: string;
  totalSeats: number;
  floors: number;
  amenities?: Record<string, unknown> | null;
  description?: string;
  isActive?: boolean;
}

export interface UpdateVehicleTypeRequest {
  name?: string;
  totalSeats?: number;
  floors?: number;
  amenities?: Record<string, unknown> | null;
  description?: string;
  isActive?: boolean;
}

// ─── Seat Layout ────────────────────────────────────────────────────────────
export interface SeatLayoutResponse {
  id: string;
  vehicleTypeId: string;
  seatNumber: string;
  floor: number;
  rowNumber: number;
  columnNumber: number;
  seatType: SeatType;
  isActive: boolean;
}

export interface SeatRequest {
  seatNumber: string;
  floor: number;
  rowNumber: number;
  columnNumber: number;
  seatType?: SeatType;
  isActive?: boolean;
}

export interface CreateSeatLayoutRequest {
  seats: SeatRequest[];
}

export interface UpdateSeatLayoutRequest {
  floor?: number;
  rowNumber?: number;
  columnNumber?: number;
  seatType?: SeatType;
  isActive?: boolean;
}

export interface TripSeatOverrideResponse {
  id: string;
  tripId: string;
  seatNumber: string;
  isBlocked: boolean;
  reason: string;
  createdAt?: string;
}

export interface OverrideRequest {
  seatNumber: string;
  isBlocked?: boolean;
  reason?: string;
}

export interface CreateTripSeatOverrideRequest {
  overrides: OverrideRequest[];
}

// ─── Maintenance ────────────────────────────────────────────────────────────
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface MaintenanceLogResponse {
  id: string;
  vehicleId: string;
  vehicleLicensePlate?: string;
  status: MaintenanceStatus;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  description: string;
  cost?: number;
  performedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceRequest {
  scheduledAt: string;
  description?: string;
  cost?: number;
  performedBy?: string;
}

export interface UpdateMaintenanceRequest {
  status?: MaintenanceStatus;
  startedAt?: string;
  completedAt?: string;
  description?: string;
  cost?: number;
  performedBy?: string;
}