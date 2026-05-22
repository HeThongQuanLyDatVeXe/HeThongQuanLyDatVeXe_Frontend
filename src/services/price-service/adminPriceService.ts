import { axiosInstance } from '../../configurations/axios';
import type { BasePriceResponse, CreateBasePriceRequest, UpdateBasePriceRequest } from '../../types/price-service/AdminPrice';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';

const adminPriceApi = axiosInstance;

export const adminPriceService = {
  // Base Price
  getAllBasePrices: () => 
    adminPriceApi.get<ApiResponse<BasePriceResponse[]>>('/admin/base'),
    
  getBasePriceById: (id: string) => 
    adminPriceApi.get<ApiResponse<BasePriceResponse>>(`/admin/base/${id}`),
    
  createBasePrice: (data: CreateBasePriceRequest) => 
    adminPriceApi.post<ApiResponse<BasePriceResponse>>('/admin/base', data),
    
  updateBasePrice: (id: string, data: UpdateBasePriceRequest) => 
    adminPriceApi.put<ApiResponse<BasePriceResponse>>(`/admin/base/${id}`, data),
};
