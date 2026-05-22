import React, { useState, useEffect, useCallback } from 'react';
import { routeService } from '../../services/route-service/routeService';
import { adminRouteService } from '../../services/route-service/adminRouteService';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useToast } from '../../contexts/ToastContext';
import type { RouteResponse, CityResponse, RouteStatus, PointResponse, RouteStopPointResponse } from '../../types/route-service/response';
import type { CreateRouteRequest } from '../../types/route-service/request';

export const AdminRoutesPage: React.FC = () => {
  const { success, error: showError, warning } = useToast();
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [loading, setLoading] = useState(false);
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
    originCityId: '',
    destinationCityId: '',
    distance: 0,
    estimatedDuration: 0,
    basePrice: 0,
  });

  // Stop Points Modal
  const [isStopPointModalOpen, setIsStopPointModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(null);
  const [stopPoints, setStopPoints] = useState<RouteStopPointResponse[]>([]);
  const [loadingStopPoints, setLoadingStopPoints] = useState(false);
  const [allPickupPoints, setAllPickupPoints] = useState<PointResponse[]>([]);
  const [allDropoffPoints, setAllDropoffPoints] = useState<PointResponse[]>([]);
  const [addStopPointForm, setAddStopPointForm] = useState({
    pointId: '',
    pointType: 'PICKUP' as 'PICKUP' | 'DROPOFF',
    orderIndex: 0,
    timeOffset: 0,
  });

  useEffect(() => { fetchCities(); fetchAllPoints(); }, []);
  useEffect(() => { fetchRoutes(page); }, [page]);

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
    if (route) {
      setEditingRoute(route);
      setFormData({ originCityId: route.originCityId, destinationCityId: route.destinationCityId, distance: route.distanceKm, estimatedDuration: route.durationMinutes, basePrice: route.basePrice || 0 });
    } else {
      setEditingRoute(null);
      setFormData({ originCityId: cities[0]?.id || '', destinationCityId: cities.length > 1 ? cities[1].id : cities[0]?.id || '', distance: 0, estimatedDuration: 0, basePrice: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingRoute(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.originCityId === formData.destinationCityId) { warning('Điểm đi và điểm đến không được trùng nhau'); return; }
    try {
      if (editingRoute) { await adminRouteService.updateRoute(editingRoute.id, formData); }
      else { await adminRouteService.createRoute(formData); }
      closeModal();
      success(editingRoute ? 'Cập nhật tuyến đường thành công' : 'Thêm tuyến đường thành công');
      fetchRoutes(page);
    } catch (err: any) { showError(err.response?.data?.message || 'Có lỗi xảy ra'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa tuyến đường này?')) return;
    try { await adminRouteService.deleteRoute(id); success('Đã xóa tuyến đường'); fetchRoutes(page); }
    catch (err: any) { showError(err.response?.data?.message || 'Không thể xóa tuyến đường'); }
  };

  const toggleStatus = async (route: RouteResponse) => {
    const newStatus: RouteStatus = route.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`Đổi trạng thái thành ${newStatus}?`)) return;
    try { await adminRouteService.updateRouteStatus(route.id, { status: newStatus }); success('Cập nhật trạng thái thành công'); fetchRoutes(page); }
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
    if (!selectedRoute || !addStopPointForm.pointId) return;
    try {
      await adminRouteService.addRouteStopPoint(selectedRoute.id, addStopPointForm);
      success('Thêm điểm dừng thành công');
      // refresh
      const res = await routeService.getRouteStopPoints(selectedRoute.id);
      setStopPoints((res.data.result || res.data.data) ?? []);
      setAddStopPointForm({ pointId: '', pointType: 'PICKUP', orderIndex: 0, timeOffset: 0 });
    } catch (err: any) { showError(err.response?.data?.message || 'Không thể thêm điểm dừng'); }
  };

  const handleRemoveStopPoint = async (spId: string) => {
    if (!selectedRoute || !window.confirm('Xóa điểm dừng này khỏi tuyến?')) return;
    try {
      await adminRouteService.removeRouteStopPoint(selectedRoute.id, spId);
      success('Đã xóa điểm dừng');
      setStopPoints(prev => prev.filter(sp => sp.id !== spId));
    } catch (err: any) { showError(err.response?.data?.message || 'Không thể xóa điểm dừng'); }
  };

  const availablePoints = addStopPointForm.pointType === 'PICKUP' ? allPickupPoints : allDropoffPoints;

  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-800">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Tuyến đường</h1>
        <button onClick={() => openModal()} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
          <span className="material-symbols-outlined">add</span>
          Thêm tuyến đường
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text" placeholder="Tìm kiếm tuyến đường..." value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] focus:ring-1 focus:ring-[#F4600C] transition-all"
            />
          </div>
          
          <select 
            value={filterOrigin} 
            onChange={e => setFilterOrigin(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] transition-all min-w-[150px]"
          >
            <option value="">-- Điểm đi --</option>
            {cities.map(c => <option key={c.id} value={c.code}>{c.name}</option>)}
          </select>

          <select 
            value={filterDestination} 
            onChange={e => setFilterDestination(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] transition-all min-w-[150px]"
          >
            <option value="">-- Điểm đến --</option>
            {cities.map(c => <option key={c.id} value={c.code}>{c.name}</option>)}
          </select>

          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] transition-all min-w-[150px]"
          >
            <option value="">-- Trạng thái --</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
            <option value="SUSPENDED">Tạm ngưng</option>
          </select>

          <button onClick={handleSearch} className="px-6 py-2.5 bg-[#F4600C] text-white rounded-lg hover:bg-[#D5530A] transition-colors font-medium whitespace-nowrap">
            Tìm kiếm
          </button>
          
          {isSearching && (
            <button onClick={clearSearch} className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 font-medium whitespace-nowrap">
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {isSearching && <p className="text-sm text-slate-500 italic">Đang hiển thị kết quả tìm kiếm/lọc.</p>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 font-semibold">Tuyến</th>
              <th className="px-6 py-4 font-semibold">Khoảng cách</th>
              <th className="px-6 py-4 font-semibold">Thời gian (phút)</th>
              <th className="px-6 py-4 font-semibold">Giá cơ bản (VNĐ)</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold w-44">Thao tác</th>
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
                  {route.originCityName} <span className="text-slate-400 mx-1">→</span> {route.destinationCityName}
                </td>
                <td className="px-6 py-4">{route.distanceKm} km</td>
                <td className="px-6 py-4">{route.durationMinutes}</td>
                <td className="px-6 py-4 font-semibold text-[#F4600C]">
                  {(route.basePrice || 0).toLocaleString('vi-VN')} ₫
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
                  <div className="flex gap-1">
                    <button onClick={() => openStopPointModal(route)} className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Quản lý điểm dừng">
                      <span className="material-symbols-outlined text-sm">pin_drop</span>
                    </button>
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
        {totalPages > 1 && !isSearching && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-200">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border disabled:opacity-50">Trước</button>
            <span className="text-sm font-medium">Trang {page + 1} / {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border disabled:opacity-50">Sau</button>
          </div>
        )}
      </div>

      {/* ─── Route Create/Edit Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6">{editingRoute ? 'Sửa tuyến đường' : 'Thêm tuyến đường mới'}</h2>
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

      {/* ─── Stop Points Management Modal ─── */}
      {isStopPointModalOpen && selectedRoute && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Điểm dừng tuyến</h2>
                <p className="text-slate-500 text-sm mt-1">
                  {selectedRoute.originCityName} → {selectedRoute.destinationCityName}
                </p>
              </div>
              <button onClick={closeStopPointModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Add Stop Point Form */}
            <form onSubmit={handleAddStopPoint} className="bg-slate-50 p-4 rounded-xl mb-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Thêm điểm dừng mới</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Loại điểm</label>
                  <select value={addStopPointForm.pointType} onChange={e => setAddStopPointForm({...addStopPointForm, pointType: e.target.value as 'PICKUP' | 'DROPOFF', pointId: ''})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
                    <option value="PICKUP">Điểm đón</option>
                    <option value="DROPOFF">Điểm trả</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Chọn điểm</label>
                  <select required value={addStopPointForm.pointId} onChange={e => setAddStopPointForm({...addStopPointForm, pointId: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
                    <option value="" disabled>-- Chọn --</option>
                    {availablePoints.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Thứ tự</label>
                  <input type="number" min="0" value={addStopPointForm.orderIndex} onChange={e => setAddStopPointForm({...addStopPointForm, orderIndex: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Thời gian (phút)</label>
                  <input type="number" min="0" value={addStopPointForm.timeOffset} onChange={e => setAddStopPointForm({...addStopPointForm, timeOffset: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <button type="submit" className="px-4 py-2 bg-[#F4600C] text-white rounded-lg text-sm font-medium hover:bg-[#D5530A] transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">add</span> Thêm
              </button>
            </form>

            {/* Stop Points List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 font-semibold">STT</th>
                    <th className="px-4 py-3 font-semibold">Tên điểm</th>
                    <th className="px-4 py-3 font-semibold">Loại</th>
                    <th className="px-4 py-3 font-semibold">Thời gian offset</th>
                    <th className="px-4 py-3 font-semibold w-20">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingStopPoints ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Đang tải...</td></tr>
                  ) : stopPoints.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Chưa có điểm dừng nào.</td></tr>
                  ) : stopPoints.sort((a, b) => a.orderIndex - b.orderIndex).map((sp) => (
                    <tr key={sp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{sp.orderIndex}</td>
                      <td className="px-4 py-3">{sp.point?.name || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${sp.pointType === 'PICKUP' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {sp.pointType === 'PICKUP' ? 'Đón' : 'Trả'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{sp.timeOffset} phút</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleRemoveStopPoint(sp.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};
