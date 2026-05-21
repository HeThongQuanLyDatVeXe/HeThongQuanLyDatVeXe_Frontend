export interface CityResponse {
  id: string;
  name: string;
  code: string;
  region?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface RouteResponse {
  id: string;
  originCity: CityResponse;
  destinationCity: CityResponse;
  distance: number; // in km
  estimatedDuration: number; // in minutes
  basePrice: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  popular?: boolean;
  createdAt: string;
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
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
