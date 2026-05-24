import { axiosInstance } from '../../configurations/axios';
import type { BasePriceResponse, CreateBasePriceRequest, UpdateBasePriceRequest } from '../../types/price-service/AdminPrice';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';

const adminPriceApi = axiosInstance;
const PRICE_BASE = '/price';

export const adminPriceService = {
  // Base Price
  getAllBasePrices: () => 
    adminPriceApi.get<ApiResponse<BasePriceResponse[]>>(`${PRICE_BASE}/admin/base`),
    
  getBasePriceById: (id: string) => 
    adminPriceApi.get<ApiResponse<BasePriceResponse>>(`${PRICE_BASE}/admin/base/${id}`),
    
  createBasePrice: (data: CreateBasePriceRequest) => 
    adminPriceApi.post<ApiResponse<BasePriceResponse>>(`${PRICE_BASE}/admin/base`, data),
    
  updateBasePrice: (id: string, data: UpdateBasePriceRequest) => 
    adminPriceApi.put<ApiResponse<BasePriceResponse>>(`${PRICE_BASE}/admin/base/${id}`, data),

  deleteBasePrice: (id: string) => 
    adminPriceApi.delete<ApiResponse<void>>(`${PRICE_BASE}/admin/base/${id}`),

  // Pricing Rules
  getAllPricingRules: () => 
    adminPriceApi.get<ApiResponse<any[]>>(`${PRICE_BASE}/admin/rules`),
    
  createPricingRule: (data: any) => 
    adminPriceApi.post<ApiResponse<any>>(`${PRICE_BASE}/admin/rules`, data),
    
  updatePricingRule: (id: string, data: any) => 
    adminPriceApi.put<ApiResponse<any>>(`${PRICE_BASE}/admin/rules/${id}`, data),
    
  deletePricingRule: (id: string) => 
    adminPriceApi.delete<ApiResponse<void>>(`${PRICE_BASE}/admin/rules/${id}`),

  // Surcharges
  getAllSurcharges: () => 
    adminPriceApi.get<ApiResponse<any[]>>(`${PRICE_BASE}/admin/surcharges`),
    
  createSurcharge: (data: any) => 
    adminPriceApi.post<ApiResponse<any>>(`${PRICE_BASE}/admin/surcharges`, data),
    
  updateSurcharge: (id: string, data: any) => 
    adminPriceApi.put<ApiResponse<any>>(`${PRICE_BASE}/admin/surcharges/${id}`, data),
    
  deleteSurcharge: (id: string) => 
    adminPriceApi.delete<ApiResponse<void>>(`${PRICE_BASE}/admin/surcharges/${id}`),

  // Seasonal Prices
  getAllSeasonalPrices: () => 
    adminPriceApi.get<ApiResponse<any[]>>(`${PRICE_BASE}/admin/seasonal`),
    
  createSeasonalPrice: (data: any) => 
    adminPriceApi.post<ApiResponse<any>>(`${PRICE_BASE}/admin/seasonal`, data),
    
  updateSeasonalPrice: (id: string, data: any) => 
    adminPriceApi.put<ApiResponse<any>>(`${PRICE_BASE}/admin/seasonal/${id}`, data),
    
  deleteSeasonalPrice: (id: string) => 
    adminPriceApi.delete<ApiResponse<void>>(`${PRICE_BASE}/admin/seasonal/${id}`),
};
