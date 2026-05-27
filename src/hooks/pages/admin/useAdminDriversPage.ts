import { useState, useEffect } from 'react';
import { adminDriverService } from '../../../services/driver-service/adminDriverService';
import { useToast } from '../../../contexts/ToastContext';
import type { DriverResponse, CreateDriverRequest, UpdateDriverRequest, DriverStatus, LicenseClass } from '../../../types/driver-service/Driver';

export const STATUS_MAP: Record<DriverStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Hoạt động', color: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Ngừng', color: 'bg-slate-100 text-slate-700' },
  ON_TRIP: { label: 'Đang chạy', color: 'bg-blue-100 text-blue-700' },
  SUSPENDED: { label: 'Đình chỉ', color: 'bg-red-100 text-red-700' },
  ON_LEAVE: { label: 'Nghỉ phép', color: 'bg-amber-100 text-amber-700' },
};

export const LICENSE_LABELS: Record<LicenseClass, string> = {
  B1: 'B1 (≤9 chỗ)', B2: 'B2 (≤9 chỗ)', C: 'C (Tải)', D: 'D (≤30 chỗ)', E: 'E (>30 chỗ)', F: 'F (Đặc biệt)',
};

export type FormState = {
  fullName: string; phoneNumber: string; email: string; dateOfBirth: string;
  idCardNumber: string; licenseNumber: string; licenseClass: LicenseClass;
  licenseExpiry: string; experienceYears: string; address: string; notes: string;
};

export const EMPTY_FORM: FormState = {
  fullName: '', phoneNumber: '', email: '', dateOfBirth: '', idCardNumber: '',
  licenseNumber: '', licenseClass: 'D', licenseExpiry: '', experienceYears: '', address: '', notes: '',
};

export const useAdminDriversPage = () => {
  const { success, error: showError } = useToast();
  const [drivers, setDrivers] = useState<DriverResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverResponse | null>(null);
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => { fetchDrivers(page); }, [page]);

  const fetchDrivers = async (pg: number) => {
    setLoading(true);
    try {
      const res = await adminDriverService.getAllDrivers({ page: pg, size: 10 });
      const p = res.data.result || res.data.data;
      if (p) { setDrivers((p as any).content || []); setTotalPages((p as any).totalPages || 1); }
    } catch (err: any) {
      showError('Lỗi tải danh sách: ' + (err?.response?.data?.message || err?.message || ''));
    } finally { setLoading(false); }
  };

  const extractErrors = (err: any): string[] => {
    const d = err?.response?.data;
    if (!d) return [err?.message || 'Lỗi không xác định'];
    const errs: string[] = [];
    if (d.errors && typeof d.errors === 'object') Object.entries(d.errors).forEach(([f, m]) => errs.push(`${f}: ${m}`));
    if (d.message) errs.push(typeof d.message === 'object' ? JSON.stringify(d.message) : d.message);
    return errs.length > 0 ? errs : ['Có lỗi xảy ra'];
  };

  const openModal = (d?: DriverResponse) => {
    setFormErrors([]);
    if (d) {
      setEditingDriver(d);
      setFormData({
        fullName: d.fullName, phoneNumber: d.phoneNumber, email: d.email || '',
        dateOfBirth: d.dateOfBirth ? d.dateOfBirth.substring(0, 10) : '',
        idCardNumber: d.idCardNumber || '', licenseNumber: d.licenseNumber,
        licenseClass: d.licenseClass || 'D',
        licenseExpiry: d.licenseExpiry ? d.licenseExpiry.substring(0, 10) : '',
        experienceYears: d.experienceYears != null ? String(d.experienceYears) : '',
        address: d.address || '', notes: d.notes || '',
      });
    } else {
      setEditingDriver(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSubmitting(true);
    try {
      if (editingDriver) {
        const payload: UpdateDriverRequest = {
          fullName: formData.fullName || undefined,
          phoneNumber: formData.phoneNumber || undefined,
          email: formData.email || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          idCardNumber: formData.idCardNumber || undefined,
          licenseNumber: formData.licenseNumber || undefined,
          licenseClass: formData.licenseClass || undefined,
          licenseExpiry: formData.licenseExpiry || undefined,
          experienceYears: formData.experienceYears ? Number(formData.experienceYears) : undefined,
          address: formData.address || undefined,
          notes: formData.notes || undefined,
        };
        await adminDriverService.updateDriver(editingDriver.id, payload);
        success('Cập nhật tài xế thành công');
      } else {
        const payload: CreateDriverRequest = {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          idCardNumber: formData.idCardNumber || undefined,
          licenseNumber: formData.licenseNumber,
          licenseClass: formData.licenseClass,
          licenseExpiry: formData.licenseExpiry,
          experienceYears: formData.experienceYears ? Number(formData.experienceYears) : undefined,
          address: formData.address || undefined,
          notes: formData.notes || undefined,
        };
        await adminDriverService.createDriver(payload);
        success('Thêm tài xế thành công');
      }
      setIsModalOpen(false); setEditingDriver(null);
      fetchDrivers(page);
    } catch (err: any) {
      const errs = extractErrors(err);
      setFormErrors(errs);
      showError(errs[0]);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (d: DriverResponse) => {
    if (!window.confirm(`Xóa tài xế "${d.fullName}"?`)) return;
    try { await adminDriverService.deleteDriver(d.id); success('Đã xóa tài xế'); fetchDrivers(page); }
    catch (err: any) { showError(extractErrors(err)[0]); }
  };

  const handleStatusChange = async (d: DriverResponse, s: DriverStatus) => {
    try {
      await adminDriverService.updateDriverStatus(d.id, { status: s });
      success(`${d.fullName} → ${STATUS_MAP[s].label}`);
      fetchDrivers(page);
    } catch (err: any) { showError(extractErrors(err)[0]); }
  };

  const isLicenseExpired = (d: DriverResponse) => d.licenseExpiry && new Date(d.licenseExpiry) < new Date();

  return {
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
  };
};
