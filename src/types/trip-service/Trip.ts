// ─── Enums ──────────────────────────────────────────────────────────────────
export type TripStatus = 'SCHEDULED' | 'BOARDING' | 'ON_ROUTE' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';

// ─── Enriched Sub-responses ─────────────────────────────────────────────────
export interface TripPriceResponse {
  id: string;
  seatType: string;
  basePrice: number;
  finalPrice: number;
  currency: string;
  priceBreakdown?: Record<string, unknown>;
  validUntil?: string;
}

export interface RouteInfoResponse {
  id: string;
  code: string;
  name: string;
  originCityName: string;
  destinationCityName: string;
  distanceKm: number;
  durationMinutes: number;
  description?: string;
}

export interface VehicleInfoResponse {
  id: string;
  name?: string;
  licensePlate: string;
  brand: string;
  model: string;
  vehicleTypeCode: string;
  vehicleTypeName: string;
  totalSeats: number;
}

// ─── Main Trip Response ─────────────────────────────────────────────────────
export interface TripResponse {
  id: string;
  tripCode?: string;
  templateId?: string;
  routeId: string;
  vehicleId: string;
  departureDatetime: string;
  arrivalDatetime: string;
  actualDepartureAt?: string;
  actualArrivalAt?: string;
  totalSeats: number;
  availableSeats: number;
  status: TripStatus;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Enriched fields (optional, from other services)
  prices?: TripPriceResponse[];
  route?: RouteInfoResponse;
  vehicle?: VehicleInfoResponse;
}

// ─── Request DTOs ───────────────────────────────────────────────────────────
export interface CreateTripRequest {
  routeId: string;
  vehicleId: string;
  templateId?: string;
  departureDatetime: string;
  arrivalDatetime: string;
  totalSeats?: number;
  notes?: string;
}

export interface UpdateTripRequest {
  vehicleId?: string;
  departureDatetime?: string;
  arrivalDatetime?: string;
  totalSeats?: number;
  notes?: string;
}

export interface UpdateTripStatusRequest {
  status: TripStatus;
}

export interface AdminTripFilterRequest {
  status?: string;
  routeId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface TripSearchRequest {
  originCityId: string;
  destinationCityId: string;
  departureDate: string;
  passengerCount?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

// ─── Seat Map ───────────────────────────────────────────────────────────────
export interface SeatInfo {
  seatNumber: string;
  floor: number;
  rowNumber: number;
  columnNumber: number;
  seatType: string;
  status: string; // AVAILABLE | BOOKED | HELD | BLOCKED
}

export interface SeatMapResponse {
  tripId: string;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  heldSeats: number;
  seats: SeatInfo[];
}

export interface AvailableSeatsResponse {
  tripId: string;
  availableSeatsCount: number;
  availableSeatNumbers: string[];
}
