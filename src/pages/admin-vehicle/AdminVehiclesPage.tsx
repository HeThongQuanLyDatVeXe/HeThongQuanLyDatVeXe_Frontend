import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../../services/vehicle-service/vehicleService';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useToast } from '../../contexts/ToastContext';
import type { VehicleResponse, VehicleTypeResponse, CreateVehicleRequest, UpdateVehicleRequest, VehicleStatus } from '../../types/vehicle-service/Vehicle';

const STATUS_MAP: Record<VehicleStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Hoạt động', color: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Ngừng hoạt động', color: 'bg-slate-100 text-slate-700' },
  MAINTENANCE: { label: 'Bảo trì', color: 'bg-orange-100 text-orange-700' },
  RETIRED: { label: 'Đã thanh lý', color: 'bg-red-100 text-red-700' },
};

type VehicleFormState = {
  vehicleTypeId: string;
  licensePlate: string;
  brand: string;
  model: string;
  manufactureYear: string;
  color: string;
  chassisNumber: string;
  engineNumber: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  status: VehicleStatus;
  notes: string;
};

const EMPTY_FORM: VehicleFormState = {
  vehicleTypeId: '', licensePlate: '', brand: '', model: '',
  manufactureYear: '', color: '', chassisNumber: '', engineNumber: '',
  registrationExpiry: '', insuranceExpiry: '', status: 'ACTIVE', notes: '',
};

export const AdminVehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleResponse | null>(null);
  const [formData, setFormData] = useState<VehicleFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => { fetchVehicleTypes(); }, []);
  useEffect(() => { fetchVehicles(page); }, [page]);

  const fetchVehicleTypes = async () => {
    try {
      const res = await vehicleService.getVehicleTypes();
      const p = res.data.result || res.data.data;
      setVehicleTypes(Array.isArray(p) ? p : (p as any)?.content || []);
    } catch { /* silent */ }
  };

  const fetchVehicles = async (pg: number) => {
    setLoading(true);
    try {
      const res = await vehicleService.getAllVehicles({ page: pg, size: 10 });
      const p = res.data.result || res.data.data;
      if (p) { setVehicles((p as any).content || []); setTotalPages((p as any).totalPages || 1); }
    } catch (err: any) {
      showError('Lỗi tải danh sách xe: ' + (err?.response?.data?.message || err?.message || ''));
    } finally { setLoading(false); }
  };

  const extractErrors = (err: any): string[] => {
    const d = err?.response?.data;
    if (!d) return [err?.message || 'Lỗi không xác định'];
    const errs: string[] = [];
    if (d.errors && typeof d.errors === 'object') Object.entries(d.errors).forEach(([f, m]) => errs.push(`${f}: ${m}`));
    if (d.message) errs.push(d.message);
    return errs.length > 0 ? errs : ['Có lỗi xảy ra'];
  };

  const openModal = (v?: VehicleResponse) => {
    setFormErrors([]);
    if (v) {
      setEditingVehicle(v);
      setFormData({
        vehicleTypeId: v.vehicleTypeId, licensePlate: v.licensePlate,
        brand: v.brand || '', model: v.model || '',
        manufactureYear: v.manufactureYear ? String(v.manufactureYear) : '',
        color: v.color || '', chassisNumber: v.chassisNumber || '', engineNumber: v.engineNumber || '',
        registrationExpiry: v.registrationExpiry ? v.registrationExpiry.split('T')[0] : '',
        insuranceExpiry: v.insuranceExpiry ? v.insuranceExpiry.split('T')[0] : '',
        status: v.status || 'ACTIVE', notes: v.notes || '',
      });
    } else {
      setEditingVehicle(null);
      setFormData({ ...EMPTY_FORM, vehicleTypeId: vehicleTypes[0]?.id || '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSubmitting(true);
    try {
      if (editingVehicle) {
        const payload: UpdateVehicleRequest = {
          vehicleTypeId: formData.vehicleTypeId || undefined,
          licensePlate: formData.licensePlate || undefined,
          brand: formData.brand || undefined, model: formData.model || undefined,
          manufactureYear: formData.manufactureYear ? Number(formData.manufactureYear) : undefined,
          color: formData.color || undefined,
          chassisNumber: formData.chassisNumber || undefined, engineNumber: formData.engineNumber || undefined,
          registrationExpiry: formData.registrationExpiry || null,
          insuranceExpiry: formData.insuranceExpiry || null,
          notes: formData.notes || undefined,
        };
        await vehicleService.updateVehicle(editingVehicle.id, payload);
        success('Cập nhật xe thành công');
      } else {
        const payload: CreateVehicleRequest = {
          vehicleTypeId: formData.vehicleTypeId,
          licensePlate: formData.licensePlate,
          brand: formData.brand || undefined, model: formData.model || undefined,
          manufactureYear: formData.manufactureYear ? Number(formData.manufactureYear) : undefined,
          color: formData.color || undefined,
          chassisNumber: formData.chassisNumber || undefined, engineNumber: formData.engineNumber || undefined,
          registrationExpiry: formData.registrationExpiry || null,
          insuranceExpiry: formData.insuranceExpiry || null,
          status: formData.status, notes: formData.notes || undefined,
        };
        await vehicleService.createVehicle(payload);
        success('Thêm xe thành công');
      }
      setIsModalOpen(false); setEditingVehicle(null);
      fetchVehicles(page);
    } catch (err: any) {
      const errs = extractErrors(err);
      setFormErrors(errs);
      showError(errs[0]);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (v: VehicleResponse) => {
    if (!window.confirm(`Xóa xe "${v.licensePlate}"?`)) return;
    try { await vehicleService.deleteVehicle(v.id); success('Đã xóa xe'); fetchVehicles(page); }
    catch (err: any) { showError(extractErrors(err)[0]); }
  };

  const handleStatusChange = async (v: VehicleResponse, newStatus: VehicleStatus) => {
    try {
      await vehicleService.updateVehicleStatus(v.id, { status: newStatus });
      success(`Đã chuyển trạng thái → ${STATUS_MAP[newStatus].label}`);
      fetchVehicles(page);
    } catch (err: any) { showError(extractErrors(err)[0]); }
  };

  const getTypeName = (id: string) => vehicleTypes.find(t => t.id === id)?.name || '—';

  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Xe</h1>
            <p className="text-sm text-slate-500 mt-1">Quản lý phương tiện: biển số, loại xe, trạng thái, bảo trì</p>
          </div>
          <button onClick={() => openModal()} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
            <span className="material-symbols-outlined">add</span> Thêm xe
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">Biển số</th>
                <th className="px-4 py-3 font-semibold">Loại xe</th>
                <th className="px-4 py-3 font-semibold">Hãng / Model</th>
                <th className="px-4 py-3 font-semibold text-center">Năm SX</th>
                <th className="px-4 py-3 font-semibold">Màu</th>
                <th className="px-4 py-3 font-semibold text-center">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Đăng kiểm</th>
                <th className="px-4 py-3 font-semibold w-32 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  <span className="material-symbols-outlined animate-spin align-middle mr-1">progress_activity</span>Đang tải...
                </td></tr>
              ) : vehicles.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Chưa có xe nào.</td></tr>
              ) : vehicles.map(v => {
                const st = STATUS_MAP[v.status] || STATUS_MAP.ACTIVE;
                const regExp = v.registrationExpiry ? new Date(v.registrationExpiry) : null;
                const isExpired = regExp && regExp < new Date();
                return (
                <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-sm">{v.licensePlate}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{v.vehicleTypeName || getTypeName(v.vehicleTypeId)}</td>
                  <td className="px-4 py-3 text-sm">{[v.brand, v.model].filter(Boolean).join(' ') || '—'}</td>
                  <td className="px-4 py-3 text-sm text-center">{v.manufactureYear || '—'}</td>
                  <td className="px-4 py-3 text-sm">{v.color || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <select value={v.status} onChange={e => handleStatusChange(v, e.target.value as VehicleStatus)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${st.color}`}>
                      {Object.entries(STATUS_MAP).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {regExp ? (
                      <span className={isExpired ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                        {regExp.toLocaleDateString('vi-VN')} {isExpired && '⚠️'}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => navigate(`/admin/vehicles/${v.id}/seat-layout`)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="Sơ đồ ghế">
                        <span className="material-symbols-outlined text-sm">airline_seat_recline_normal</span>
                      </button>
                      <button onClick={() => openModal(v)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Sửa">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => handleDelete(v)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Xóa">
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
              <h2 className="text-2xl font-bold mb-1">{editingVehicle ? 'Sửa thông tin xe' : 'Thêm xe mới'}</h2>
              <p className="text-sm text-slate-500 mb-4">{editingVehicle ? `Biển số: ${editingVehicle.licensePlate}` : 'Điền thông tin xe. (*) là bắt buộc.'}</p>

              {formErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                  {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại xe <span className="text-red-500">*</span></label>
                    <select required value={formData.vehicleTypeId} onChange={e => setFormData({...formData, vehicleTypeId: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <option value="" disabled>-- Chọn loại xe --</option>
                      {vehicleTypes.map(vt => <option key={vt.id} value={vt.id}>{vt.name} ({vt.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Biển số <span className="text-red-500">*</span></label>
                    <input required type="text" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="51B-123.45" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Hãng xe</label>
                    <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Toyota" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Model</label>
                    <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Hiace" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Năm sản xuất</label>
                    <input type="number" min={1990} max={2030} value={formData.manufactureYear} onChange={e => setFormData({...formData, manufactureYear: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="2024" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Màu sắc</label>
                    <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Trắng" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số khung</label>
                    <input type="text" value={formData.chassisNumber} onChange={e => setFormData({...formData, chassisNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số máy</label>
                    <input type="text" value={formData.engineNumber} onChange={e => setFormData({...formData, engineNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Đăng kiểm hết hạn</label>
                    <input type="date" value={formData.registrationExpiry} onChange={e => setFormData({...formData, registrationExpiry: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                    <p className="text-xs text-slate-400 mt-1">Backend: LocalDate (YYYY-MM-DD)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bảo hiểm hết hạn</label>
                    <input type="date" value={formData.insuranceExpiry} onChange={e => setFormData({...formData, insuranceExpiry: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                </div>

                {!editingVehicle && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Trạng thái <span className="text-red-500">*</span></label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as VehicleStatus})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Ghi chú</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" rows={2} placeholder="Ghi chú thêm..." />
                </div>

                <div className="flex gap-3 justify-end mt-6 border-t pt-4">
                  <button type="button" onClick={() => { setIsModalOpen(false); setEditingVehicle(null); }} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium disabled:opacity-50">Hủy</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] disabled:opacity-50 flex items-center gap-2">
                    {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                    {submitting ? 'Đang xử lý...' : editingVehicle ? 'Cập nhật' : 'Thêm mới'}
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
