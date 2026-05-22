import React, { useState, useEffect } from 'react';
import { vehicleService } from '../../services/vehicle-service/vehicleService';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useToast } from '../../contexts/ToastContext';
import type { VehicleResponse, VehicleTypeResponse, CreateVehicleRequest } from '../../types/vehicle-service/Vehicle';

export const AdminVehiclesPage: React.FC = () => {
  const { success, error: showError } = useToast();
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleResponse | null>(null);
  const [formData, setFormData] = useState<CreateVehicleRequest>({
    vehicleTypeId: '',
    licensePlate: '',
  });

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  useEffect(() => {
    fetchVehicles(page);
  }, [page]);

  const fetchVehicleTypes = async () => {
    try {
      const res = await vehicleService.getVehicleTypes();
      const payload = res.data.result || res.data.data;
      setVehicleTypes(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Failed to fetch vehicle types');
    }
  };

  const fetchVehicles = async (pageIndex: number) => {
    setLoading(true);
    try {
      const apiRes = await vehicleService.getAllVehicles({ page: pageIndex, size: 10 });
      const res = apiRes.data.result || apiRes.data.data;
      if (res) {
        setVehicles(res.content);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (vehicle?: VehicleResponse) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        vehicleTypeId: vehicle.vehicleTypeId,
        licensePlate: vehicle.licensePlate,
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        vehicleTypeId: vehicleTypes.length > 0 ? vehicleTypes[0].id : '',
        licensePlate: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.id, formData);
      } else {
        await vehicleService.createVehicle(formData);
      }
      closeModal();
      success(editingVehicle ? 'Cập nhật xe thành công' : 'Thêm xe thành công');
      fetchVehicles(page);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa xe này?')) return;
    try {
      await vehicleService.deleteVehicle(id);
      success('Đã xóa xe');
      fetchVehicles(page);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể xóa xe');
    }
  };

  const toggleStatus = async (vehicle: VehicleResponse) => {
    const newStatus = vehicle.status === 'ACTIVE' ? 'INACTIVE' : vehicle.status === 'INACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    if (!window.confirm(`Đổi trạng thái thành ${newStatus}?`)) return;
    try {
      await vehicleService.updateVehicleStatus(vehicle.id, { status: newStatus });
      success('Cập nhật trạng thái thành công');
      fetchVehicles(page);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-800">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Xe</h1>
          <button onClick={() => openModal()} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
            <span className="material-symbols-outlined">add</span>
            Thêm xe
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Biển số</th>
                <th className="px-6 py-4 font-semibold">Loại xe ID</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold">Ngày tạo</th>
                <th className="px-6 py-4 font-semibold w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Đang tải...</td></tr>
              ) : vehicles.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu.</td></tr>
              ) : vehicles.map((v) => (
                <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{v.licensePlate}</td>
                  <td className="px-6 py-4">{v.vehicleTypeId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      v.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      v.status === 'INACTIVE' ? 'bg-slate-100 text-slate-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(v.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => toggleStatus(v)} className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Đổi trạng thái">
                        <span className="material-symbols-outlined text-sm">power_settings_new</span>
                      </button>
                      <button onClick={() => openModal(v)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
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
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">{editingVehicle ? 'Sửa xe' : 'Thêm xe mới'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Loại xe</label>
                  <select required value={formData.vehicleTypeId} onChange={e => setFormData({...formData, vehicleTypeId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <option value="" disabled>-- Chọn loại xe --</option>
                    {vehicleTypes.map(vt => <option key={vt.id} value={vt.id}>{vt.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Biển số</label>
                  <input required type="text" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="VD: 51B-123.45" />
                </div>
                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors">{editingVehicle ? 'Cập nhật' : 'Thêm mới'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
