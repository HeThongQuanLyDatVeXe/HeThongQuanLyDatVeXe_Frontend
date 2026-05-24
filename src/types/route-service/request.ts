import type { RouteStatus } from './enums';

export interface CreateCityRequest {
  name: string;
  code: string;
  province?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCityRequest extends Partial<CreateCityRequest> { }

export interface CreateRouteRequest {
  code: string;
  name: string;
  originCityId: string;
  destinationCityId: string;
  distanceKm: number;
  durationMinutes: number;
  description?: string;
}

export interface UpdateRouteRequest extends Partial<CreateRouteRequest> { }

export interface UpdateRouteStatusRequest {
  status: RouteStatus;
}

export interface CreatePointRequest {
  name: string;
  address: string;
  cityId: string;
  latitude?: number;
  longitude?: number;
  type?: 'PICKUP' | 'DROPOFF' | 'BOTH';
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePointRequest extends Partial<CreatePointRequest> { }

export interface AddRouteStopPointRequest {
  stopPointId: string;
  stopOrder: number;
  arrivalOffsetMinutes?: number;
  departureOffsetMinutes?: number;
  isPickup?: boolean;
  isDropoff?: boolean;
}
