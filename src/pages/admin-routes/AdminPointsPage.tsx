import React from 'react';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import type { TabType, PointType } from '../../hooks/pages/admin/useAdminPointsPage';
import { useAdminPointsPage, TYPE_LABELS } from '../../hooks/pages/admin/useAdminPointsPage';

export const AdminPointsPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    points,
    cities,
    loading,
    submitting,
    filterCityId,
    setFilterCityId,
    page,
    setPage,
    totalPages,
    isModalOpen,
    setIsModalOpen,
    editingPoint,
    setEditingPoint,
    formData,
    setFormData,
    formErrors,
    openModal,
    handleSubmit,
    handleDelete,
    getCityName
  } = useAdminPointsPage();

  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Điểm đón / trả</h1>
            <p className="text-sm text-slate-500 mt-1">Các bến xe, trạm đón trả khách trên tuyến</p>
          </div>
          <button onClick={() => openModal()} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
            <span className="material-symbols-outlined">add_location</span>
            Thêm {activeTab === 'PICKUP' ? 'điểm đón' : 'điểm trả'}
          </button>
        </div>

        {/* Tabs + Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex border-b border-slate-300">
            {(['PICKUP', 'DROPOFF'] as TabType[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${activeTab === tab ? 'border-[#F4600C] text-[#F4600C]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <span className="material-symbols-outlined text-sm">{tab === 'PICKUP' ? 'hail' : 'pin_drop'}</span>
                {tab === 'PICKUP' ? 'Điểm Đón' : 'Điểm Trả'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Lọc:</span>
            <select value={filterCityId} onChange={e => setFilterCityId(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
              <option value="">Tất cả thành phố</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold w-12 text-center">TT</th>
                <th className="px-4 py-3 font-semibold">Tên điểm</th>
                <th className="px-4 py-3 font-semibold">Địa chỉ</th>
                <th className="px-4 py-3 font-semibold">Thành phố</th>
                <th className="px-4 py-3 font-semibold text-center">Loại</th>
                <th className="px-4 py-3 font-semibold text-center">Trạng thái</th>
                <th className="px-4 py-3 font-semibold w-24 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  <span className="material-symbols-outlined animate-spin align-middle mr-1">progress_activity</span>Đang tải...
                </td></tr>
              ) : points.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">location_off</span>
                  Chưa có {activeTab === 'PICKUP' ? 'điểm đón' : 'điểm trả'} nào.
                </td></tr>
              ) : points.map(p => {
                const tInfo = TYPE_LABELS[p.type] || TYPE_LABELS.BOTH;
                return (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-center text-sm text-slate-400">{p.sortOrder}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 max-w-[250px] truncate" title={p.address}>{p.address}</td>
                  <td className="px-4 py-3 text-sm">{getCityName(p.cityId, p.cityName)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tInfo.color}`}>
                      {tInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => openModal(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Sửa">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => handleDelete(p)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Xóa">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          {totalPages > 1 && !filterCityId && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-200">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border disabled:opacity-50 text-sm">Trước</button>
              <span className="text-sm font-medium">Trang {page + 1} / {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border disabled:opacity-50 text-sm">Sau</button>
            </div>
          )}
        </div>

        {/* Stats */}
        {!loading && points.length > 0 && (
          <div className="text-sm text-slate-500 flex gap-4">
            <span>Tổng: <strong>{points.length}</strong></span>
            <span>Hoạt động: <strong className="text-green-600">{points.filter(p => p.isActive).length}</strong></span>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-1">
                {editingPoint ? 'Sửa điểm dừng' : `Thêm ${activeTab === 'PICKUP' ? 'điểm đón' : 'điểm trả'}`}
              </h2>
              <p className="text-sm text-slate-500 mb-4">(*) là bắt buộc</p>

              {formErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                  {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên điểm <span className="text-red-500">*</span></label>
                  <input required type="text" maxLength={200} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Bến xe Miền Đông, Trạm Ngã Tư Bình Phước..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Thành phố <span className="text-red-500">*</span></label>
                    <select required value={formData.cityId} onChange={e => setFormData({...formData, cityId: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <option value="" disabled>— Chọn —</option>
                      {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại điểm</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as PointType})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <option value="PICKUP">Điểm đón</option>
                      <option value="DROPOFF">Điểm trả</option>
                      <option value="BOTH">Đón + Trả</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Vĩ độ (Lat)</label>
                    <input type="number" step="any" min={-90} max={90} value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm" placeholder="10.8231" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kinh độ (Lng)</label>
                    <input type="number" step="any" min={-180} max={180} value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm" placeholder="106.6297" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Thứ tự hiển thị</label>
                    <input type="number" min={0} value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
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
                  <button type="button" onClick={() => { setIsModalOpen(false); setEditingPoint(null); }} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium disabled:opacity-50">Hủy</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] disabled:opacity-50 flex items-center gap-2">
                    {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                    {submitting ? 'Đang xử lý...' : editingPoint ? 'Cập nhật' : 'Thêm mới'}
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
