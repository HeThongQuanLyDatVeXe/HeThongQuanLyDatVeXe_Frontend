import React, { useState, useEffect } from 'react';
import { routeService } from '../../services/route-service/routeService';
import { adminRouteService } from '../../services/route-service/adminRouteService';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useToast } from '../../contexts/ToastContext';
import type { PointResponse, CityResponse } from '../../types/route-service/response';

export const AdminPointsPage: React.FC = () => {
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<'PICKUP' | 'DROPOFF'>('PICKUP');
  const [points, setPoints] = useState<PointResponse[]>([]);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCityId, setFilterCityId] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PointResponse | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', cityId: '', description: '', latitude: 0, longitude: 0 });

  useEffect(() => { fetchCities(); }, []);
  useEffect(() => { fetchPoints(); }, [activeTab, filterCityId]);

  const fetchCities = async () => {
    try {
      const res = await routeService.getCities();
      const payload = res.data.result || res.data.data;
      const citiesArray = Array.isArray(payload) ? payload : (payload as any)?.content || [];
      setCities(citiesArray);
    } catch (err) { console.error('Failed to fetch cities', err); }
  };

  const fetchPoints = async () => {
    setLoading(true);
    try {
      let res;
      if (filterCityId) {
        // Use city-specific endpoint
        res = activeTab === 'PICKUP'
          ? await routeService.getPickupPointsByCity(filterCityId)
          : await routeService.getDropoffPointsByCity(filterCityId);
      } else {
        res = activeTab === 'PICKUP' 
          ? await routeService.getPickupPoints()
          : await routeService.getDropoffPoints();
      }
      const payload = res.data.result || res.data.data;
      // Handle both array and paginated response formats
      const pointsArray = Array.isArray(payload) ? payload : (payload as any)?.content || [];
      setPoints(pointsArray);
    } catch (err) { console.error('Failed to fetch points', err); setPoints([]); }
    finally { setLoading(false); }
  };

  const openModal = (point?: PointResponse) => {
    if (point) {
      setEditingPoint(point);
      setFormData({ name: point.name, address: point.address, cityId: point.cityId, description: point.description || '', latitude: point.latitude || 0, longitude: point.longitude || 0 });
    } else {
      setEditingPoint(null);
      setFormData({ name: '', address: '', cityId: filterCityId || cities[0]?.id || '', description: '', latitude: 0, longitude: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingPoint(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPoint) {
        if (activeTab === 'PICKUP') await adminRouteService.updatePickupPoint(editingPoint.id, formData);
        else await adminRouteService.updateDropoffPoint(editingPoint.id, formData);
      } else {
        if (activeTab === 'PICKUP') await adminRouteService.createPickupPoint(formData);
        else await adminRouteService.createDropoffPoint(formData);
      }
      closeModal();
      success(editingPoint ? 'Cập nhật điểm dừng thành công' : 'Thêm điểm dừng thành công');
      fetchPoints();
    } catch (err: any) { showError(err.response?.data?.message || 'Có lỗi xảy ra'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa điểm dừng này?')) return;
    try {
      if (activeTab === 'PICKUP') await adminRouteService.deletePickupPoint(id);
      else await adminRouteService.deleteDropoffPoint(id);
      success('Đã xóa điểm dừng');
      fetchPoints();
    } catch (err: any) { showError(err.response?.data?.message || 'Không thể xóa điểm này'); }
  };

  const getCityName = (cityId: string) => cities.find(c => c.id === cityId)?.name || 'Unknown';

  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-800">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Điểm đón / trả</h1>
        <button onClick={() => openModal()} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
          <span className="material-symbols-outlined">add</span>
          Thêm {activeTab === 'PICKUP' ? 'Điểm Đón' : 'Điểm Trả'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex border-b border-slate-300 gap-8">
          <button className={`py-3 px-1 font-medium transition-colors border-b-2 ${activeTab === 'PICKUP' ? 'border-[#F4600C] text-[#F4600C]' : 'border-transparent text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab('PICKUP')}>
            Điểm Đón
          </button>
          <button className={`py-3 px-1 font-medium transition-colors border-b-2 ${activeTab === 'DROPOFF' ? 'border-[#F4600C] text-[#F4600C]' : 'border-transparent text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab('DROPOFF')}>
            Điểm Trả
          </button>
        </div>
        {/* Filter by city */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Lọc theo thành phố:</span>
          <select value={filterCityId} onChange={e => setFilterCityId(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#F4600C] focus:ring-1 focus:ring-[#F4600C] transition-all">
            <option value="">Tất cả</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 font-semibold">Tên điểm</th>
              <th className="px-6 py-4 font-semibold">Địa chỉ</th>
              <th className="px-6 py-4 font-semibold">Thành phố</th>
              <th className="px-6 py-4 font-semibold">Mô tả</th>
              <th className="px-6 py-4 font-semibold w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Đang tải...</td></tr>
            ) : points.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu.</td></tr>
            ) : points.map((point, idx) => (
              <tr key={`${point.id}-${idx}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium">{point.name}</td>
                <td className="px-6 py-4 text-sm">{point.address}</td>
                <td className="px-6 py-4">{getCityName(point.cityId)}</td>
                <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{point.description || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openModal(point)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onClick={() => handleDelete(point.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">
              {editingPoint ? `Sửa ${activeTab === 'PICKUP' ? 'điểm đón' : 'điểm trả'}` : `Thêm ${activeTab === 'PICKUP' ? 'điểm đón' : 'điểm trả'}`}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên điểm</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] focus:ring-1 focus:ring-[#F4600C] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] focus:ring-1 focus:ring-[#F4600C] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thành phố</label>
                <select required value={formData.cityId} onChange={e => setFormData({...formData, cityId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] focus:ring-1 focus:ring-[#F4600C] transition-all">
                  <option value="" disabled>-- Chọn thành phố --</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả thêm (Tùy chọn)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] focus:ring-1 focus:ring-[#F4600C] transition-all" rows={3}></textarea>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Vĩ độ (Lat)</label>
                  <input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] focus:ring-1 focus:ring-[#F4600C] transition-all" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Kinh độ (Lng)</label>
                  <input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] focus:ring-1 focus:ring-[#F4600C] transition-all" />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-8">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors">{editingPoint ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};
