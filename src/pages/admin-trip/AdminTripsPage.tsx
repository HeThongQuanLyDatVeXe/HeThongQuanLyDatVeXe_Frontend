import React, { useState, useEffect } from 'react';
import { adminTripService } from '../../services/trip-service/adminTripService';
import { routeService } from '../../services/route-service/routeService';
import { vehicleService } from '../../services/vehicle-service/vehicleService';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import type { TripResponse, CreateTripRequest, UpdateTripRequest, TripStatus } from '../../types/trip-service/Trip';
import type { RouteResponse } from '../../types/route-service/response';
import type { VehicleResponse } from '../../types/vehicle-service/Vehicle';

const STATUS_MAP: Record<TripStatus, { label: string; color: string }> = {
  SCHEDULED: { label: 'Sắp chạy', color: 'bg-blue-100 text-blue-700' },
  BOARDING: { label: 'Đang đón khách', color: 'bg-indigo-100 text-indigo-700' },
  ON_ROUTE: { label: 'Đang chạy', color: 'bg-purple-100 text-purple-700' },
  ARRIVED: { label: 'Đã đến', color: 'bg-teal-100 text-teal-700' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  DELAYED: { label: 'Bị trễ', color: 'bg-orange-100 text-orange-700' },
};

export const AdminTripsPage: React.FC = () => {
  const navigate = useNavigate();
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

  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-800">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Lịch trình (Chuyến)</h1>
          <button onClick={() => openModal()} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
            <span className="material-symbols-outlined">add</span>
            Thêm chuyến
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Mã chuyến</th>
                <th className="px-6 py-4 font-semibold">Tuyến</th>
                <th className="px-6 py-4 font-semibold">Xe / Ghế</th>
                <th className="px-6 py-4 font-semibold">Khởi hành</th>
                <th className="px-6 py-4 font-semibold">Đến (Dự kiến)</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold w-40">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Đang tải...</td></tr>
              ) : trips.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu.</td></tr>
              ) : trips.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{t.tripCode || 'N/A'}</td>
                  <td className="px-6 py-4 font-medium text-sm">
                    {t.route?.name || 
                     (t.route?.originCityName ? `${t.route.originCityName} - ${t.route.destinationCityName}` : null) || 
                     (() => { const r = routes.find(x => x.id === t.routeId); return r ? `${r.originCityName} - ${r.destinationCityName}` : t.routeId; })()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-semibold">{t.vehicle?.licensePlate || vehicles.find(v => v.id === t.vehicleId)?.licensePlate || t.vehicleId}</div>
                    <div className="text-slate-500 text-xs mt-0.5">Trống: {t.availableSeats ?? 0}/{t.totalSeats ?? 0}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {t.departureDatetime ? new Date(t.departureDatetime).toLocaleString('vi-VN') : ''}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {t.arrivalDatetime ? new Date(t.arrivalDatetime).toLocaleString('vi-VN') : ''}
                  </td>
                  <td className="px-6 py-4">
                    <select value={t.status} onChange={e => handleStatusChange(t, e.target.value as TripStatus)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${(STATUS_MAP[t.status] || STATUS_MAP.SCHEDULED).color}`}>
                      {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => navigate(`/admin/trips/${t.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Chi tiết chuyến">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                      <button onClick={() => navigate(`/admin/trips/${t.id}/seat-overrides`)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Seat Overrides">
                        <span className="material-symbols-outlined text-sm">airline_seat_recline_extra</span>
                      </button>
                      <button onClick={() => openModal(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-200">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border disabled:opacity-50">Trước</button>
              <span className="text-sm font-medium">Trang {page + 1} / {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border disabled:opacity-50">Sau</button>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold mb-4">{editingTrip ? 'Sửa chuyến' : 'Thêm chuyến mới'}</h2>
              {formErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                  {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tuyến đường</label>
                    <select required disabled={!!editingTrip} value={formData.routeId} onChange={e => handleRouteChange(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50">
                      <option value="" disabled>-- Chọn tuyến --</option>
                      {routes.map(r => <option key={r.id} value={r.id}>{r.originCityName} - {r.destinationCityName} ({r.durationMinutes ? fmtDuration(r.durationMinutes) : '?'})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Xe</label>
                    <select required value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <option value="" disabled>-- Chọn xe --</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Khởi hành</label>
                    <input required type="datetime-local" value={formData.departureDatetime} onChange={e => handleDepartureChange(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Đến (dự kiến) — <span className="text-xs text-slate-400 font-normal">tự động tính</span></label>
                    <input required type="datetime-local" value={formData.arrivalDatetime} readOnly className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" />
                    {getSelectedRouteDuration() > 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        Thời gian tuyến: <span className="font-semibold text-slate-500">{fmtDuration(getSelectedRouteDuration())}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tổng số ghế (Tùy chọn)</label>
                    <input type="number" min="1" value={formData.totalSeats || ''} onChange={e => setFormData({...formData, totalSeats: e.target.value ? Number(e.target.value) : undefined})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Mặc định theo xe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ghi chú (Tùy chọn)</label>
                    <input type="text" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Ghi chú về chuyến đi" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                  <button type="button" onClick={closeModal} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium disabled:opacity-50">Hủy</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] flex items-center gap-2 disabled:opacity-50">
                    {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                    {submitting ? 'Đang xử lý...' : editingTrip ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
