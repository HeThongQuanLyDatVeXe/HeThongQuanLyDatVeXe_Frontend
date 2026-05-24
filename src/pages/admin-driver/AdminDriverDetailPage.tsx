import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminDriverService } from '../../services/driver-service/adminDriverService';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useToast } from '../../contexts/ToastContext';
import type { DriverResponse, DriverAvailabilityResponse, AvailabilityEntry, AvailabilityType } from '../../types/driver-service/Driver';
import { ROUTES } from '../../constants/routes';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Hoạt động', color: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Ngừng', color: 'bg-slate-100 text-slate-700' },
  ON_TRIP: { label: 'Đang chạy', color: 'bg-blue-100 text-blue-700' },
  SUSPENDED: { label: 'Đình chỉ', color: 'bg-red-100 text-red-700' },
  ON_LEAVE: { label: 'Nghỉ phép', color: 'bg-amber-100 text-amber-700' },
};

const AVAIL_MAP: Record<AvailabilityType, { label: string; color: string; icon: string }> = {
  AVAILABLE: { label: 'Sẵn sàng', color: 'bg-green-100 text-green-700', icon: '✅' },
  DAY_OFF: { label: 'Nghỉ phép', color: 'bg-blue-100 text-blue-700', icon: '🏖️' },
  SICK_LEAVE: { label: 'Nghỉ ốm', color: 'bg-orange-100 text-orange-700', icon: '🤒' },
  TRAINING: { label: 'Đào tạo', color: 'bg-purple-100 text-purple-700', icon: '📚' },
  BLOCKED: { label: 'Bận', color: 'bg-red-100 text-red-700', icon: '🚫' },
};

// Backend DTOs (match exactly)
interface TripScheduleItem {
  tripId: string; tripCode: string; routeName: string;
  origin: string; destination: string;
  departureDatetime: string; arrivalDatetime: string;
  status: string; role: string;
}
interface ScheduleWrapper { driverId: string; driverName: string; schedule: TripScheduleItem[]; }

interface ReviewItem {
  reviewId: string; userId: string; userName: string;
  bookingId: string; tripId: string;
  overallRating: number; driverRating: number; punctualityRating: number;
  comment: string; status: string; createdAt: string;
}
interface ReviewWrapper { driverId: string; driverName: string; averageRating: number; totalReviews: number; reviews: ReviewItem[]; }

export const AdminDriverDetailPage: React.FC = () => {
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
        setScheduleData((sPayload as ScheduleWrapper).schedule || []);
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
        setReviewData(rPayload as ReviewWrapper);
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

  if (loading || !driver) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-96 text-slate-500">
        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>Đang tải...
      </div>
    </AdminLayout>
  );

  const st = STATUS_MAP[driver.status] || STATUS_MAP.ACTIVE;
  const isExpired = driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date();

  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-800">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={ROUTES.ADMIN_DRIVERS} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold font-serif text-[#F4600C]">{driver.fullName}</h1>
            <p className="text-sm text-slate-500">Mã NV: {driver.employeeCode || '—'} • {driver.phoneNumber}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${st.color}`}>{st.label}</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {[
            { key: 'info', label: 'Thông tin', icon: 'person' },
            { key: 'schedule', label: 'Lịch trình', icon: 'calendar_month' },
            { key: 'availability', label: 'Lịch rảnh/bận', icon: 'event_available' },
            { key: 'reviews', label: 'Đánh giá', icon: 'star' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${activeTab === tab.key ? 'border-[#F4600C] text-[#F4600C]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[350px]">
          {/* ─── INFO TAB ─── */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <fieldset className="border border-slate-200 rounded-lg p-4 space-y-3">
                <legend className="text-sm font-semibold text-slate-400 px-2">Thông tin cá nhân</legend>
                <InfoRow label="Họ tên" value={driver.fullName} />
                <InfoRow label="SĐT" value={driver.phoneNumber} />
                <InfoRow label="Email" value={driver.email || '—'} />
                <InfoRow label="Ngày sinh" value={driver.dateOfBirth ? new Date(driver.dateOfBirth).toLocaleDateString('vi-VN') : '—'} />
                <InfoRow label="CCCD" value={driver.idCardNumber || '—'} />
                <InfoRow label="Địa chỉ" value={driver.address || '—'} />
              </fieldset>
              <fieldset className="border border-slate-200 rounded-lg p-4 space-y-3">
                <legend className="text-sm font-semibold text-slate-400 px-2">Giấy phép lái xe</legend>
                <InfoRow label="Số GPLX" value={driver.licenseNumber} mono />
                <InfoRow label="Hạng bằng" value={driver.licenseClass} badge />
                <InfoRow label="Hạn GPLX" value={
                  driver.licenseExpiry
                    ? <span className={isExpired ? 'text-red-600 font-semibold' : ''}>{new Date(driver.licenseExpiry).toLocaleDateString('vi-VN')} {isExpired && '⚠️ Đã hết hạn!'}</span>
                    : '—'
                } />
                <InfoRow label="Kinh nghiệm" value={driver.experienceYears != null ? `${driver.experienceYears} năm` : '—'} />
                <InfoRow label="Trạng thái" value={<span className={`px-2 py-1 text-xs font-semibold rounded-full ${st.color}`}>{st.label}</span>} />
              </fieldset>
              {driver.notes && (
                <div className="md:col-span-2 bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1 font-medium">Ghi chú</p>
                  <p className="text-slate-700">{driver.notes}</p>
                </div>
              )}
              <div className="md:col-span-2 text-xs text-slate-400 flex gap-4">
                <span>Tạo lúc: {new Date(driver.createdAt).toLocaleString('vi-VN')}</span>
                <span>Cập nhật: {new Date(driver.updatedAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          )}

          {/* ─── SCHEDULE TAB ─── */}
          {activeTab === 'schedule' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold">Mã chuyến</th>
                    <th className="py-3 px-4 font-semibold">Tuyến</th>
                    <th className="py-3 px-4 font-semibold">Khởi hành</th>
                    <th className="py-3 px-4 font-semibold">Đến (DK)</th>
                    <th className="py-3 px-4 font-semibold text-center">Vai trò</th>
                    <th className="py-3 px-4 font-semibold text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleData.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-slate-500">Không có lịch trình nào.</td></tr>
                  ) : scheduleData.map(s => (
                    <tr key={s.tripId} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-xs">{s.tripCode || s.tripId.substring(0, 8)}</td>
                      <td className="py-3 px-4 text-sm">{s.routeName || `${s.origin || '?'} → ${s.destination || '?'}`}</td>
                      <td className="py-3 px-4 text-sm">{new Date(s.departureDatetime).toLocaleString('vi-VN')}</td>
                      <td className="py-3 px-4 text-sm">{new Date(s.arrivalDatetime).toLocaleString('vi-VN')}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.role === 'driver' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                          {s.role === 'driver' ? 'Tài xế' : s.role === 'assistant' ? 'Phụ xe' : s.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── AVAILABILITY TAB ─── */}
          {activeTab === 'availability' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-500">Quản lý lịch rảnh/bận của tài xế</p>
                <button onClick={() => setIsAvailModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 text-sm">
                  <span className="material-symbols-outlined text-sm">edit_calendar</span> Thêm lịch
                </button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold">Ngày</th>
                    <th className="py-3 px-4 font-semibold">Trạng thái</th>
                    <th className="py-3 px-4 font-semibold">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {availabilities.length === 0 ? (
                    <tr><td colSpan={3} className="py-8 text-center text-slate-500">Chưa có lịch nào.</td></tr>
                  ) : availabilities.map(a => {
                    const av = AVAIL_MAP[a.type] || AVAIL_MAP.AVAILABLE;
                    return (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{typeof a.date === 'string' ? new Date(a.date).toLocaleDateString('vi-VN') : '—'}</td>
                      <td className="py-3 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${av.color}`}>{av.icon} {av.label}</span></td>
                      <td className="py-3 px-4 text-sm text-slate-500">{a.note || '—'}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── REVIEWS TAB ─── */}
          {activeTab === 'reviews' && (
            <div>
              {reviewData && (
                <div className="flex gap-6 mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-600">{reviewData.averageRating?.toFixed(1) || '—'}</p>
                    <div className="flex justify-center mt-1">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`material-symbols-outlined text-sm ${i <= Math.round(reviewData.averageRating || 0) ? 'text-amber-500' : 'text-slate-300'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{reviewData.totalReviews} đánh giá</p>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {(!reviewData?.reviews || reviewData.reviews.length === 0) ? (
                  <p className="text-center py-8 text-slate-500">Chưa có đánh giá nào.</p>
                ) : reviewData.reviews.map(r => (
                  <div key={r.reviewId} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{r.userName || r.userId?.substring(0,8)}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span title="Tổng">⭐ {r.overallRating}</span>
                        <span title="Tài xế">🚗 {r.driverRating}</span>
                        <span title="Đúng giờ">⏰ {r.punctualityRating}</span>
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-slate-700 mb-2">{r.comment}</p>}
                    <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Availability Modal */}
        {isAvailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-4">Thêm lịch rảnh/bận</h2>
              <form onSubmit={handleAddAvailability} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày <span className="text-red-500">*</span></label>
                  <input required type="date" value={availForm.date} onChange={e => setAvailForm({...availForm, date: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Trạng thái</label>
                  <div className="space-y-2">
                    {Object.entries(AVAIL_MAP).map(([key, val]) => (
                      <label key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${availForm.type === key ? `${val.color} border-transparent` : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" name="availType" value={key} checked={availForm.type === key}
                          onChange={() => setAvailForm({...availForm, type: key as AvailabilityType})} className="sr-only" />
                        <span>{val.icon}</span><span className="text-sm font-medium">{val.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ghi chú</label>
                  <input type="text" value={availForm.note || ''} onChange={e => setAvailForm({...availForm, note: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Lý do..." />
                </div>
                <div className="flex gap-3 justify-end border-t pt-4">
                  <button type="button" onClick={() => setIsAvailModal(false)} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium disabled:opacity-50">Hủy</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                    {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                    {submitting ? 'Đang lưu...' : 'Lưu'}
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

// Helper component
const InfoRow: React.FC<{ label: string; value: React.ReactNode; mono?: boolean; badge?: boolean }> = ({ label, value, mono, badge }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm text-slate-500 w-24 shrink-0">{label}</span>
    {badge ? (
      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold">{value}</span>
    ) : (
      <span className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    )}
  </div>
);
