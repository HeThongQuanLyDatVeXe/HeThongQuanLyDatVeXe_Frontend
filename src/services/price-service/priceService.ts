import { axiosInstance } from '../../configurations/axios';
import { apiCache, CacheTTL } from '../../utils/apiCache';
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
    const cacheKey = `${PRICE_BASE}/route/${routeId}`;
    const cached = apiCache.get<ApiResponse<RoutePricingResponse>>(cacheKey);
    if (cached) return Promise.resolve({ data: cached } as any);

    return axiosInstance.get<ApiResponse<RoutePricingResponse>>(`${PRICE_BASE}/route/${routeId}`).then(res => {
      apiCache.set(cacheKey, res.data, CacheTTL.DEFAULT);
      return res;
    });
  }
};
