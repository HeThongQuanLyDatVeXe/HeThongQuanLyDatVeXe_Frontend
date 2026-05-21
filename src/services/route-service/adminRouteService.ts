import { axiosInstance } from '../../configurations/axios';
import type { ApiResponse } from '../../types/user-service/response/ApiResponse';
import type { RouteResponse, CityResponse, PointResponse, RouteStopPointResponse } from '../../types/route-service/response';
import type {
  CreateRouteRequest, UpdateRouteRequest, UpdateRouteStatusRequest,
  CreateCityRequest, UpdateCityRequest,
  CreatePointRequest, UpdatePointRequest,
  AddRouteStopPointRequest
} from '../../types/route-service/request';

const ADMIN_ROUTE_BASE = '/route/admin/routes';
const ADMIN_CITY_BASE = '/route/admin/cities';
const ADMIN_PICKUP_BASE = '/route/admin/pickup-points';
const ADMIN_DROPOFF_BASE = '/route/admin/dropoff-points';

export const adminRouteService = {
  // ─── Tuyến đường (Admin) ───────────────────────────────────────────────────
  createRoute(data: CreateRouteRequest) {
    return axiosInstance.post<ApiResponse<RouteResponse>>(ADMIN_ROUTE_BASE, data);
  },

  updateRoute(id: string, data: UpdateRouteRequest) {
    return axiosInstance.put<ApiResponse<RouteResponse>>(`${ADMIN_ROUTE_BASE}/${id}`, data);
  },

  deleteRoute(id: string) {
    return axiosInstance.delete<ApiResponse<void>>(`${ADMIN_ROUTE_BASE}/${id}`);
  },

  updateRouteStatus(id: string, data: UpdateRouteStatusRequest) {
    return axiosInstance.put<ApiResponse<RouteResponse>>(`${ADMIN_ROUTE_BASE}/${id}/status`, data);
  },

  addRouteStopPoint(routeId: string, data: AddRouteStopPointRequest) {
    return axiosInstance.post<ApiResponse<RouteStopPointResponse>>(`${ADMIN_ROUTE_BASE}/${routeId}/stop-points`, data);
  },

  removeRouteStopPoint(routeId: string, stopPointId: string) {
    return axiosInstance.delete<ApiResponse<void>>(`${ADMIN_ROUTE_BASE}/${routeId}/stop-points/${stopPointId}`);
  },

  // ─── Thành phố (Admin) ─────────────────────────────────────────────────────
  createCity(data: CreateCityRequest) {
    return axiosInstance.post<ApiResponse<CityResponse>>(ADMIN_CITY_BASE, data);
  },

  updateCity(id: string, data: UpdateCityRequest) {
    return axiosInstance.put<ApiResponse<CityResponse>>(`${ADMIN_CITY_BASE}/${id}`, data);
  },

  deleteCity(id: string) {
    return axiosInstance.delete<ApiResponse<void>>(`${ADMIN_CITY_BASE}/${id}`);
  },

  // ─── Điểm đón / Điểm trả (Admin) ───────────────────────────────────────────
  createPickupPoint(data: CreatePointRequest) {
    return axiosInstance.post<ApiResponse<PointResponse>>(ADMIN_PICKUP_BASE, data);
  },

  updatePickupPoint(id: string, data: UpdatePointRequest) {
    return axiosInstance.put<ApiResponse<PointResponse>>(`${ADMIN_PICKUP_BASE}/${id}`, data);
  },

  deletePickupPoint(id: string) {
    return axiosInstance.delete<ApiResponse<Void>>(`${ADMIN_PICKUP_BASE}/${id}`);
  },

  createDropoffPoint(data: CreatePointRequest) {
    return axiosInstance.post<ApiResponse<PointResponse>>(ADMIN_DROPOFF_BASE, data);
  },

  updateDropoffPoint(id: string, data: UpdatePointRequest) {
    return axiosInstance.put<ApiResponse<PointResponse>>(`${ADMIN_DROPOFF_BASE}/${id}`, data);
  },

  deleteDropoffPoint(id: string) {
    return axiosInstance.delete<ApiResponse<Void>>(`${ADMIN_DROPOFF_BASE}/${id}`);
  },
};
