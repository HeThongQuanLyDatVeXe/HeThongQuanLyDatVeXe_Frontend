import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { vehicleService } from '../../../services/vehicle-service/vehicleService';
import { publicTripService } from '../../../services/trip-service/publicTripService';
import { useToast } from '../../../contexts/ToastContext';
import type { TripSeatOverrideResponse, CreateTripSeatOverrideRequest } from '../../../types/vehicle-service/Vehicle';

export const useAdminTripSeatOverridesPage = () => {
  const { id } = useParams<{ id: string }>();
  const { success, error: showError } = useToast();
  const [overrides, setOverrides] = useState<TripSeatOverrideResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allSeats, setAllSeats] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    seatNumber: '',
    isBlocked: true,
    reason: '',
  });

  useEffect(() => {
    if (id) {
      fetchOverrides();
      fetchSeatMap();
    }
  }, [id]);

  const fetchSeatMap = async () => {
    try {
      const res = await publicTripService.getSeatMap(id!);
      const payload = res.data.result || res.data.data;
      if (payload && Array.isArray(payload.seats)) {
        setAllSeats(payload.seats.map((seat: any) => seat.seatNumber));
      }
    } catch (err) {
      console.error('Failed to fetch seat map');
    }
  };

  const fetchOverrides = async () => {
    setLoading(true);
    try {
      const res = await vehicleService.getTripSeatOverrides(id!);
      const payload = res.data.result || res.data.data;
      setOverrides(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Failed to fetch overrides');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setFormErrors([]);
    setFormData({
      seatNumber: allSeats.length > 0 ? allSeats[0] : '',
      isBlocked: true,
      reason: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
      if (!formData.seatNumber) {
        showError("Vui lòng chọn hoặc nhập ghế!");
        setSubmitting(false);
        return;
      }
      const requestPayload: CreateTripSeatOverrideRequest = {
        overrides: [
          {
            seatNumber: formData.seatNumber,
            isBlocked: Boolean(formData.isBlocked),
            reason: formData.reason || ""
          }
        ]
      };
      await vehicleService.createTripSeatOverride(id!, requestPayload);
      success('Cập nhật override thành công');
      closeModal();
      fetchOverrides();
    } catch (err: any) {
      const errs = extractErrors(err);
      setFormErrors(errs);
      showError(errs[0]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (overrideId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa override này không?")) return;
    try {
      await vehicleService.deleteTripSeatOverride(overrideId);
      success('Đã xóa override thành công');
      fetchOverrides();
    } catch (err: any) {
      showError('Không thể xóa override');
    }
  };

  return {
    id,
    overrides,
    loading,
    submitting,
    allSeats,
    formErrors,
    isModalOpen,
    formData,
    setFormData,
    openModal,
    closeModal,
    handleSubmit,
    handleDelete
  };
};
