import { axiosInstance } from '../../configurations/axios';
import { apiCache, CacheTTL } from '../../utils/apiCache';
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
    const cacheKey = ROUTE_BASE;
    const cached = apiCache.get<ApiResponse<RoutePage>>(cacheKey, params);
    if (cached) return Promise.resolve({ data: cached } as any);

    return axiosInstance.get<ApiResponse<RoutePage>>(ROUTE_BASE, { params }).then(res => {
      apiCache.set(cacheKey, res.data, CacheTTL.DEFAULT, params);
      return res;
    });
  },

  getRouteDetails(id: string) {
    const cacheKey = `${ROUTE_BASE}/${id}`;
    const cached = apiCache.get<ApiResponse<RouteResponse>>(cacheKey);
    if (cached) return Promise.resolve({ data: cached } as any);

    return axiosInstance.get<ApiResponse<RouteResponse>>(`${ROUTE_BASE}/${id}`).then(res => {
      apiCache.set(cacheKey, res.data, CacheTTL.DEFAULT);
      return res;
    });
  },

  searchRoutes(params: { keyword?: string; status?: string; originCityCode?: string; destinationCityCode?: string; page?: number; size?: number }) {
    return axiosInstance.get<ApiResponse<RoutePage>>(`${ROUTE_BASE}/search`, { params });
  },

  getPopularRoutes(page = 0, size = 10) {
    const cacheKey = `${ROUTE_BASE}/popular`;
    const params = { page, size };
    const cached = apiCache.get<ApiResponse<RoutePage>>(cacheKey, params);
    if (cached) return Promise.resolve({ data: cached } as any);

    return axiosInstance.get<ApiResponse<RoutePage>>(`${ROUTE_BASE}/popular`, { params }).then(res => {
      apiCache.set(cacheKey, res.data, CacheTTL.DEFAULT, params);
      return res;
    });
  },

  findRouteFromTo(originCityId: string, destinationCityId: string) {
    const cacheKey = `${ROUTE_BASE}/from/${originCityId}/to/${destinationCityId}`;
    const cached = apiCache.get<ApiResponse<RouteResponse[]>>(cacheKey);
    if (cached) return Promise.resolve({ data: cached } as any);

    return axiosInstance.get<ApiResponse<RouteResponse[]>>(`${ROUTE_BASE}/from/${originCityId}/to/${destinationCityId}`).then(res => {
      apiCache.set(cacheKey, res.data, CacheTTL.DEFAULT);
      return res;
    });
  },

  getRouteStopPoints(id: string) {
    const cacheKey = `${ROUTE_BASE}/${id}/stop-points`;
    const cached = apiCache.get<ApiResponse<RouteStopPointResponse[]>>(cacheKey);
    if (cached) return Promise.resolve({ data: cached } as any);

    return axiosInstance.get<ApiResponse<RouteStopPointResponse[]>>(`${ROUTE_BASE}/${id}/stop-points`).then(res => {
      apiCache.set(cacheKey, res.data, CacheTTL.DEFAULT);
      return res;
    });
  },

  // ─── Thành phố (Public) ────────────────────────────────────────────────────
  getCities() {
    const cacheKey = CITY_BASE;
    const cached = apiCache.get<ApiResponse<CityResponse[]>>(cacheKey);
    if (cached) return Promise.resolve({ data: cached } as any);

    return axiosInstance.get<ApiResponse<CityResponse[]>>(CITY_BASE).then(res => {
      apiCache.set(cacheKey, res.data, CacheTTL.LONG); // Cities rarely change
      return res;
    });
  },

  getCityDetails(id: string) {
    const cacheKey = `${CITY_BASE}/${id}`;
    const cached = apiCache.get<ApiResponse<CityResponse>>(cacheKey);
    if (cached) return Promise.resolve({ data: cached } as any);

    return axiosInstance.get<ApiResponse<CityResponse>>(`${CITY_BASE}/${id}`).then(res => {
      apiCache.set(cacheKey, res.data, CacheTTL.LONG);
      return res;
    });
  },

  // ─── Điểm đón / Điểm trả (Public) ──────────────────────────────────────────
  getPickupPoints(params?: { page?: number; size?: number }) {
    return axiosInstance.get<ApiResponse<PageResponse<PointResponse> | PointResponse[]>>(PICKUP_BASE, { params });
  },

  getPickupPointsByCity(cityId: string) {
    const cacheKey = `${PICKUP_BASE}/city/${cityId}`;
    const cached = apiCache.get<ApiResponse<PointResponse[]>>(cacheKey);
    if (cached) return Promise.resolve({ data: cached } as any);

    return axiosInstance.get<ApiResponse<PointResponse[]>>(`${PICKUP_BASE}/city/${cityId}`).then(res => {
      apiCache.set(cacheKey, res.data, CacheTTL.LONG);
      return res;
    });
  },

  getDropoffPoints(params?: { page?: number; size?: number }) {
    return axiosInstance.get<ApiResponse<PageResponse<PointResponse> | PointResponse[]>>(DROPOFF_BASE, { params });
  },

  getDropoffPointsByCity(cityId: string) {
    const cacheKey = `${DROPOFF_BASE}/city/${cityId}`;
    const cached = apiCache.get<ApiResponse<PointResponse[]>>(cacheKey);
    if (cached) return Promise.resolve({ data: cached } as any);

    return axiosInstance.get<ApiResponse<PointResponse[]>>(`${DROPOFF_BASE}/city/${cityId}`).then(res => {
      apiCache.set(cacheKey, res.data, CacheTTL.LONG);
      return res;
    });
  },
};
