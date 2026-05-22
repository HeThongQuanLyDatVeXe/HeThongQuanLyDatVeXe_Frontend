import React, { useState, useEffect } from 'react';
import { adminTripService } from '../../services/trip-service/adminTripService';
import { routeService } from '../../services/route-service/routeService';
import { vehicleService } from '../../services/vehicle-service/vehicleService';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useToast } from '../../contexts/ToastContext';
import type { TripResponse, CreateTripRequest, UpdateTripRequest } from '../../types/trip-service/Trip';
import type { RouteResponse } from '../../types/route-service/response';
import type { VehicleResponse } from '../../types/vehicle-service/Vehicle';

export const AdminTripsPage: React.FC = () => {
  const { success, error: showError } = useToast();
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  
  const [loading, setLoading] = useState(false);
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
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        routeId: trip.routeId,
        vehicleId: trip.vehicleId,
        departureDatetime: trip.departureDatetime ? new Date(trip.departureDatetime).toISOString().slice(0,16) : '',
        arrivalDatetime: trip.arrivalDatetime ? new Date(trip.arrivalDatetime).toISOString().slice(0,16) : '',
      });
    } else {
      setEditingTrip(null);
      setFormData({
        routeId: routes.length > 0 ? routes[0].id : '',
        vehicleId: vehicles.length > 0 ? vehicles[0].id : '',
        departureDatetime: '',
        arrivalDatetime: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTrip(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        departureDatetime: new Date(formData.departureDatetime).toISOString(),
        arrivalDatetime: new Date(formData.arrivalDatetime).toISOString(),
      };

      if (editingTrip) {
        const updatePayload: UpdateTripRequest = {
          vehicleId: payload.vehicleId,
          departureDatetime: payload.departureDatetime,
          arrivalDatetime: payload.arrivalDatetime,
        };
        await adminTripService.updateTrip(editingTrip.id, updatePayload);
      } else {
        await adminTripService.createTrip(payload);
      }
      closeModal();
      success(editingTrip ? 'Cập nhật chuyến thành công' : 'Thêm chuyến thành công');
      fetchTrips(page);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa chuyến đi này?')) return;
    try {
      await adminTripService.deleteTrip(id);
      success('Đã xóa chuyến');
      fetchTrips(page);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể xóa chuyến');
    }
  };

  const toggleStatus = async (trip: TripResponse) => {
    const newStatus = trip.status === 'SCHEDULED' ? 'BOARDING' : trip.status === 'BOARDING' ? 'ON_ROUTE' : trip.status === 'ON_ROUTE' ? 'ARRIVED' : trip.status === 'ARRIVED' ? 'COMPLETED' : 'SCHEDULED';
    if (!window.confirm(`Đổi trạng thái thành ${newStatus}?`)) return;
    try {
      await adminTripService.updateTripStatus(trip.id, { status: newStatus });
      success('Cập nhật trạng thái thành công');
      fetchTrips(page);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể cập nhật trạng thái');
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
                <th className="px-6 py-4 font-semibold">Tuyến</th>
                <th className="px-6 py-4 font-semibold">Biển số xe</th>
                <th className="px-6 py-4 font-semibold">Khởi hành</th>
                <th className="px-6 py-4 font-semibold">Đến (Dự kiến)</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Đang tải...</td></tr>
              ) : trips.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu.</td></tr>
              ) : trips.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{t.route?.name || t.routeId}</td>
                  <td className="px-6 py-4">{t.vehicle?.licensePlate || t.vehicleId}</td>
                  <td className="px-6 py-4 text-sm">
                    {t.departureDatetime ? new Date(t.departureDatetime).toLocaleString('vi-VN') : ''}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {t.arrivalDatetime ? new Date(t.arrivalDatetime).toLocaleString('vi-VN') : ''}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      t.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => toggleStatus(t)} className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Đổi trạng thái">
                        <span className="material-symbols-outlined text-sm">power_settings_new</span>
                      </button>
                      <button onClick={() => openModal(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
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
              <h2 className="text-2xl font-bold mb-6">{editingTrip ? 'Sửa chuyến' : 'Thêm chuyến mới'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tuyến đường</label>
                    <select required disabled={!!editingTrip} value={formData.routeId} onChange={e => setFormData({...formData, routeId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50">
                      <option value="" disabled>-- Chọn tuyến --</option>
                      {routes.map(r => <option key={r.id} value={r.id}>{r.originCityName} - {r.destinationCityName}</option>)}
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
                    <input required type="datetime-local" value={formData.departureDatetime} onChange={e => setFormData({...formData, departureDatetime: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Đến (dự kiến)</label>
                    <input required type="datetime-local" value={formData.arrivalDatetime} onChange={e => setFormData({...formData, arrivalDatetime: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors">{editingTrip ? 'Cập nhật' : 'Thêm mới'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
