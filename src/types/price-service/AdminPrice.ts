// ─── Response DTOs ──────────────────────────────────────────────────────────
export interface BasePriceResponse {
  id: string;
  routeId: string;
  vehicleTypeId: string;
  seatType: string;
  price: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Request DTOs ───────────────────────────────────────────────────────────
export interface CreateBasePriceRequest {
  routeId: string;
  vehicleTypeId: string;
  seatType: string;
  price: number;
  currency?: string; // defaults to 'VND' in backend
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdateBasePriceRequest {
  price?: number;
  currency?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  isActive?: boolean;
}
