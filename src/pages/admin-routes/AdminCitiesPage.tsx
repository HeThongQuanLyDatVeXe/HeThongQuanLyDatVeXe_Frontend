import React, { useState, useEffect } from 'react';
import { routeService } from '../../services/route-service/routeService';
import { adminRouteService } from '../../services/route-service/adminRouteService';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import type { CityResponse } from '../../types/route-service/response';

export const AdminCitiesPage: React.FC = () => {
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<CityResponse | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', code: '', region: '', imageUrl: '' });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await routeService.getCities();
      setCities(res.data.result ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi tải danh sách thành phố');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (city?: CityResponse) => {
    if (city) {
      setEditingCity(city);
      setFormData({ name: city.name, code: city.code, region: city.region || '', imageUrl: city.imageUrl || '' });
    } else {
      setEditingCity(null);
      setFormData({ name: '', code: '', region: '', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCity(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCity) {
        await adminRouteService.updateCity(editingCity.id, formData);
      } else {
        await adminRouteService.createCity(formData);
      }
      closeModal();
      fetchCities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành phố này?')) return;
    try {
      await adminRouteService.deleteCity(id);
      fetchCities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa thành phố');
    }
  };

  if (loading && cities.length === 0) return <AdminLayout><div className="p-8 text-slate-800">Đang tải...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Thành phố</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Thêm thành phố
        </button>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-600 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 font-semibold">Mã</th>
              <th className="px-6 py-4 font-semibold">Tên thành phố</th>
              <th className="px-6 py-4 font-semibold">Vùng miền</th>
              <th className="px-6 py-4 font-semibold w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{city.code}</td>
                <td className="px-6 py-4">{city.name}</td>
                <td className="px-6 py-4">{city.region || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(city)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Sửa"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(city.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Xóa"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {cities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Chưa có dữ liệu thành phố.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              {editingCity ? 'Sửa thành phố' : 'Thêm thành phố mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
              <div>
                <label className="block text-sm font-medium mb-1">Mã thành phố (Ví dụ: SG, HN)</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] focus:ring-1 focus:ring-[#F4600C] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tên thành phố</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] focus:ring-1 focus:ring-[#F4600C] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vùng miền (Tùy chọn)</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={e => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] focus:ring-1 focus:ring-[#F4600C] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ảnh đại diện URL (Tùy chọn)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] focus:ring-1 focus:ring-[#F4600C] transition-all"
                />
              </div>
              <div className="flex gap-3 justify-end mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors"
                >
                  {editingCity ? 'Cập nhật' : 'Thêm mới'}
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
