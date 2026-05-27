import { useState, useEffect } from 'react';
import { adminTripService } from '../../../services/trip-service/adminTripService';
import { routeService } from '../../../services/route-service/routeService';
import { vehicleService } from '../../../services/vehicle-service/vehicleService';
import { useToast } from '../../../contexts/ToastContext';
import type { TripResponse, CreateTripRequest, UpdateTripRequest, TripStatus } from '../../../types/trip-service/Trip';
import type { RouteResponse } from '../../../types/route-service/response';
import type { VehicleResponse } from '../../../types/vehicle-service/Vehicle';

export const STATUS_MAP: Record<TripStatus, { label: string; color: string }> = {
  SCHEDULED: { label: 'Sắp chạy', color: 'bg-blue-100 text-blue-700' },
  BOARDING: { label: 'Đang đón khách', color: 'bg-indigo-100 text-indigo-700' },
  ON_ROUTE: { label: 'Đang chạy', color: 'bg-purple-100 text-purple-700' },
  ARRIVED: { label: 'Đã đến', color: 'bg-teal-100 text-teal-700' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  DELAYED: { label: 'Bị trễ', color: 'bg-orange-100 text-orange-700' },
};

export const useAdminTripsPage = () => {
  const { success, error: showError } = useToast();
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search & Filter
  const [filterRouteId, setFilterRouteId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripResponse | null>(null);
  
  const [formData, setFormData] = useState<CreateTripRequest>({
    routeId: '',
    vehicleId: '',
    departureDatetime: '',
    arrivalDatetime: '',
    notes: '',
  });

  useEffect(() => {
    fetchRoutes();
    fetchVehicles();
    fetchVehicleTypes();
  }, []);

  useEffect(() => {
    fetchTrips(page);
  }, [page, isSearching]);

  const fetchRoutes = async () => {
    try {
      const apiRes = await routeService.getRoutes({ page: 0, size: 100 });
      const res = apiRes.data.result || apiRes.data.data;
      if (res) setRoutes(res.content);
    } catch (err) {
      console.error('Failed to fetch routes');
    }
  };

  const fetchVehicles = async () => {
    try {
      const apiRes = await vehicleService.getAllVehicles({ page: 0, size: 100 });
      const res = apiRes.data.result || apiRes.data.data;
      if (res) setVehicles(res.content);
    } catch (err) {
      console.error('Failed to fetch vehicles');
    }
  };

  const fetchVehicleTypes = async () => {
    try {
      const apiRes = await vehicleService.getVehicleTypes();
      const res = apiRes.data.result || apiRes.data.data;
      if (Array.isArray(res)) setVehicleTypes(res);
      else if (res?.content) setVehicleTypes(res.content);
    } catch (err) {
      console.error('Failed to fetch vehicle types');
    }
  };

  const fetchTrips = async (pageIndex: number) => {
    setLoading(true);
    try {
      // If we only have Date strings (YYYY-MM-DD), append time to make it valid ISO/OffsetDateTime
      const fromIso = filterFromDate ? `${filterFromDate}T00:00:00Z` : undefined;
      const toIso = filterToDate ? `${filterToDate}T23:59:59Z` : undefined;

      const apiRes = await adminTripService.getAllTrips({ 
        page: pageIndex, 
        size: 10,
        routeId: isSearching && filterRouteId ? filterRouteId : undefined,
        status: isSearching && filterStatus ? filterStatus as TripStatus : undefined,
        from: isSearching && fromIso ? fromIso : undefined,
        to: isSearching && toIso ? toIso : undefined,
      });
      const res = apiRes.data.result || apiRes.data.data;
      if (res) {
        setTrips(res.content);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    setIsSearching(true);
    // Setting isSearching to true and page to 0 will trigger useEffect
  };

  const clearSearch = () => {
    setFilterRouteId('');
    setFilterStatus('');
    setFilterFromDate('');
    setFilterToDate('');
    setIsSearching(false);
    setPage(0);
  };

  // Convert ISO string or Date to local datetime-local format: YYYY-MM-DDThh:mm
  const toDateTimeLocal = (val?: string | Date) => {
    if (!val) return '';
    const d = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(d.getTime())) return '';
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const openModal = (trip?: TripResponse) => {
    setFormErrors([]);
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        routeId: trip.routeId,
        vehicleId: trip.vehicleId,
        departureDatetime: toDateTimeLocal(trip.departureDatetime),
        arrivalDatetime: toDateTimeLocal(trip.arrivalDatetime),
        totalSeats: trip.totalSeats,
        notes: trip.notes || '',
      });
    } else {
      setEditingTrip(null);
      const defaultVehicleId = vehicles.length > 0 ? vehicles[0].id : '';
      const defaultVehicle = vehicles.find(v => v.id === defaultVehicleId);
      
      let defaultTotalSeats = undefined;
      if (defaultVehicle) {
        const vType = vehicleTypes.find(t => t.id === defaultVehicle.vehicleTypeId);
        if (vType) defaultTotalSeats = vType.totalSeats;
      }

      setFormData({
        routeId: routes.length > 0 ? routes[0].id : '',
        vehicleId: defaultVehicleId,
        departureDatetime: '',
        arrivalDatetime: '',
        notes: '',
        totalSeats: defaultTotalSeats,
      });
    }
    setIsModalOpen(true);
  };

  // Auto-calculate arrival from departure + route duration
  const calcArrival = (departure: string, routeId: string) => {
    if (!departure || !routeId) return '';
    const selectedRoute = routes.find(r => r.id === routeId);
    if (!selectedRoute?.durationMinutes) return '';
    const dep = new Date(departure);
    dep.setMinutes(dep.getMinutes() + selectedRoute.durationMinutes);
    return toDateTimeLocal(dep);
  };

  const getSelectedRouteDuration = () => {
    const r = routes.find(r => r.id === formData.routeId);
    return r?.durationMinutes || 0;
  };

  const fmtDuration = (m: number) => {
    if (!m) return '';
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return h > 0 ? `${h} giờ ${mm > 0 ? mm + ' phút' : ''}` : `${mm} phút`;
  };

  const handleDepartureChange = (value: string) => {
    const arrival = calcArrival(value, formData.routeId);
    setFormData({ ...formData, departureDatetime: value, arrivalDatetime: arrival });
  };

  const handleArrivalChange = (value: string) => {
    setFormData({ ...formData, arrivalDatetime: value });
  };

  const handleRouteChange = (routeId: string) => {
    const arrival = calcArrival(formData.departureDatetime, routeId);
    setFormData({ ...formData, routeId, arrivalDatetime: arrival });
  };

  const handleVehicleChange = (vehicleId: string) => {
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    let totalSeats = undefined;
    if (selectedVehicle) {
      const vType = vehicleTypes.find(t => t.id === selectedVehicle.vehicleTypeId);
      if (vType) totalSeats = vType.totalSeats;
    }

    setFormData({ 
      ...formData, 
      vehicleId, 
      totalSeats
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTrip(null);
  };

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
    setSubmitting(true);
    setFormErrors([]);
    try {
      const payload: any = {
        ...formData,
        departureDatetime: new Date(formData.departureDatetime).toISOString(),
        arrivalDatetime: new Date(formData.arrivalDatetime).toISOString(),
      };

      if (!payload.totalSeats) {
        delete payload.totalSeats;
      }

      if (editingTrip) {
        const updatePayload: UpdateTripRequest = {
          vehicleId: payload.vehicleId,
          departureDatetime: payload.departureDatetime,
          arrivalDatetime: payload.arrivalDatetime,
          totalSeats: payload.totalSeats ? Number(payload.totalSeats) : undefined,
          notes: payload.notes,
        };
        await adminTripService.updateTrip(editingTrip.id, updatePayload);
      } else {
        payload.totalSeats = payload.totalSeats ? Number(payload.totalSeats) : undefined;
        await adminTripService.createTrip(payload);
      }
      closeModal();
      success(editingTrip ? 'Cập nhật chuyến thành công' : 'Thêm chuyến thành công');
      fetchTrips(page);
    } catch (err: any) {
      const errs = extractErrors(err);
      setFormErrors(errs);
      showError(errs[0]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa chuyến đi này?')) return;
    try {
      await adminTripService.deleteTrip(id);
      success('Đã xóa chuyến');
      fetchTrips(page);
    } catch (err: any) {
      showError(extractErrors(err)[0]);
    }
  };

  const handleStatusChange = async (trip: TripResponse, newStatus: TripStatus) => {
    try {
      await adminTripService.updateTripStatus(trip.id, { status: newStatus });
      success('Cập nhật trạng thái thành công');
      fetchTrips(page);
    } catch (err: any) {
      showError(extractErrors(err)[0]);
    }
  };

  return {
    trips,
    routes,
    vehicles,
    loading,
    submitting,
    formErrors,
    page,
    setPage,
    totalPages,
    filterRouteId, setFilterRouteId,
    filterStatus, setFilterStatus,
    filterFromDate, setFilterFromDate,
    filterToDate, setFilterToDate,
    isSearching,
    handleSearch, clearSearch,
    isModalOpen,
    editingTrip,
    formData,
    setFormData,
    openModal,
    closeModal,
    getSelectedRouteDuration,
    fmtDuration,
    handleDepartureChange,
    handleArrivalChange,
    handleRouteChange,
    handleVehicleChange,
    handleSubmit,
    handleDelete,
    handleStatusChange,
  };
};
