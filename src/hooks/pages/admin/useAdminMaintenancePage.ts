import { useState, useEffect } from 'react';
import { vehicleService } from '../../../services/vehicle-service/vehicleService';
import { useToast } from '../../../contexts/ToastContext';
import type { MaintenanceLogResponse, CreateMaintenanceRequest, UpdateMaintenanceRequest, VehicleResponse, MaintenanceStatus } from '../../../types/vehicle-service/Vehicle';

export type MaintenanceFormState = {
  vehicleId: string;
  scheduledAt: string;
  description: string;
  cost: string;
  performedBy: string;
  status: MaintenanceStatus;
  startedAt: string;
  completedAt: string;
};

export const DEFAULT_STATUS: MaintenanceStatus = 'SCHEDULED';

export const STATUS_MAP: Record<MaintenanceStatus, { label: string, color: string }> = {
  'SCHEDULED': { label: 'Đã lên lịch', color: 'bg-orange-100 text-orange-700' },
  'IN_PROGRESS': { label: 'Đang bảo trì', color: 'bg-blue-100 text-blue-700' },
  'COMPLETED': { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  'CANCELLED': { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
};

export const useAdminMaintenancePage = () => {
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

  return {
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
  };
};
