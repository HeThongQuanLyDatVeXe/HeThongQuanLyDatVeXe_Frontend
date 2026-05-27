import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { adminDriverService } from '../../../services/driver-service/adminDriverService';
import { useToast } from '../../../contexts/ToastContext';
import type { DriverResponse, DriverAvailabilityResponse, AvailabilityEntry, AvailabilityType } from '../../../types/driver-service/Driver';

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Hoạt động', color: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Ngừng', color: 'bg-slate-100 text-slate-700' },
  ON_TRIP: { label: 'Đang chạy', color: 'bg-blue-100 text-blue-700' },
  SUSPENDED: { label: 'Đình chỉ', color: 'bg-red-100 text-red-700' },
  ON_LEAVE: { label: 'Nghỉ phép', color: 'bg-amber-100 text-amber-700' },
};

export const AVAIL_MAP: Record<AvailabilityType, { label: string; color: string; icon: string }> = {
  AVAILABLE: { label: 'Sẵn sàng', color: 'bg-green-100 text-green-700', icon: '✅' },
  DAY_OFF: { label: 'Nghỉ phép', color: 'bg-blue-100 text-blue-700', icon: '🏖️' },
  SICK_LEAVE: { label: 'Nghỉ ốm', color: 'bg-orange-100 text-orange-700', icon: '🤒' },
  TRAINING: { label: 'Đào tạo', color: 'bg-purple-100 text-purple-700', icon: '📚' },
  BLOCKED: { label: 'Bận', color: 'bg-red-100 text-red-700', icon: '🚫' },
};

// Backend DTOs (match exactly)
export interface TripScheduleItem {
  tripId: string; tripCode: string; routeName: string;
  origin: string; destination: string;
  departureDatetime: string; arrivalDatetime: string;
  status: string; role: string;
}
export interface ScheduleWrapper { driverId: string; driverName: string; schedule: TripScheduleItem[]; }

export interface ReviewItem {
  reviewId: string; userId: string; userName: string;
  bookingId: string; tripId: string;
  overallRating: number; driverRating: number; punctualityRating: number;
  comment: string; status: string; createdAt: string;
}
export interface ReviewWrapper { driverId: string; driverName: string; averageRating: number; totalReviews: number; reviews: ReviewItem[]; }

export const useAdminDriverDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { success, error: showError } = useToast();

  const [driver, setDriver] = useState<DriverResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'schedule' | 'availability' | 'reviews'>('info');
  const [loading, setLoading] = useState(true);

  const [scheduleData, setScheduleData] = useState<TripScheduleItem[]>([]);
  const [availabilities, setAvailabilities] = useState<DriverAvailabilityResponse[]>([]);
  const [reviewData, setReviewData] = useState<ReviewWrapper | null>(null);

  // Availability modal
  const [isAvailModal, setIsAvailModal] = useState(false);
  const [availForm, setAvailForm] = useState<AvailabilityEntry>({ date: '', type: 'AVAILABLE', note: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (id) fetchAll(); }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const dRes = await adminDriverService.getDriverById(id!);
      setDriver((dRes.data.result || dRes.data.data) as DriverResponse);
    } catch { showError('Không thể tải thông tin tài xế'); }

    // Fetch sub-data independently (don't block if one fails)
    try {
      const sRes = await adminDriverService.getDriverSchedule(id!);
      const sPayload = sRes.data.result || sRes.data.data;
      // Backend returns DriverScheduleResponse wrapper
      if (sPayload && (sPayload as any).schedule) {
        setScheduleData((sPayload as unknown as ScheduleWrapper).schedule || []);
      } else if (Array.isArray(sPayload)) {
        setScheduleData(sPayload as any);
      }
    } catch { /* schedule may not exist yet */ }

    try {
      const aRes = await adminDriverService.getDriverAvailability(id!);
      const aPayload = aRes.data.result || aRes.data.data;
      setAvailabilities(Array.isArray(aPayload) ? aPayload : []);
    } catch { /* silent */ }

    try {
      const rRes = await adminDriverService.getDriverReviews(id!, { page: 0, size: 50 });
      const rPayload = rRes.data.result || rRes.data.data;
      // Backend returns DriverReviewSummaryResponse wrapper
      if (rPayload && (rPayload as any).reviews) {
        setReviewData(rPayload as unknown as ReviewWrapper);
      }
    } catch { /* silent */ }

    setLoading(false);
  };

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminDriverService.updateDriverAvailability(id!, { entries: [availForm] });
      success('Cập nhật lịch thành công');
      setIsAvailModal(false);
      setAvailForm({ date: '', type: 'AVAILABLE', note: '' });
      // Reload
      const aRes = await adminDriverService.getDriverAvailability(id!);
      setAvailabilities(Array.isArray(aRes.data.result || aRes.data.data) ? (aRes.data.result || aRes.data.data) as any : []);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Lỗi cập nhật');
    } finally { setSubmitting(false); }
  };

  return {
    id,
    driver,
    activeTab,
    setActiveTab,
    loading,
    scheduleData,
    availabilities,
    reviewData,
    isAvailModal,
    setIsAvailModal,
    availForm,
    setAvailForm,
    submitting,
    handleAddAvailability
  };
};
