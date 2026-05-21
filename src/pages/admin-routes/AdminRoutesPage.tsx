import React, { useState, useEffect } from 'react';
import { routeService } from '../../services/route-service/routeService';
import { adminRouteService } from '../../services/route-service/adminRouteService';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useToast } from '../../contexts/ToastContext';
import type { RouteResponse, CityResponse, RouteStatus } from '../../types/route-service/response';
import type { CreateRouteRequest, UpdateRouteStatusRequest } from '../../types/route-service/request';

export const AdminRoutesPage: React.FC = () => {
  const { success, error: showError, warning } = useToast();
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteResponse | null>(null);
  const [formData, setFormData] = useState<CreateRouteRequest>({
    originCityId: '',
    destinationCityId: '',
    distance: 0,
    estimatedDuration: 0,
    basePrice: 0,
  });

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    fetchRoutes(page);
  }, [page]);

  const fetchCities = async () => {
    try {
      const res = await routeService.getCities();
      setCities(res.data.result ?? []);
    } catch (err) {
      console.error('Failed to fetch cities');
    }
  };

  const fetchRoutes = async (pageIndex: number) => {
    setLoading(true);
    try {
      const res = (await routeService.getRoutes({ page: pageIndex, size: 10 })).data.result;
      if (res) {
        setRoutes(res.content);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (route?: RouteResponse) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        originCityId: route.originCity.id,
        destinationCityId: route.destinationCity.id,
        distance: route.distance,
        estimatedDuration: route.estimatedDuration,
        basePrice: route.basePrice,
      });
    } else {
      setEditingRoute(null);
      setFormData({
        originCityId: cities[0]?.id || '',
        destinationCityId: cities.length > 1 ? cities[1].id : cities[0]?.id || '',
        distance: 0,
        estimatedDuration: 0,
        basePrice: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoute(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.originCityId === formData.destinationCityId) {
      warning('Điểm đi và điểm đến không được trùng nhau');
      return;
    }
    try {
      if (editingRoute) {
        await adminRouteService.updateRoute(editingRoute.id, formData);
      } else {
        await adminRouteService.createRoute(formData);
      }
      closeModal();
      success(editingRoute ? 'Cập nhật tuyến đường thành công' : 'Thêm tuyến đường thành công');
      fetchRoutes(page);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa tuyến đường này?')) return;
    try {
      await adminRouteService.deleteRoute(id);
      success('Đã xóa tuyến đường');
      fetchRoutes(page);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể xóa tuyến đường');
    }
  };

  const toggleStatus = async (route: RouteResponse) => {
    const newStatus: RouteStatus = route.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`Đổi trạng thái thành ${newStatus}?`)) return;
    try {
      await adminRouteService.updateRouteStatus(route.id, { status: newStatus });
      success('Cập nhật trạng thái thành công');
      fetchRoutes(page);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-800">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Tuyến đường</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Thêm tuyến đường
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 font-semibold">Tuyến</th>
              <th className="px-6 py-4 font-semibold">Khoảng cách</th>
              <th className="px-6 py-4 font-semibold">Thời gian (phút)</th>
              <th className="px-6 py-4 font-semibold">Giá cơ bản (VNĐ)</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Đang tải...</td></tr>
            ) : routes.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu.</td></tr>
            ) : routes.map((route) => (
              <tr key={route.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium">
                  {route.originCity?.name} <span className="text-slate-400 mx-1">→</span> {route.destinationCity?.name}
                </td>
                <td className="px-6 py-4">{route.distance} km</td>
                <td className="px-6 py-4">{route.estimatedDuration}</td>
                <td className="px-6 py-4 font-semibold text-[#F4600C]">
                  {route.basePrice.toLocaleString('vi-VN')} ₫
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    route.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                    route.status === 'INACTIVE' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {route.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => toggleStatus(route)} className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Đổi trạng thái">
                      <span className="material-symbols-outlined text-sm">power_settings_new</span>
                    </button>
                    <button onClick={() => openModal(route)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onClick={() => handleDelete(route.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
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
            <h2 className="text-2xl font-bold mb-6">
              {editingRoute ? 'Sửa tuyến đường' : 'Thêm tuyến đường mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Điểm đi</label>
                  <select required value={formData.originCityId} onChange={e => setFormData({...formData, originCityId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <option value="" disabled>-- Chọn --</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Điểm đến</label>
                  <select required value={formData.destinationCityId} onChange={e => setFormData({...formData, destinationCityId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <option value="" disabled>-- Chọn --</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Khoảng cách (km)</label>
                  <input required type="number" step="any" min="0" value={formData.distance} onChange={e => setFormData({...formData, distance: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thời gian ước tính (phút)</label>
                  <input required type="number" min="0" value={formData.estimatedDuration} onChange={e => setFormData({...formData, estimatedDuration: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Giá cơ bản (VNĐ)</label>
                <input required type="number" min="0" step="1000" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
              </div>

              <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors">{editingRoute ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};
