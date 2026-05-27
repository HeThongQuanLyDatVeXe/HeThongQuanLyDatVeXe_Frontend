import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import type { DriverStatus, LicenseClass } from '../../types/driver-service/Driver';
import { useAdminDriversPage, STATUS_MAP, LICENSE_LABELS } from '../../hooks/pages/admin/useAdminDriversPage';

export const AdminDriversPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    drivers,
    loading,
    submitting,
    page,
    setPage,
    totalPages,
    isModalOpen,
    setIsModalOpen,
    editingDriver,
    setEditingDriver,
    formData,
    setFormData,
    formErrors,
    openModal,
    handleSubmit,
    handleDelete,
    handleStatusChange,
    isLicenseExpired
  } = useAdminDriversPage();

  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Tài xế</h1>
            <p className="text-sm text-slate-500 mt-1">Quản lý thông tin, bằng lái, trạng thái tài xế</p>
          </div>
          <button onClick={() => openModal()} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
            <span className="material-symbols-outlined">person_add</span> Thêm tài xế
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">Mã NV</th>
                <th className="px-4 py-3 font-semibold">Họ tên</th>
                <th className="px-4 py-3 font-semibold">SĐT</th>
                <th className="px-4 py-3 font-semibold text-center">Hạng GPLX</th>
                <th className="px-4 py-3 font-semibold">Hạn GPLX</th>
                <th className="px-4 py-3 font-semibold text-center">KN (năm)</th>
                <th className="px-4 py-3 font-semibold text-center">Trạng thái</th>
                <th className="px-4 py-3 font-semibold w-28 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  <span className="material-symbols-outlined animate-spin align-middle mr-1">progress_activity</span>Đang tải...
                </td></tr>
              ) : drivers.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Chưa có tài xế nào.</td></tr>
              ) : drivers.map(d => {
                const st = STATUS_MAP[d.status] || STATUS_MAP.ACTIVE;
                const expired = isLicenseExpired(d);
                return (
                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3"><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{d.employeeCode || '—'}</span></td>
                  <td className="px-4 py-3 font-medium">{d.fullName}</td>
                  <td className="px-4 py-3 text-sm">{d.phoneNumber}</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold">{d.licenseClass}</span></td>
                  <td className="px-4 py-3 text-sm">
                    {d.licenseExpiry ? (
                      <span className={expired ? 'text-red-600 font-semibold' : ''}>
                        {new Date(d.licenseExpiry).toLocaleDateString('vi-VN')} {expired && '⚠️'}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">{d.experienceYears ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <select value={d.status} onChange={e => handleStatusChange(d, e.target.value as DriverStatus)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${st.color}`}>
                      {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => navigate(`/admin/drivers/${d.id}`)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="Chi tiết">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                      <button onClick={() => openModal(d)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Sửa">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => handleDelete(d)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Xóa">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-200">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border disabled:opacity-50 text-sm">Trước</button>
              <span className="text-sm font-medium">Trang {page + 1} / {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border disabled:opacity-50 text-sm">Sau</button>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-1">{editingDriver ? 'Sửa tài xế' : 'Thêm tài xế mới'}</h2>
              <p className="text-sm text-slate-500 mb-4">{editingDriver ? `Mã NV: ${editingDriver.employeeCode || editingDriver.id.substring(0,8)}` : '(*) là bắt buộc'}</p>

              {formErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                  {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Personal info */}
                <fieldset className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <legend className="text-sm font-semibold text-slate-500 px-2">Thông tin cá nhân</legend>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Họ tên <span className="text-red-500">*</span></label>
                      <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Nguyễn Văn A" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SĐT <span className="text-red-500">*</span></label>
                      <input required type="text" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="0901234567" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                      <input type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CCCD / CMND</label>
                      <input type="text" value={formData.idCardNumber} onChange={e => setFormData({...formData, idCardNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                </fieldset>

                {/* License info */}
                <fieldset className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <legend className="text-sm font-semibold text-slate-500 px-2">Giấy phép lái xe</legend>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Số GPLX <span className="text-red-500">*</span></label>
                      <input required type="text" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Hạng bằng <span className="text-red-500">*</span></label>
                      <select required value={formData.licenseClass} onChange={e => setFormData({...formData, licenseClass: e.target.value as LicenseClass})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                        {Object.entries(LICENSE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Ngày hết hạn GPLX <span className="text-red-500">*</span></label>
                      <input required type="date" value={formData.licenseExpiry} onChange={e => setFormData({...formData, licenseExpiry: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                      <p className="text-xs text-slate-400 mt-1">Phải là ngày trong tương lai</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Số năm kinh nghiệm</label>
                      <input type="number" min={0} max={50} value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="0-50" />
                    </div>
                  </div>
                </fieldset>

                <div>
                  <label className="block text-sm font-medium mb-1">Ghi chú</label>
                  <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Ghi chú thêm..." />
                </div>

                <div className="flex gap-3 justify-end border-t pt-4">
                  <button type="button" onClick={() => { setIsModalOpen(false); setEditingDriver(null); }} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium disabled:opacity-50">Hủy</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] disabled:opacity-50 flex items-center gap-2">
                    {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                    {submitting ? 'Đang xử lý...' : editingDriver ? 'Cập nhật' : 'Thêm mới'}
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
