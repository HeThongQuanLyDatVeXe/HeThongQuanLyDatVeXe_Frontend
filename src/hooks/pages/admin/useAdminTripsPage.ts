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
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
  }, []);

  useEffect(() => {
    fetchTrips(page);
  }, [page]);

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

  const fetchTrips = async (pageIndex: number) => {
    setLoading(true);
    try {
      const apiRes = await adminTripService.getAllTrips({ page: pageIndex, size: 10 });
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

  const openModal = (trip?: TripResponse) => {
    setFormErrors([]);
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        routeId: trip.routeId,
        vehicleId: trip.vehicleId,
        departureDatetime: trip.departureDatetime ? new Date(trip.departureDatetime).toISOString().slice(0,16) : '',
        arrivalDatetime: trip.arrivalDatetime ? new Date(trip.arrivalDatetime).toISOString().slice(0,16) : '',
        totalSeats: trip.totalSeats,
        notes: trip.notes || '',
      });
    } else {
      setEditingTrip(null);
      setFormData({
        routeId: routes.length > 0 ? routes[0].id : '',
        vehicleId: vehicles.length > 0 ? vehicles[0].id : '',
        departureDatetime: '',
        arrivalDatetime: '',
        notes: '',
        totalSeats: undefined,
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
    return dep.toISOString().slice(0, 16);
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

  const handleRouteChange = (routeId: string) => {
    const arrival = calcArrival(formData.departureDatetime, routeId);
    setFormData({ ...formData, routeId, arrivalDatetime: arrival });
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
    isModalOpen,
    editingTrip,
    formData,
    setFormData,
    openModal,
    closeModal,
    getSelectedRouteDuration,
    fmtDuration,
    handleDepartureChange,
    handleRouteChange,
    handleSubmit,
    handleDelete,
    handleStatusChange,
  };
};
