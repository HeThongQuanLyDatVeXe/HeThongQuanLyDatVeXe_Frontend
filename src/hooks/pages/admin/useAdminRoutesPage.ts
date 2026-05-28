import { useState, useEffect, useCallback } from 'react';
import { routeService } from '../../../services/route-service/routeService';
import { adminRouteService } from '../../../services/route-service/adminRouteService';
import { useToast } from '../../../contexts/ToastContext';
import type { RouteResponse, CityResponse, RouteStatus, PointResponse, RouteStopPointResponse } from '../../../types/route-service/response';
import type { CreateRouteRequest } from '../../../types/route-service/request';
import { apiCache } from '../../../utils/apiCache';

export const STATUS_MAP: Record<RouteStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Hoạt động', color: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Ngừng', color: 'bg-slate-100 text-slate-700' },
  SUSPENDED: { label: 'Tạm ngưng', color: 'bg-red-100 text-red-700' },
};

export const fmtDuration = (m: number) => m >= 60 ? `${Math.floor(m/60)}h${m%60 > 0 ? m%60 + 'p' : ''}` : `${m} phút`;

export const useAdminRoutesPage = () => {
  const { success, error: showError, warning } = useToast();
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search & Filter
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Route Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteResponse | null>(null);
  const [formData, setFormData] = useState<CreateRouteRequest>({
    code: '',
    name: '',
    originCityId: '',
    destinationCityId: '',
    distanceKm: 0,
    durationMinutes: 0,
    description: '',
  });

  // Stop Points Modal
  const [isStopPointModalOpen, setIsStopPointModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(null);
  const [stopPoints, setStopPoints] = useState<RouteStopPointResponse[]>([]);
  const [loadingStopPoints, setLoadingStopPoints] = useState(false);
  const [allPickupPoints, setAllPickupPoints] = useState<PointResponse[]>([]);
  const [allDropoffPoints, setAllDropoffPoints] = useState<PointResponse[]>([]);
  const [addStopPointForm, setAddStopPointForm] = useState({
    stopPointId: '',
    pointType: 'PICKUP' as 'PICKUP' | 'DROPOFF',
    stopOrder: 0,
    arrivalOffsetMinutes: 0,
    departureOffsetMinutes: 0,
    isPickup: true,
    isDropoff: false,
  });

  useEffect(() => { fetchCities(); fetchAllPoints(); }, []);
  useEffect(() => {
    fetchRoutes(page);
  }, [page, isSearching]);

  useEffect(() => {
    const handleDataChanged = () => {
      fetchRoutes(page);
    };
    window.addEventListener('admin-data-changed', handleDataChanged);
    return () => window.removeEventListener('admin-data-changed', handleDataChanged);
  }, [page, isSearching, searchKeyword, filterOrigin, filterDestination, filterStatus]);

  const fetchCities = async () => {
    try {
      const res = await routeService.getCities();
      const payload = res.data.result || res.data.data;
      setCities(Array.isArray(payload) ? payload : (payload as any)?.content || []);
    } catch (err) { console.error('Failed to fetch cities'); }
  };

  const fetchAllPoints = async () => {
    try {
      const [pickupRes, dropoffRes] = await Promise.all([
        routeService.getPickupPoints(),
        routeService.getDropoffPoints(),
      ]);
      const pickupPayload = pickupRes.data.result || pickupRes.data.data;
      const dropoffPayload = dropoffRes.data.result || dropoffRes.data.data;
      setAllPickupPoints(Array.isArray(pickupPayload) ? pickupPayload : (pickupPayload as any)?.content || []);
      setAllDropoffPoints(Array.isArray(dropoffPayload) ? dropoffPayload : (dropoffPayload as any)?.content || []);
    } catch (err) { console.error('Failed to fetch points'); }
  };

  const fetchRoutes = async (pageIndex: number) => {
    setLoading(true);
    try {
      const apiRes = await routeService.getRoutes({ page: pageIndex, size: 10 });
      const res = apiRes.data.result || apiRes.data.data;
      if (res) { setRoutes(res.content); setTotalPages(res.totalPages); }
    } catch (err) { console.error('Failed to fetch routes'); }
    finally { setLoading(false); }
  };

  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim() && !filterOrigin && !filterDestination && !filterStatus) { setIsSearching(false); fetchRoutes(page); return; }
    setLoading(true);
    setIsSearching(true);
    try {
      const apiRes = await routeService.searchRoutes({
        keyword: searchKeyword.trim() || undefined,
        originCityCode: filterOrigin || undefined,
        destinationCityCode: filterDestination || undefined,
        status: filterStatus || undefined,
        page: 0,
        size: 50
      });
      const res = apiRes.data.result || apiRes.data.data;
      if (res) { setRoutes((res as any).content || (Array.isArray(res) ? res as unknown as RouteResponse[] : [])); setTotalPages((res as any).totalPages || 1); }
    } catch (err) { console.error('Search failed'); }
    finally { setLoading(false); }
  }, [searchKeyword, filterOrigin, filterDestination, filterStatus, page]);

  const clearSearch = () => { setSearchKeyword(''); setFilterOrigin(''); setFilterDestination(''); setFilterStatus(''); setIsSearching(false); fetchRoutes(page); };

  // ─── Route CRUD ────────────────────────────────────────────────────
  const openModal = (route?: RouteResponse) => {
    setFormErrors([]);
    if (route) {
      setEditingRoute(route);
      setFormData({
        code: route.code,
        name: route.name,
        originCityId: route.originCityId,
        destinationCityId: route.destinationCityId,
        distanceKm: route.distanceKm,
        durationMinutes: route.durationMinutes,
        description: route.description || '',
      });
    } else {
      setEditingRoute(null);
      setFormData({
        code: '',
        name: '',
        originCityId: cities[0]?.id || '',
        destinationCityId: cities.length > 1 ? cities[1].id : cities[0]?.id || '',
        distanceKm: 0,
        durationMinutes: 0,
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingRoute(null); };

  const extractErrors = (err: any): string[] => {
    const d = err?.response?.data;
    if (!d) return [err?.message || 'Lỗi không xác định'];
    const errs: string[] = [];
    if (d.errors && typeof d.errors === 'object') Object.entries(d.errors).forEach(([f, m]) => errs.push(`${f}: ${m}`));
    if (d.message) errs.push(d.message);
    return errs.length > 0 ? errs : ['Có lỗi xảy ra'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.originCityId === formData.destinationCityId) { warning('Điểm đi và điểm đến không được trùng nhau'); return; }
    setSubmitting(true); setFormErrors([]);
    try {
      if (editingRoute) { await adminRouteService.updateRoute(editingRoute.id, formData); }
      else { await adminRouteService.createRoute(formData); }
      apiCache.invalidatePrefix('/route/routes');
      closeModal();
      success(editingRoute ? 'Cập nhật tuyến đường thành công' : 'Thêm tuyến đường thành công');
      fetchRoutes(page);
    } catch (err: any) { const errs = extractErrors(err); setFormErrors(errs); showError(errs[0]); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa tuyến đường này?')) return;
    try { 
      await adminRouteService.deleteRoute(id); 
      success('Đã xóa tuyến đường'); 
      apiCache.invalidatePrefix('/route/routes');
      fetchRoutes(page); 
    }
    catch (err: any) { showError(err.response?.data?.message || 'Không thể xóa tuyến đường'); }
  };

  const handleStatusChange = async (route: RouteResponse, newStatus: RouteStatus) => {
    try { 
      await adminRouteService.updateRouteStatus(route.id, { status: newStatus }); 
      success(`${route.name} → ${STATUS_MAP[newStatus].label}`); 
      apiCache.invalidatePrefix('/route/routes');
      fetchRoutes(page); 
    }
    catch (err: any) { showError(err.response?.data?.message || 'Không thể cập nhật trạng thái'); }
  };

  // ─── Stop Points ───────────────────────────────────────────────────
  const openStopPointModal = async (route: RouteResponse) => {
    setSelectedRoute(route);
    setIsStopPointModalOpen(true);
    setLoadingStopPoints(true);
    try {
      const res = await routeService.getRouteStopPoints(route.id);
      setStopPoints((res.data.result || res.data.data) ?? []);
    } catch (err) { console.error('Failed to fetch stop points'); setStopPoints([]); }
    finally { setLoadingStopPoints(false); }
  };

  const closeStopPointModal = () => { setIsStopPointModalOpen(false); setSelectedRoute(null); setStopPoints([]); };

  const handleAddStopPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute || !addStopPointForm.stopPointId) return;
    try {
      const payload = {
        stopPointId: addStopPointForm.stopPointId,
        stopOrder: addStopPointForm.stopOrder,
        arrivalOffsetMinutes: addStopPointForm.arrivalOffsetMinutes,
        departureOffsetMinutes: addStopPointForm.departureOffsetMinutes,
        isPickup: addStopPointForm.isPickup,
        isDropoff: addStopPointForm.isDropoff,
      };
      await adminRouteService.addRouteStopPoint(selectedRoute.id, payload);
      success('Thêm điểm dừng thành công');
      apiCache.invalidatePrefix('/route/routes');
      // refresh
      const res = await routeService.getRouteStopPoints(selectedRoute.id);
      setStopPoints((res.data.result || res.data.data) ?? []);
      setAddStopPointForm({
        stopPointId: '',
        pointType: 'PICKUP',
        stopOrder: 0,
        arrivalOffsetMinutes: 0,
        departureOffsetMinutes: 0,
        isPickup: true,
        isDropoff: false,
      });
    } catch (err: any) { showError(err.response?.data?.message || 'Không thể thêm điểm dừng'); }
  };

  const handleRemoveStopPoint = async (spId: string) => {
    if (!selectedRoute || !window.confirm('Xóa điểm dừng này khỏi tuyến?')) return;
    try {
      await adminRouteService.removeRouteStopPoint(selectedRoute.id, spId);
      success('Đã xóa điểm dừng');
      apiCache.invalidatePrefix('/route/routes');
      setStopPoints(prev => prev.filter(sp => sp.stopPointId !== spId));
    } catch (err: any) { showError(err.response?.data?.message || 'Không thể xóa điểm dừng'); }
  };

  const availablePoints = addStopPointForm.pointType === 'PICKUP' ? allPickupPoints : allDropoffPoints;

  return {
    routes,
    cities,
    loading,
    submitting,
    formErrors,
    page,
    setPage,
    totalPages,
    searchKeyword,
    setSearchKeyword,
    filterOrigin,
    setFilterOrigin,
    filterDestination,
    setFilterDestination,
    filterStatus,
    setFilterStatus,
    isSearching,
    isModalOpen,
    editingRoute,
    formData,
    setFormData,
    isStopPointModalOpen,
    selectedRoute,
    stopPoints,
    loadingStopPoints,
    addStopPointForm,
    setAddStopPointForm,
    availablePoints,
    handleSearch,
    clearSearch,
    openModal,
    closeModal,
    handleSubmit,
    handleDelete,
    handleStatusChange,
    openStopPointModal,
    closeStopPointModal,
    handleAddStopPoint,
    handleRemoveStopPoint
  };
};
