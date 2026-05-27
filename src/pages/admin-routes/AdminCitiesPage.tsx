import React from 'react';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useAdminCitiesPage } from '../../hooks/pages/admin/useAdminCitiesPage';

export const AdminCitiesPage: React.FC = () => {
  const {
    cities,
    loading,
    submitting,
    isModalOpen,
    setIsModalOpen,
    editingCity,
    setEditingCity,
    formData,
    setFormData,
    formErrors,
    openModal,
    handleSubmit,
    handleDelete,
    activeCount
  } = useAdminCitiesPage();

  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Thành phố</h1>
            <p className="text-sm text-slate-500 mt-1">Danh sách các tỉnh/thành phố phục vụ tuyến đường</p>
          </div>
          <button onClick={() => openModal()} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
            <span className="material-symbols-outlined">add_location_alt</span> Thêm thành phố
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold w-16 text-center">TT</th>
                <th className="px-4 py-3 font-semibold">Mã</th>
                <th className="px-4 py-3 font-semibold">Tên thành phố</th>
                <th className="px-4 py-3 font-semibold">Tỉnh / Vùng</th>
                <th className="px-4 py-3 font-semibold text-center">Trạng thái</th>
                <th className="px-4 py-3 font-semibold w-24 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  <span className="material-symbols-outlined animate-spin align-middle mr-1">progress_activity</span>Đang tải...
                </td></tr>
              ) : cities.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">location_city</span>
                  Chưa có thành phố nào.
                  <button onClick={() => openModal()} className="block mx-auto mt-2 text-[#F4600C] underline text-sm">Thêm thành phố đầu tiên</button>
                </td></tr>
              ) : cities.map(c => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-center text-sm text-slate-400">{c.sortOrder}</td>
                  <td className="px-4 py-3"><span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">{c.code}</span></td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{c.province || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => openModal(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Sửa">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => handleDelete(c)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Xóa">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stats */}
        {!loading && cities.length > 0 && (
          <div className="text-sm text-slate-500 flex gap-4">
            <span>Tổng: <strong>{cities.length}</strong></span>
            <span>Hoạt động: <strong className="text-green-600">{activeCount}</strong></span>
            <span>Tạm dừng: <strong className="text-red-600">{cities.length - activeCount}</strong></span>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-1">{editingCity ? 'Sửa thành phố' : 'Thêm thành phố mới'}</h2>
              <p className="text-sm text-slate-500 mb-4">{editingCity ? `Mã: ${editingCity.code}` : '(*) là bắt buộc'}</p>

              {formErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                  {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mã thành phố <span className="text-red-500">*</span></label>
                    <input required type="text" maxLength={10} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono" placeholder="HCM, HN..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tên thành phố <span className="text-red-500">*</span></label>
                    <input required type="text" maxLength={100} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="TP. Hồ Chí Minh" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tỉnh / Vùng</label>
                  <input type="text" maxLength={100} value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Đông Nam Bộ, Tây Nguyên..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Thứ tự hiển thị</label>
                    <input type="number" min={0} value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                    <p className="text-xs text-slate-400 mt-1">Số nhỏ hiển thị trước</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Trạng thái</label>
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                      <span className="text-sm">{formData.isActive ? 'Hoạt động' : 'Tạm dừng'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end border-t pt-4">
                  <button type="button" onClick={() => { setIsModalOpen(false); setEditingCity(null); }} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium disabled:opacity-50">Hủy</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] disabled:opacity-50 flex items-center gap-2">
                    {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                    {submitting ? 'Đang xử lý...' : editingCity ? 'Cập nhật' : 'Thêm mới'}
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
