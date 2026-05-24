import React, { useEffect, useState } from 'react';
import { vehicleService } from '../../services/vehicle-service/vehicleService';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useToast } from '../../contexts/ToastContext';
import type { MaintenanceLogResponse, CreateMaintenanceRequest, UpdateMaintenanceRequest, VehicleResponse, MaintenanceStatus } from '../../types/vehicle-service/Vehicle';

type MaintenanceFormState = {
    vehicleId: string;
    scheduledAt: string;
    description: string;
    cost: string;
    performedBy: string;
    status: MaintenanceStatus;
    startedAt: string;
    completedAt: string;
};

const DEFAULT_STATUS: MaintenanceStatus = 'SCHEDULED';

const STATUS_MAP: Record<MaintenanceStatus, { label: string, color: string }> = {
    'SCHEDULED': { label: 'Đã lên lịch', color: 'bg-orange-100 text-orange-700' },
    'IN_PROGRESS': { label: 'Đang bảo trì', color: 'bg-blue-100 text-blue-700' },
    'COMPLETED': { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
    'CANCELLED': { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
};

export const AdminMaintenancePage: React.FC = () => {
    const { success, error: showError } = useToast();
    const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLogResponse[]>([]);
    const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<MaintenanceLogResponse | null>(null);
    const [formData, setFormData] = useState<MaintenanceFormState>({
        vehicleId: '',
        scheduledAt: '',
        description: '',
        cost: '',
        performedBy: '',
        status: DEFAULT_STATUS,
        startedAt: '',
        completedAt: '',
    });

    const toOffsetDateTime = (value: string) => {
        if (!value) return undefined;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
    };

    const toDateTimeLocal = (value?: string) => {
        if (!value) return '';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        fetchMaintenanceLogs(page);
    }, [page]);

    const fetchVehicles = async () => {
        try {
            const apiRes = await vehicleService.getAllVehicles({ size: 100 });
            const res = apiRes.data.result || apiRes.data.data;
            if (res) setVehicles(res.content);
        } catch (err) {
            console.error('Failed to fetch vehicles');
        }
    };

    const fetchMaintenanceLogs = async (pageIndex: number) => {
        setLoading(true);
        try {
            const apiRes = await vehicleService.getAllMaintenanceSchedules({ page: pageIndex, size: 10 });
            const res = apiRes.data.result || apiRes.data.data;
            if (res) {
                setMaintenanceLogs(res.content);
                setTotalPages(res.totalPages);
            }
        } catch (err) {
            console.error('Failed to fetch maintenance logs');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (log?: MaintenanceLogResponse) => {
        setFormErrors([]);
        if (log) {
            setEditingLog(log);
            setFormData({
                vehicleId: log.vehicleId,
                status: log.status,
                scheduledAt: toDateTimeLocal(log.scheduledAt),
                startedAt: toDateTimeLocal(log.startedAt),
                completedAt: toDateTimeLocal(log.completedAt),
                description: log.description || '',
                cost: log.cost !== undefined && log.cost !== null ? String(log.cost) : '',
                performedBy: log.performedBy || '',
            });
        } else {
            setEditingLog(null);
            setFormData({
                vehicleId: vehicles.length > 0 ? vehicles[0].id : '',
                status: DEFAULT_STATUS,
                scheduledAt: '',
                description: '',
                cost: '',
                performedBy: '',
                startedAt: '',
                completedAt: '',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingLog(null);
    };

    const extractErrors = (err: any): string[] => {
        const d = err?.response?.data;
        if (!d) return [err?.message || 'Lỗi không xác định'];
        const errs: string[] = [];
        if (d.errors && typeof d.errors === 'object') Object.entries(d.errors).forEach(([f, m]) => errs.push(`${f}: ${m}`));
        if (d.message) errs.push(d.message);
        return errs.length > 0 ? errs : ['Có lỗi xảy ra'];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors([]);
        try {
            if (editingLog) {
                const updatePayload: UpdateMaintenanceRequest = {
                    status: formData.status,
                    startedAt: toOffsetDateTime(formData.startedAt),
                    completedAt: toOffsetDateTime(formData.completedAt),
                    description: formData.description || undefined,
                    cost: formData.cost ? Number(formData.cost) : undefined,
                    performedBy: formData.performedBy || undefined,
                };
                await vehicleService.updateMaintenanceStatus(editingLog.id, updatePayload);
            } else {
                const scheduledAt = toOffsetDateTime(formData.scheduledAt);
                if (!scheduledAt) {
                    showError('Vui lòng nhập lịch trình hợp lệ');
                    setSubmitting(false);
                    return;
                }
                const createPayload: CreateMaintenanceRequest = {
                    scheduledAt,
                    description: formData.description || undefined,
                    cost: formData.cost ? Number(formData.cost) : undefined,
                    performedBy: formData.performedBy || undefined,
                };
                await vehicleService.createMaintenanceLog(formData.vehicleId, createPayload);
            }
            closeModal();
            success(editingLog ? 'Cập nhật trạng thái thành công' : 'Thêm lịch bảo trì thành công');
            fetchMaintenanceLogs(page);
        } catch (err: any) {
            const errs = extractErrors(err);
            setFormErrors(errs);
            showError(errs[0]);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Xóa lịch bảo trì này?')) return;
        try {
            await vehicleService.deleteMaintenanceLog(id);
            success('Đã xóa lịch bảo trì');
            fetchMaintenanceLogs(page);
        } catch (err: any) {
            showError(extractErrors(err)[0]);
        }
    };

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
