import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { CityResponse, RouteResponse, PointResponse, RouteStopPointResponse, RoutePage, PageResponse } from '../../types/route-service/response';

// Assuming gateway maps /api/v1/route to Route Service
// Note: Depends on backend implementation. We use standard paths here.
const ROUTE_BASE = '/route/routes';
const CITY_BASE = '/route/cities';
const PICKUP_BASE = '/route/pickup-points';
const DROPOFF_BASE = '/route/dropoff-points';

export const routeService = {
  // ─── Tuyến đường (Public) ──────────────────────────────────────────────────
  getRoutes(params?: { page?: number; size?: number; sort?: string }) {
    return axiosInstance.get<ApiResponse<RoutePage>>(ROUTE_BASE, { params });
  },

  getRouteDetails(id: string) {
    return axiosInstance.get<ApiResponse<RouteResponse>>(`${ROUTE_BASE}/${id}`);
  },

  searchRoutes(params: { keyword?: string; status?: string; originCityCode?: string; destinationCityCode?: string; page?: number; size?: number }) {
    return axiosInstance.get<ApiResponse<RoutePage>>(`${ROUTE_BASE}/search`, { params });
  },

  getPopularRoutes(page = 0, size = 10) {
    return axiosInstance.get<ApiResponse<RoutePage>>(`${ROUTE_BASE}/popular`, { params: { page, size } });
  },

  findRouteFromTo(originCityId: string, destinationCityId: string) {
    return axiosInstance.get<ApiResponse<RouteResponse[]>>(`${ROUTE_BASE}/from/${originCityId}/to/${destinationCityId}`);
  },

  getRouteStopPoints(id: string) {
    return axiosInstance.get<ApiResponse<RouteStopPointResponse[]>>(`${ROUTE_BASE}/${id}/stop-points`);
  },

  // ─── Thành phố (Public) ────────────────────────────────────────────────────
  getCities() {
    return axiosInstance.get<ApiResponse<CityResponse[]>>(CITY_BASE);
  },

  getCityDetails(id: string) {
    return axiosInstance.get<ApiResponse<CityResponse>>(`${CITY_BASE}/${id}`);
  },

  // ─── Điểm đón / Điểm trả (Public) ──────────────────────────────────────────
  getPickupPoints(params?: { page?: number; size?: number }) {
    return axiosInstance.get<ApiResponse<PageResponse<PointResponse> | PointResponse[]>>(PICKUP_BASE, { params });
  },

  getPickupPointsByCity(cityId: string) {
    return axiosInstance.get<ApiResponse<PointResponse[]>>(`${PICKUP_BASE}/city/${cityId}`);
  },

  getDropoffPoints(params?: { page?: number; size?: number }) {
    return axiosInstance.get<ApiResponse<PageResponse<PointResponse> | PointResponse[]>>(DROPOFF_BASE, { params });
  },

  getDropoffPointsByCity(cityId: string) {
    return axiosInstance.get<ApiResponse<PointResponse[]>>(`${DROPOFF_BASE}/city/${cityId}`);
  },
};
