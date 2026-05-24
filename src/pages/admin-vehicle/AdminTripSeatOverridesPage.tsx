import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { vehicleService } from '../../services/vehicle-service/vehicleService';
import { publicTripService } from '../../services/trip-service/publicTripService';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useToast } from '../../contexts/ToastContext';
import type { TripSeatOverrideResponse, CreateTripSeatOverrideRequest } from '../../types/vehicle-service/Vehicle';
import { ROUTES } from '../../constants/routes';

export const AdminTripSeatOverridesPage: React.FC = () => {
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

    return (
        <AdminLayout>
            <div className="space-y-6 text-slate-800">
                <div className="flex items-center gap-4">
                    <Link to={ROUTES.ADMIN_TRIPS} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Override ghế - Chuyến {id}</h1>
                </div>
                <div className="flex justify-end">
                    <button onClick={openModal} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
                        <span className="material-symbols-outlined">add</span>
                        Thêm Override
                    </button>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 font-semibold">Ghế</th>
                                <th className="px-6 py-4 font-semibold">Khóa</th>
                                <th className="px-6 py-4 font-semibold">Lý do</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Đang tải...</td></tr>
                            ) : overrides.length === 0 ? (
                                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu override.</td></tr>
                            ) : overrides.map((override) => (
                                <tr key={override.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{override.seatNumber}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${override.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {override.isBlocked ? 'Khóa' : 'Mở'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{override.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-4">Cấu hình Override Ghế</h2>
                            {formErrors.length > 0 && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                                    {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Số ghế</label>
                                    {allSeats.length > 0 ? (
                                        <select required value={formData.seatNumber} onChange={e => setFormData({...formData, seatNumber: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                            <option value="" disabled>-- Chọn ghế --</option>
                                            {allSeats.map(seat => <option key={seat} value={seat}>{seat}</option>)}
                                        </select>
                                    ) : (
                                        <input required type="text" placeholder="Nhập số ghế (vd: A01)" value={formData.seatNumber} onChange={e => setFormData({...formData, seatNumber: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div>
                                        <p className="font-medium">Khóa ghế</p>
                                        <p className="text-xs text-slate-500">Khách sẽ không thể đặt ghế này</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={formData.isBlocked} onChange={e => setFormData({...formData, isBlocked: e.target.checked})} />
                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Lý do (Tùy chọn)</label>
                                    <input type="text" placeholder="VD: Ghế hỏng, dành cho nội bộ..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                
                                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                                    <button type="button" onClick={closeModal} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50">Hủy</button>
                                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors flex items-center gap-2 disabled:opacity-50">
                                        {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                        Lưu lại
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
