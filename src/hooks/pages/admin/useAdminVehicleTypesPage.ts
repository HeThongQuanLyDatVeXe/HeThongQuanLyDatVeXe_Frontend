import { useState, useEffect } from 'react';
import { vehicleService } from '../../../services/vehicle-service/vehicleService';
import { useToast } from '../../../contexts/ToastContext';
import type { VehicleTypeResponse, CreateVehicleTypeRequest, UpdateVehicleTypeRequest } from '../../../types/vehicle-service/Vehicle';

export type VehicleTypeFormState = {
  code: string;
  name: string;
  totalSeats: number;
  floors: number;
  description: string;
  isActive: boolean;
};

export const AMENITY_OPTIONS = [
  { key: 'wifi', label: 'WiFi', icon: 'wifi' },
  { key: 'usb', label: 'Cổng USB', icon: 'usb' },
  { key: 'ac', label: 'Máy lạnh', icon: 'ac_unit' },
  { key: 'tv', label: 'TV', icon: 'tv' },
  { key: 'water', label: 'Nước uống', icon: 'water_drop' },
  { key: 'blanket', label: 'Chăn mền', icon: 'bed' },
  { key: 'toilet', label: 'Nhà vệ sinh', icon: 'wc' },
  { key: 'charging', label: 'Sạc điện', icon: 'electrical_services' },
];

export const useAdminVehicleTypesPage = () => {
  const { success, error: showError } = useToast();
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<VehicleTypeResponse | null>(null);
  const [formData, setFormData] = useState<VehicleTypeFormState>({
    code: '',
    name: '',
    totalSeats: 1,
    floors: 1,
    description: '',
    isActive: true,
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const fetchVehicleTypes = async () => {
    setLoading(true);
    try {
      const res = await vehicleService.getVehicleTypes();
      const payload = res.data.result || res.data.data;
      const content = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as any)?.content)
          ? (payload as any).content
          : [];
      setVehicleTypes(content);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách loại xe';
      showError(`Lỗi tải dữ liệu: ${msg}`);
      console.error('Failed to fetch vehicle types:', err?.response?.status, err?.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type?: VehicleTypeResponse) => {
    setFormErrors([]);
    if (type) {
      setEditingType(type);
      setFormData({
        code: type.code,
        name: type.name,
        totalSeats: type.totalSeats,
        floors: type.floors,
        description: type.description || '',
        isActive: type.isActive,
      });
      const amenityKeys = type.amenities && typeof type.amenities === 'object'
        ? Object.entries(type.amenities)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
        : [];
      setSelectedAmenities(amenityKeys);
    } else {
      setEditingType(null);
      setFormData({
        code: '',
        name: '',
        totalSeats: 1,
        floors: 1,
        description: '',
        isActive: true,
      });
      setSelectedAmenities([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
    setFormErrors([]);
  };

  const extractErrors = (err: any): string[] => {
    const data = err?.response?.data;
    if (!data) return [err?.message || 'Lỗi không xác định'];

    const errors: string[] = [];

    if (data.errors && typeof data.errors === 'object') {
      Object.entries(data.errors).forEach(([field, msg]) => {
        errors.push(`${field}: ${msg}`);
      });
    }
    if (data.message) errors.push(data.message);
    if (Array.isArray(data.messages)) errors.push(...data.messages);
    return errors.length > 0 ? errors : ['Có lỗi xảy ra, vui lòng thử lại'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSubmitting(true);

    try {
      const amenities = selectedAmenities.length > 0
        ? selectedAmenities.reduce<Record<string, boolean>>((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
        : undefined;

      if (editingType) {
        const updatePayload: UpdateVehicleTypeRequest = {
          name: formData.name,
          totalSeats: formData.totalSeats,
          floors: formData.floors,
          amenities,
          description: formData.description || undefined,
          isActive: formData.isActive,
        };
        await vehicleService.updateVehicleType(editingType.id, updatePayload);
        success('Cập nhật loại xe thành công');
      } else {
        const createPayload: CreateVehicleTypeRequest = {
          code: formData.code,
          name: formData.name,
          totalSeats: formData.totalSeats,
          floors: formData.floors,
          amenities,
          description: formData.description || undefined,
          isActive: formData.isActive,
        };
        await vehicleService.createVehicleType(createPayload);
        success('Thêm loại xe thành công');
      }
      closeModal();
      fetchVehicleTypes();
    } catch (err: any) {
      const errors = extractErrors(err);
      setFormErrors(errors);
      showError(errors[0]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Xác nhận xóa loại xe "${name}"?\nThao tác này sẽ xóa mềm (soft-delete).`)) return;
    try {
      await vehicleService.deleteVehicleType(id);
      success('Đã xóa loại xe');
      fetchVehicleTypes();
    } catch (err: any) {
      const errors = extractErrors(err);
      showError(errors[0]);
    }
  };

  const getAmenityLabels = (amenities: Record<string, unknown> | null): string[] => {
    if (!amenities || typeof amenities !== 'object') return [];
    return Object.entries(amenities)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => {
        const opt = AMENITY_OPTIONS.find(o => o.key === key);
        return opt ? opt.label : key;
      });
  };

  return {
    vehicleTypes,
    loading,
    submitting,
    isModalOpen,
    editingType,
    formData,
    setFormData,
    selectedAmenities,
    setSelectedAmenities,
    formErrors,
    openModal,
    closeModal,
    handleSubmit,
    handleDelete,
    getAmenityLabels
  };
};
