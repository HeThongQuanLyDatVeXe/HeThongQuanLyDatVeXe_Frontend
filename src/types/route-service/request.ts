import type { RouteStatus } from './enums';

export interface CreateCityRequest {
  name: string;
  code: string;
  region?: string;
  imageUrl?: string;
}

export interface UpdateCityRequest extends Partial<CreateCityRequest> {}

export interface CreateRouteRequest {
  originCityId: string;
  destinationCityId: string;
  distance: number;
  estimatedDuration: number;
  basePrice: number;
}

export interface UpdateRouteRequest extends Partial<CreateRouteRequest> {}

export interface UpdateRouteStatusRequest {
  status: RouteStatus;
}

export interface CreatePointRequest {
  name: string;
  address: string;
  cityId: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

export interface UpdatePointRequest extends Partial<CreatePointRequest> {}

export interface AddRouteStopPointRequest {
  pointId: string;
  pointType: 'PICKUP' | 'DROPOFF';
  orderIndex: number;
  timeOffset: number;
}
