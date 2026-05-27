import React from 'react';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import type { RouteStatus } from '../../types/route-service/response';
import { useAdminRoutesPage, STATUS_MAP, fmtDuration } from '../../hooks/pages/admin/useAdminRoutesPage';

export const AdminRoutesPage: React.FC = () => {
  const {
    routes,
    cities,
    loading,
    submitting,
    formErrors,
    page,
    setPage,
    totalPages,
    searchKeyword,
    setSearchKeyword,
    filterOrigin,
    setFilterOrigin,
    filterDestination,
    setFilterDestination,
    filterStatus,
    setFilterStatus,
    isSearching,
    isModalOpen,
    editingRoute,
    formData,
    setFormData,
    isStopPointModalOpen,
    selectedRoute,
    stopPoints,
    loadingStopPoints,
    addStopPointForm,
    setAddStopPointForm,
    availablePoints,
    handleSearch,
    clearSearch,
    openModal,
    closeModal,
    handleSubmit,
    handleDelete,
    handleStatusChange,
    openStopPointModal,
    closeStopPointModal,
    handleAddStopPoint,
    handleRemoveStopPoint
  } = useAdminRoutesPage();

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
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold w-44">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Đang tải...</td></tr>
              ) : routes.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu.</td></tr>
              ) : routes.map((route) => (
                <tr key={route.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <div className="font-semibold text-slate-900">{route.name}</div>
                    <div className="text-sm text-slate-500">{route.code} • {route.originCityName} → {route.destinationCityName}</div>
                  </td>
                  <td className="px-6 py-4">{route.distanceKm} km</td>
                  <td className="px-6 py-4">{fmtDuration(route.durationMinutes)}</td>
                  <td className="px-6 py-4">
                    <select value={route.status} onChange={e => handleStatusChange(route, e.target.value as RouteStatus)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${(STATUS_MAP[route.status] || STATUS_MAP.ACTIVE).color}`}>
                      {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => openStopPointModal(route)} className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Quản lý điểm dừng">
                        <span className="material-symbols-outlined text-sm">pin_drop</span>
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
              <h2 className="text-2xl font-bold mb-2">{editingRoute ? 'Sửa tuyến đường' : 'Thêm tuyến đường mới'}</h2>
              <p className="text-sm text-slate-500 mb-4">{editingRoute ? `Mã: ${editingRoute.code}` : '(*) là bắt buộc'}</p>
              {formErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                  {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mã tuyến</label>
                    <input
                      required
                      type="text"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tên tuyến</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Điểm đi</label>
                    <select required value={formData.originCityId} onChange={e => setFormData({ ...formData, originCityId: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <option value="" disabled>-- Chọn --</option>
                      {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Điểm đến</label>
                    <select required value={formData.destinationCityId} onChange={e => setFormData({ ...formData, destinationCityId: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <option value="" disabled>-- Chọn --</option>
                      {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Khoảng cách (km)</label>
                    <input required type="number" step="any" min="0.01" value={formData.distanceKm} onChange={e => setFormData({ ...formData, distanceKm: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Thời gian ước tính (phút)</label>
                    <input required type="number" min="1" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value, 10) || 0 })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả (Tùy chọn)</label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                  <button type="button" onClick={closeModal} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium disabled:opacity-50">Hủy</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] disabled:opacity-50 flex items-center gap-2">
                    {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                    {submitting ? 'Đang xử lý...' : editingRoute ? 'Cập nhật' : 'Thêm mới'}
                  </button>
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
                    <select value={addStopPointForm.pointType} onChange={e => setAddStopPointForm({
                      ...addStopPointForm,
                      pointType: e.target.value as 'PICKUP' | 'DROPOFF',
                      stopPointId: '',
                      isPickup: e.target.value === 'PICKUP',
                      isDropoff: e.target.value === 'DROPOFF',
                    })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
                      <option value="PICKUP">Điểm đón</option>
                      <option value="DROPOFF">Điểm trả</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Chọn điểm</label>
                    <select required value={addStopPointForm.stopPointId} onChange={e => setAddStopPointForm({ ...addStopPointForm, stopPointId: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
                      <option value="" disabled>-- Chọn --</option>
                      {availablePoints.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Thứ tự</label>
                    <input type="number" min="0" value={addStopPointForm.stopOrder} onChange={e => setAddStopPointForm({ ...addStopPointForm, stopOrder: parseInt(e.target.value, 10) || 0 })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Offset đến (phút)</label>
                    <input type="number" min="0" value={addStopPointForm.arrivalOffsetMinutes} onChange={e => setAddStopPointForm({ ...addStopPointForm, arrivalOffsetMinutes: parseInt(e.target.value, 10) || 0 })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Offset đi (phút)</label>
                    <input type="number" min="0" value={addStopPointForm.departureOffsetMinutes} onChange={e => setAddStopPointForm({ ...addStopPointForm, departureOffsetMinutes: parseInt(e.target.value, 10) || 0 })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
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
                    ) : stopPoints.sort((a, b) => a.stopOrder - b.stopOrder).map((sp) => (
                      <tr key={sp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium">{sp.stopOrder}</td>
                        <td className="px-4 py-3">{sp.stopPointName || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${sp.type === 'PICKUP' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                            {sp.type === 'PICKUP' ? 'Đón' : 'Trả'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{sp.arrivalOffsetMinutes ?? 0} / {sp.departureOffsetMinutes ?? 0} phút</td>
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
