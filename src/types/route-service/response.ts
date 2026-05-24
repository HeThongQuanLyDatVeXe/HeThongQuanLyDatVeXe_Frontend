// ─── Enums ──────────────────────────────────────────────────────────────────
export type RouteStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

// ─── Response DTOs ──────────────────────────────────────────────────────────
export interface CityResponse {
  id: string;
  name: string;
  code: string;
  province: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RouteResponse {
  id: string;
  code: string;
  name: string;
  originCityId: string;
  originCityName: string;
  destinationCityId: string;
  destinationCityName: string;
  distanceKm: number;
  durationMinutes: number;
  status: RouteStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PointResponse {
  id: string;
  cityId: string;
  cityName: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  type: 'PICKUP' | 'DROPOFF' | 'BOTH';
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RouteStopPointResponse {
  id: string;
  stopPointId: string;
  stopPointName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  type: 'PICKUP' | 'DROPOFF' | 'BOTH';
  stopOrder: number;
  arrivalOffsetMinutes?: number;
  departureOffsetMinutes?: number;
  isPickup?: boolean;
  isDropoff?: boolean;
}

export interface RoutePage {
  content: RouteResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
