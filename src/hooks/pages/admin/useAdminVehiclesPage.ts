import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../../../services/vehicle-service/vehicleService';
import { useToast } from '../../../contexts/ToastContext';
import type { VehicleResponse, VehicleTypeResponse, CreateVehicleRequest, UpdateVehicleRequest, VehicleStatus } from '../../../types/vehicle-service/Vehicle';

export const STATUS_MAP: Record<VehicleStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Hoạt động', color: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Ngừng hoạt động', color: 'bg-slate-100 text-slate-700' },
  MAINTENANCE: { label: 'Bảo trì', color: 'bg-orange-100 text-orange-700' },
  RETIRED: { label: 'Đã thanh lý', color: 'bg-red-100 text-red-700' },
};

export type VehicleFormState = {
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

export const EMPTY_FORM: VehicleFormState = {
  vehicleTypeId: '', licensePlate: '', brand: '', model: '',
  manufactureYear: '', color: '', chassisNumber: '', engineNumber: '',
  registrationExpiry: '', insuranceExpiry: '', status: 'ACTIVE', notes: '',
};

export const useAdminVehiclesPage = () => {
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

  return {
    navigate,
    vehicles,
    vehicleTypes,
    loading,
    submitting,
    page,
    setPage,
    totalPages,
    isModalOpen,
    setIsModalOpen,
    editingVehicle,
    setEditingVehicle,
    formData,
    setFormData,
    formErrors,
    openModal,
    handleSubmit,
    handleDelete,
    handleStatusChange,
    getTypeName
  };
};
