// ─── Enums ──────────────────────────────────────────────────────────────────
export type TripStatus = 'SCHEDULED' | 'BOARDING' | 'ON_ROUTE' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';

// ─── Enriched Sub-responses (from TripServiceImpl enrichment) ───────────────
export interface TripPriceResponse {
  id: string;
  seatType: string;
  basePrice: number;      // BigDecimal → number
  finalPrice: number;     // BigDecimal → number
  currency: string;
  priceBreakdown?: Record<string, unknown>;
  validUntil?: string;    // OffsetDateTime → ISO string
}

export interface RouteInfoResponse {
  id: string;
  code: string;
  name: string;
  originCityName: string;
  destinationCityName: string;
  distanceKm: number;      // Integer
  durationMinutes: number; // Integer
}

export interface VehicleInfoResponse {
  id: string;
  vehicleTypeId?: string;  // UUID → string (added for Kafka integration)
  licensePlate: string;
  brand: string;
  model: string;
  vehicleTypeCode: string;
  vehicleTypeName: string;
  totalSeats: number;      // Short → number
}

// ─── Main Trip Response ─────────────────────────────────────────────────────
export interface TripResponse {
  id: string;
  tripCode?: string;
  templateId?: string;
  routeId: string;
  vehicleId: string;
  departureDatetime: string;   // OffsetDateTime → ISO string
  arrivalDatetime: string;     // OffsetDateTime → ISO string
  actualDepartureAt?: string;  // OffsetDateTime → ISO string
  actualArrivalAt?: string;    // OffsetDateTime → ISO string
  totalSeats: number;          // Short → number
  availableSeats: number;      // Integer
  status: TripStatus;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;           // OffsetDateTime → ISO string
  updatedAt: string;           // OffsetDateTime → ISO string

  // Enriched fields (optional, populated by TripServiceImpl)
  prices?: TripPriceResponse[];
  route?: RouteInfoResponse;
  vehicle?: VehicleInfoResponse;
}

// ─── Request DTOs ───────────────────────────────────────────────────────────
export interface CreateTripRequest {
  routeId: string;
  vehicleId: string;
  templateId?: string;
  departureDatetime: string;   // OffsetDateTime ISO string
  arrivalDatetime: string;     // OffsetDateTime ISO string
  totalSeats?: number;         // Short
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
  reason?: string;         // optional reason for status change
}

// Backend AdminTripFilterRequest uses: status (TripStatus), routeId, from, to (OffsetDateTime), page, size, sortBy, sortDir
export interface AdminTripFilterRequest {
  status?: TripStatus;
  routeId?: string;
  from?: string;       // OffsetDateTime ISO — BE field name is "from"
  to?: string;         // OffsetDateTime ISO — BE field name is "to"
  page?: number;
  size?: number;
  sortBy?: string;     // default: "departureDatetime"
  sortDir?: string;    // default: "desc"
}

// Backend TripSearchRequest: originCityId, destinationCityId, departureDate (LocalDate), passengerCount, page, size, sortBy, sortDir
export interface TripSearchRequest {
  originCityId: string;
  destinationCityId: string;
  departureDate: string;       // LocalDate → "YYYY-MM-DD"
  passengerCount?: number;     // default 1
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

// ─── Seat Map ───────────────────────────────────────────────────────────────
export interface SeatInfo {
  seatId?: string;       // UUID from Vehicle Service seat layout
  seatNumber: string;
  floor: number;         // Integer
  rowNumber: number;     // Integer
  columnNumber: number;  // Integer
  seatType: string;
  status: string;        // AVAILABLE | BOOKED | HELD | BLOCKED
}

export interface SeatMapResponse {
  tripId: string;
  totalSeats: number;       // Short
  availableSeats: number;   // Integer
  bookedSeats: number;      // Integer
  heldSeats: number;        // Integer
  seats: SeatInfo[];
}

// Backend AvailableSeatsResponse: tripId, totalSeats (Short), bookedSeats, heldSeats, availableSeats (Integer), availableSeatNumbers (List<String>)
export interface AvailableSeatsResponse {
  tripId: string;
  totalSeats: number;
  bookedSeats: number;
  heldSeats: number;
  availableSeats: number;
  availableSeatNumbers: string[];
}

// ─── Trip Crew ──────────────────────────────────────────────────────────────
export type CrewRole = 'DRIVER' | 'ASSISTANT';

export interface TripCrewResponse {
  id: string;
  tripId: string;
  driverId: string;
  driverName?: string;
  driverPhone?: string;
  role: string;          // "DRIVER" | "ASSISTANT"
  assignedAt: string;    // OffsetDateTime → ISO string
}

export interface AssignCrewRequest {
  driverId: string;
  role?: string;           // "driver" | "assistant" — defaults to "driver" on backend
}

// ─── Trip Templates ─────────────────────────────────────────────────────────
// Backend TripTemplateResponse: id (UUID), routeId (UUID), vehicleTypeId (UUID), departureTime (LocalTime), durationMinutes (Integer),
// daysOfWeek (List<Short>), isActive (Boolean), validFrom/validUntil (OffsetDateTime), notes, createdAt/updatedAt
// NOTE: Backend does NOT have routeName or vehicleTypeName — those must be resolved client-side from route/vehicle services
export interface TripTemplateResponse {
  id: string;              // UUID → string
  routeId: string;         // UUID → string
  vehicleTypeId: string;   // UUID → string
  departureTime: string;   // LocalTime → "HH:mm" or "HH:mm:ss"
  durationMinutes: number;
  daysOfWeek: number[];    // List<Short> → number[]
  isActive: boolean;
  validFrom?: string;      // OffsetDateTime → ISO string
  validUntil?: string;     // OffsetDateTime → ISO string
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Backend CreateTripTemplateRequest: routeId (UUID), vehicleTypeId (UUID), departureTime (LocalTime), durationMinutes (Integer),
// daysOfWeek (List<Short>), isActive (Boolean, default true), validFrom/validUntil (OffsetDateTime), notes
export interface CreateTripTemplateRequest {
  routeId: string;
  vehicleTypeId: string;
  departureTime: string;     // LocalTime → "HH:mm"
  durationMinutes: number;
  daysOfWeek: number[];
  isActive?: boolean;
  validFrom?: string;
  validUntil?: string;
  notes?: string;
}

export interface UpdateTripTemplateRequest {
  vehicleTypeId?: string;
  departureTime?: string;
  durationMinutes?: number;
  daysOfWeek?: number[];
  isActive?: boolean;
  validFrom?: string;
  validUntil?: string;
  notes?: string;
}

// Backend GenerateTripsRequest: startDate (LocalDate), endDate (LocalDate), vehicleId (UUID, nullable)
export interface GenerateTripsRequest {
  startDate: string;       // LocalDate → "YYYY-MM-DD"
  endDate: string;         // LocalDate → "YYYY-MM-DD"
  vehicleId?: string;      // UUID → string, nullable
}

// ─── Cancel Trip ────────────────────────────────────────────────────────────
export interface CancelTripRequest {
  reason: string;
}
