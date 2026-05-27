import React from 'react';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useNavigate } from 'react-router-dom';
import type { TripStatus } from '../../types/trip-service/Trip';
import { useAdminTripsPage, STATUS_MAP } from '../../hooks/pages/admin/useAdminTripsPage';

export const AdminTripsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    trips,
    routes,
    vehicles,
    loading,
    submitting,
    formErrors,
    page,
    setPage,
    totalPages,
    filterRouteId, setFilterRouteId,
    filterStatus, setFilterStatus,
    filterFromDate, setFilterFromDate,
    filterToDate, setFilterToDate,
    isSearching,
    handleSearch, clearSearch,
    isModalOpen,
    editingTrip,
    formData,
    setFormData,
    openModal,
    closeModal,
    getSelectedRouteDuration,
    fmtDuration,
    handleDepartureChange,
    handleArrivalChange,
    handleRouteChange,
    handleVehicleChange,
    handleSubmit,
    handleDelete,
    handleStatusChange,
  } = useAdminTripsPage();

  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-800">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Lịch trình (Chuyến)</h1>
          <button onClick={() => openModal()} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
            <span className="material-symbols-outlined">add</span>
            Thêm chuyến
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <select
              value={filterRouteId}
              onChange={e => setFilterRouteId(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] transition-all flex-1 min-w-[200px]"
            >
              <option value="">-- Tất cả tuyến đường --</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.originCityName} - {r.destinationCityName}</option>)}
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C] transition-all min-w-[150px]"
            >
              <option value="">-- Trạng thái --</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Từ:</span>
              <input 
                type="date" 
                value={filterFromDate} 
                onChange={e => setFilterFromDate(e.target.value)} 
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Đến:</span>
              <input 
                type="date" 
                value={filterToDate} 
                onChange={e => setFilterToDate(e.target.value)} 
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F4600C]"
              />
            </div>

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
                <th className="px-6 py-4 font-semibold">Mã chuyến</th>
                <th className="px-6 py-4 font-semibold">Tuyến</th>
                <th className="px-6 py-4 font-semibold">Xe / Ghế</th>
                <th className="px-6 py-4 font-semibold">Khởi hành</th>
                <th className="px-6 py-4 font-semibold">Đến (Dự kiến)</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold w-40">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Đang tải...</td></tr>
              ) : trips.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu.</td></tr>
              ) : trips.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{t.tripCode || 'N/A'}</td>
                  <td className="px-6 py-4 font-medium text-sm">
                    {t.route?.name || 
                     (t.route?.originCityName ? `${t.route.originCityName} - ${t.route.destinationCityName}` : null) || 
                     (() => { const r = routes.find(x => x.id === t.routeId); return r ? `${r.originCityName} - ${r.destinationCityName}` : t.routeId; })()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-semibold">{t.vehicle?.licensePlate || vehicles.find(v => v.id === t.vehicleId)?.licensePlate || t.vehicleId}</div>
                    <div className="text-slate-500 text-xs mt-0.5">Trống: {t.availableSeats ?? 0}/{t.totalSeats ?? 0}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {t.departureDatetime ? new Date(t.departureDatetime).toLocaleString('vi-VN') : ''}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {t.arrivalDatetime ? new Date(t.arrivalDatetime).toLocaleString('vi-VN') : ''}
                  </td>
                  <td className="px-6 py-4">
                    <select value={t.status} onChange={e => handleStatusChange(t, e.target.value as TripStatus)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${(STATUS_MAP[t.status] || STATUS_MAP.SCHEDULED).color}`}>
                      {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => navigate(`/admin/trips/${t.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Chi tiết chuyến">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                      <button onClick={() => navigate(`/admin/trips/${t.id}/seat-overrides`)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Seat Overrides">
                        <span className="material-symbols-outlined text-sm">airline_seat_recline_extra</span>
                      </button>
                      <button onClick={() => openModal(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
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
              <h2 className="text-2xl font-bold mb-4">{editingTrip ? 'Sửa chuyến' : 'Thêm chuyến mới'}</h2>
              {formErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                  {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tuyến đường</label>
                    <select required disabled={!!editingTrip} value={formData.routeId} onChange={e => handleRouteChange(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50">
                      <option value="" disabled>-- Chọn tuyến --</option>
                      {routes.map(r => <option key={r.id} value={r.id}>{r.originCityName} - {r.destinationCityName} ({r.durationMinutes ? fmtDuration(r.durationMinutes) : '?'})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Xe</label>
                    <select required value={formData.vehicleId} onChange={e => handleVehicleChange(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <option value="" disabled>-- Chọn xe --</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Khởi hành</label>
                    <input required type="datetime-local" value={formData.departureDatetime} onChange={e => handleDepartureChange(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Đến (dự kiến) — <span className="text-xs text-slate-400 font-normal">tự động tính hoặc nhập tay</span></label>
                    <input required type="datetime-local" value={formData.arrivalDatetime} onChange={e => handleArrivalChange(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                    {getSelectedRouteDuration() > 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        Thời gian tuyến: <span className="font-semibold text-slate-500">{fmtDuration(getSelectedRouteDuration())}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tổng số ghế (Tùy chọn)</label>
                    <input type="number" min="1" value={formData.totalSeats || ''} onChange={e => setFormData({...formData, totalSeats: e.target.value ? Number(e.target.value) : undefined})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Mặc định theo xe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ghi chú (Tùy chọn)</label>
                    <input type="text" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Ghi chú về chuyến đi" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                  <button type="button" onClick={closeModal} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium disabled:opacity-50">Hủy</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] flex items-center gap-2 disabled:opacity-50">
                    {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                    {submitting ? 'Đang xử lý...' : editingTrip ? 'Cập nhật' : 'Thêm mới'}
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
