import React, { useState, useEffect } from 'react';
import { adminDriverService } from '../../services/driver-service/adminDriverService';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useToast } from '../../contexts/ToastContext';
import type { DriverResponse, CreateDriverRequest } from '../../types/driver-service/Driver';

export const AdminDriversPage: React.FC = () => {
  const { success, error: showError } = useToast();
  const [drivers, setDrivers] = useState<DriverResponse[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverResponse | null>(null);
  
  const [formData, setFormData] = useState<CreateDriverRequest>({
    fullName: '',
    phoneNumber: '',
    licenseNumber: '',
    licenseClass: 'E',
    licenseExpiry: '',
  });

  useEffect(() => {
    fetchDrivers(page);
  }, [page]);

  const fetchDrivers = async (pageIndex: number) => {
    setLoading(true);
    try {
      const apiRes = await adminDriverService.getAllDrivers({ page: pageIndex, size: 10 });
      const res = apiRes.data.result || apiRes.data.data;
      if (res) {
        setDrivers(res.content);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (driver?: DriverResponse) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        fullName: driver.fullName,
        phoneNumber: driver.phoneNumber,
        licenseNumber: driver.licenseNumber,
        licenseClass: driver.licenseClass || 'E',
        licenseExpiry: '', // you might need to fetch this or parse if available
      });
    } else {
      setEditingDriver(null);
      setFormData({
        fullName: '',
        phoneNumber: '',
        licenseNumber: '',
        licenseClass: 'E',
        licenseExpiry: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDriver(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await adminDriverService.updateDriver(editingDriver.id, formData);
      } else {
        await adminDriverService.createDriver(formData);
      }
      closeModal();
      success(editingDriver ? 'Cập nhật tài xế thành công' : 'Thêm tài xế thành công');
      fetchDrivers(page);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa tài xế này?')) return;
    try {
      await adminDriverService.deleteDriver(id);
      success('Đã xóa tài xế');
      fetchDrivers(page);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể xóa tài xế');
    }
  };

  const toggleStatus = async (driver: DriverResponse) => {
    const newStatus = driver.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`Đổi trạng thái thành ${newStatus}?`)) return;
    try {
      await adminDriverService.updateDriverStatus(driver.id, { status: newStatus });
      success('Cập nhật trạng thái thành công');
      fetchDrivers(page);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-800">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Tài xế</h1>
          <button onClick={() => openModal()} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
            <span className="material-symbols-outlined">add</span>
            Thêm tài xế
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Tên tài xế</th>
                <th className="px-6 py-4 font-semibold">SĐT</th>
                <th className="px-6 py-4 font-semibold">Hạng bằng</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Đang tải...</td></tr>
              ) : drivers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu.</td></tr>
              ) : drivers.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{d.fullName}</td>
                  <td className="px-6 py-4">{d.phoneNumber}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">{d.licenseClass}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      d.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => toggleStatus(d)} className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Đổi trạng thái">
                        <span className="material-symbols-outlined text-sm">power_settings_new</span>
                      </button>
                      <button onClick={() => openModal(d)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
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
              <h2 className="text-2xl font-bold mb-6">{editingDriver ? 'Sửa tài xế' : 'Thêm tài xế mới'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Họ tên</label>
                    <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input required type="text" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Số GPLX</label>
                    <input required type="text" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Hạng bằng</label>
                    <select required value={formData.licenseClass} onChange={e => setFormData({...formData, licenseClass: e.target.value as any})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <option value="D">Hạng D</option>
                      <option value="E">Hạng E</option>
                      <option value="F">Hạng F</option>
                    </select>
                  </div>
                </div>
                {!editingDriver && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Ngày hết hạn GPLX</label>
                    <input required type="date" value={formData.licenseExpiry} onChange={e => setFormData({...formData, licenseExpiry: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                )}
                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors">{editingDriver ? 'Cập nhật' : 'Thêm mới'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
