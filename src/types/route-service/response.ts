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

  // Mock fields that UI expects but backend doesn't provide natively yet
  basePrice?: number;
  popular?: boolean;
}

export interface PointResponse {
  id: string;
  name: string;
  address: string;
  cityId: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  createdAt: string;
}

export interface RouteStopPointResponse {
  id: string;
  routeId: string;
  point: PointResponse;
  pointType: 'PICKUP' | 'DROPOFF';
  orderIndex: number;
  timeOffset: number; // minutes from start
}

export interface RoutePage {
  content: RouteResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
