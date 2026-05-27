import React from 'react';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import type { MaintenanceStatus } from '../../types/vehicle-service/Vehicle';
import { useAdminMaintenancePage, STATUS_MAP } from '../../hooks/pages/admin/useAdminMaintenancePage';

export const AdminMaintenancePage: React.FC = () => {
    const {
        maintenanceLogs,
        vehicles,
        loading,
        submitting,
        formErrors,
        page,
        setPage,
        totalPages,
        isModalOpen,
        editingLog,
        formData,
        setFormData,
        openModal,
        closeModal,
        handleSubmit,
        handleDelete
    } = useAdminMaintenancePage();

    return (
        <AdminLayout>
            <div className="space-y-6 text-slate-800">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Bảo trì Xe</h1>
                    <button onClick={() => openModal()} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
                        <span className="material-symbols-outlined">add</span>
                        Thêm Lịch Bảo Trì
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 font-semibold">Xe</th>
                                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold">Lịch trình</th>
                                <th className="px-6 py-4 font-semibold">Mô tả</th>
                                <th className="px-6 py-4 font-semibold w-24">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Đang tải...</td></tr>
                            ) : maintenanceLogs.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu.</td></tr>
                            ) : maintenanceLogs.map((log) => {
                                const vehicle = vehicles.find(v => v.id === log.vehicleId);
                                return (
                                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{log.vehicleLicensePlate || vehicle?.licensePlate || log.vehicleId}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_MAP[log.status]?.color || 'bg-slate-100 text-slate-700'}`}>
                                                {STATUS_MAP[log.status]?.label || log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(log.scheduledAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-sm">{log.description}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1">
                                                <button onClick={() => openModal(log)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(log.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
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
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4">{editingLog ? 'Cập nhật bảo trì' : 'Thêm lịch bảo trì'}</h2>
                            {formErrors.length > 0 && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                                    {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!editingLog && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Xe</label>
                                            <select required value={formData.vehicleId} onChange={e => setFormData({ ...formData, vehicleId: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                                                <option value="" disabled>-- Chọn xe --</option>
                                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Lịch trình</label>
                                            <input required type="datetime-local" value={formData.scheduledAt} onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Mô tả</label>
                                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" rows={2}></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Chi phí</label>
                                            <input type="number" min={0} step="0.01" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Người thực hiện</label>
                                            <input type="text" value={formData.performedBy} onChange={e => setFormData({ ...formData, performedBy: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                        </div>
                                    </>
                                )}
                                {editingLog && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Trạng thái</label>
                                            <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as MaintenanceStatus })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                                                <option value="SCHEDULED">Đã lên lịch</option>
                                                <option value="IN_PROGRESS">Đang thực hiện</option>
                                                <option value="COMPLETED">Hoàn thành</option>
                                                <option value="CANCELLED">Đã hủy</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Bắt đầu</label>
                                            <input type="datetime-local" value={formData.startedAt} onChange={e => setFormData({ ...formData, startedAt: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Hoàn thành</label>
                                            <input type="datetime-local" value={formData.completedAt} onChange={e => setFormData({ ...formData, completedAt: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Mô tả</label>
                                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" rows={2}></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Chi phí</label>
                                            <input type="number" min={0} step="0.01" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Người thực hiện</label>
                                            <input type="text" value={formData.performedBy} onChange={e => setFormData({ ...formData, performedBy: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                                    <button type="button" onClick={closeModal} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50">Hủy</button>
                                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors flex items-center gap-2 disabled:opacity-50">
                                        {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                        {editingLog ? 'Cập nhật' : 'Thêm mới'}
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
