import { useState, useEffect } from 'react';
import { publicTripService } from '../../../services/trip-service/publicTripService';
import { adminTripService } from '../../../services/trip-service/adminTripService';
import { adminDriverService } from '../../../services/driver-service/adminDriverService';
import { useToast } from '../../../contexts/ToastContext';
import type { TripResponse, TripCrewResponse, TripStatus, SeatMapResponse } from '../../../types/trip-service/Trip';
import type { DriverResponse } from '../../../types/driver-service/Driver';

export const STATUS_MAP: Record<TripStatus, { label: string; color: string }> = {
    SCHEDULED: { label: 'Sắp chạy', color: 'bg-blue-100 text-blue-700' },
    BOARDING: { label: 'Đang đón khách', color: 'bg-indigo-100 text-indigo-700' },
    ON_ROUTE: { label: 'Đang chạy', color: 'bg-purple-100 text-purple-700' },
    ARRIVED: { label: 'Đã đến', color: 'bg-teal-100 text-teal-700' },
    COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
    DELAYED: { label: 'Bị trễ', color: 'bg-orange-100 text-orange-700' },
};

export const useAdminTripDetailPage = (id?: string) => {
    const { success, error: showError } = useToast();
    
    const [trip, setTrip] = useState<TripResponse | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'crew' | 'bookings' | 'seats'>('info');
    
    // Data states
    const [crew, setCrew] = useState<TripCrewResponse[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<DriverResponse[]>([]);
    const [seatMap, setSeatMap] = useState<SeatMapResponse | null>(null);
    
    const [loading, setLoading] = useState(true);
    const [crewLoading, setCrewLoading] = useState(false);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<string[]>([]);
    
    // Status change
    const [newStatus, setNewStatus] = useState<TripStatus | ''>('');

    // Assign Modal
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignRole, setAssignRole] = useState<'DRIVER' | 'ASSISTANT'>('DRIVER');
    const [selectedDriverId, setSelectedDriverId] = useState('');

    useEffect(() => {
        if (id) {
            fetchTrip();
            fetchCrew();
            fetchBookings();
            fetchDrivers();
        }
    }, [id]);

    const fetchTrip = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await adminTripService.getTripById(id);
            const payload = res.data.result || res.data.data;
            setTrip(payload || null);
            
            // Try fetching seat map in background
            try {
                const mapRes = await publicTripService.getSeatMap(id);
                setSeatMap(mapRes.data.result || mapRes.data.data || null);
            } catch (err) { /* ignore seat map error */ }
            
        } catch (err) {
            showError('Không thể tải thông tin chuyến đi');
        } finally {
            setLoading(false);
        }
    };

    const fetchCrew = async () => {
        if (!id) return;
        setCrewLoading(true);
        try {
            const res = await adminTripService.getTripCrew(id);
            const payload = res.data.result || res.data.data;
            setCrew(Array.isArray(payload) ? payload : []);
        } catch (err) {
            console.error('Failed to fetch crew');
        } finally {
            setCrewLoading(false);
        }
    };

    const fetchBookings = async () => {
        if (!id) return;
        setBookingsLoading(true);
        try {
            const res = await adminTripService.getTripBookings(id);
            const payload = res.data.result || res.data.data;
            setBookings(Array.isArray(payload) ? payload : []);
        } catch (err) {
            console.error('Failed to fetch bookings');
        } finally {
            setBookingsLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            const res = await adminDriverService.getAllDrivers({ size: 100, status: 'ACTIVE' });
            const payload = res.data.result || res.data.data;
            if (payload && payload.content) {
                setDrivers(payload.content || []);
            }
        } catch (err) {
            console.error('Failed to fetch drivers for dropdown');
        }
    };

    const extractErrors = (err: any): string[] => {
        const d = err?.response?.data;
        if (!d) return [err?.message || 'Lỗi không xác định'];
        const errs: string[] = [];
        if (d.errors && typeof d.errors === 'object') Object.entries(d.errors).forEach(([f, m]) => errs.push(`${f}: ${m}`));
        if (d.message) errs.push(d.message);
        return errs.length > 0 ? errs : ['Có lỗi xảy ra'];
    };

    const handleAssignCrew = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSubmitting(true);
        setFormErrors([]);
        try {
            if (assignRole === 'DRIVER') {
                await adminTripService.assignDriver(id, { driverId: selectedDriverId });
            } else {
                await adminTripService.assignStaff(id, { driverId: selectedDriverId });
            }
            success('Gán nhân sự thành công');
            setIsAssignModalOpen(false);
            fetchCrew();
        } catch (err: any) {
            const errs = extractErrors(err);
            setFormErrors(errs);
            showError(errs[0]);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelTrip = async () => {
        if (!id) return;
        const reason = prompt('Nhập lý do hủy chuyến:');
        if (reason === null) return;
        if (!reason.trim()) {
            showError('Lý do hủy không được để trống');
            return;
        }
        try {
            await adminTripService.cancelTrip(id, { reason: reason.trim() });
            success('Hủy chuyến thành công');
            fetchTrip();
        } catch (err: any) {
            showError(extractErrors(err)[0]);
        }
    };

    const handleStatusChange = async () => {
        if (!newStatus || !id) return;
        setSubmitting(true);
        try {
            await adminTripService.updateTripStatus(id, { status: newStatus });
            success(`Cập nhật trạng thái thành "${STATUS_MAP[newStatus]?.label || newStatus}"`);
            setNewStatus('');
            fetchTrip();
        } catch (err: any) {
            showError(extractErrors(err)[0]);
        } finally {
            setSubmitting(false);
        }
    };

    return {
        trip,
        activeTab,
        setActiveTab,
        crew,
        bookings,
        drivers,
        seatMap,
        loading,
        crewLoading,
        bookingsLoading,
        submitting,
        formErrors,
        newStatus,
        setNewStatus,
        isAssignModalOpen,
        setIsAssignModalOpen,
        assignRole,
        setAssignRole,
        selectedDriverId,
        setSelectedDriverId,
        setFormErrors,
        handleAssignCrew,
        handleCancelTrip,
        handleStatusChange
    };
};
