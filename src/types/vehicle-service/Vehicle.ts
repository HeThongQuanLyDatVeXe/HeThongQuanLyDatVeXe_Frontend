// ─── Enums ──────────────────────────────────────────────────────────────────
export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';

// ─── Response DTOs ──────────────────────────────────────────────────────────
export interface VehicleResponse {
  id: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  vehicleTypeCode: string;
  licensePlate: string;
  brand: string;
  model: string;
  manufactureYear: number;
  color: string;
  chassisNumber: string;
  engineNumber: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  status: VehicleStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleTypeResponse {
  id: string;
  code: string;
  name: string;
  totalSeats: number;
  floors: number;
  amenities: string;
  description: string;
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
  registrationExpiry?: string;
  insuranceExpiry?: string;
  status?: VehicleStatus;
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
  registrationExpiry?: string;
  insuranceExpiry?: string;
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
  amenities?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateVehicleTypeRequest {
  code?: string;
  name?: string;
  totalSeats?: number;
  floors?: number;
  amenities?: string;
  description?: string;
  isActive?: boolean;
}
