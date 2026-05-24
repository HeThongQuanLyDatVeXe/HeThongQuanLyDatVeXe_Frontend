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

// ─── Pricing Rules ──────────────────────────────────────────────────────────
export type PricingRuleEvent = 'EARLY_BIRD' | 'LAST_MINUTE' | 'PEAK_HOUR' | 'LOW_DEMAND' | 'CUSTOM';
export type PricingRuleType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface PricingRuleResponse {
  id: string;
  name: string;
  eventType: PricingRuleEvent;
  ruleType: PricingRuleType;
  value: number;
  minDaysBefore?: number;
  maxDaysBefore?: number;
  minOccupancyPct?: number;
  maxOccupancyPct?: number;
  appliesToRoutes?: string[];
  priority: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePricingRuleRequest {
  name: string;
  eventType: PricingRuleEvent;
  ruleType: PricingRuleType;
  value: number;
  minDaysBefore?: number;
  maxDaysBefore?: number;
  minOccupancyPct?: number;
  maxOccupancyPct?: number;
  appliesToRoutes?: string[];
  priority?: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdatePricingRuleRequest {
  name?: string;
  eventType?: PricingRuleEvent;
  ruleType?: PricingRuleType;
  value?: number;
  minDaysBefore?: number;
  maxDaysBefore?: number;
  minOccupancyPct?: number;
  maxOccupancyPct?: number;
  appliesToRoutes?: string[];
  priority?: number;
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
}

// ─── Surcharges ─────────────────────────────────────────────────────────────
export interface SurchargeResponse {
  id: string;
  name: string;
  code: string;
  type: PricingRuleType;
  value: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSurchargeRequest {
  name: string;
  code: string;
  type: PricingRuleType;
  value: number;
  description?: string;
}

export interface UpdateSurchargeRequest {
  name?: string;
  code?: string;
  type?: PricingRuleType;
  value?: number;
  description?: string;
  isActive?: boolean;
}

// ─── Seasonal Prices ────────────────────────────────────────────────────────
export interface SeasonalPriceResponse {
  id: string;
  name: string;
  routeId?: string;
  vehicleTypeId?: string;
  type: PricingRuleType;
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSeasonalPriceRequest {
  name: string;
  routeId?: string;
  vehicleTypeId?: string;
  type: PricingRuleType;
  value: number;
  startDate: string;
  endDate: string;
}

export interface UpdateSeasonalPriceRequest {
  name?: string;
  routeId?: string;
  vehicleTypeId?: string;
  type?: PricingRuleType;
  value?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}
