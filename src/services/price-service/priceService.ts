import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';

const PRICE_BASE = '/price';

export interface PriceTier {
  vehicleTypeId: string;
  seatType: string;
  basePrice: number;
  minPrice: number;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface RoutePricingResponse {
  routeId: string;
  currency: string;
  priceTiers: PriceTier[];
}

export const priceService = {
  getPricingByRoute(routeId: string) {
    return axiosInstance.get<ApiResponse<RoutePricingResponse>>(`${PRICE_BASE}/route/${routeId}`);
  }
};
