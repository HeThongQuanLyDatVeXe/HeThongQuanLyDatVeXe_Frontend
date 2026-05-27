import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicTripService } from '../../services/trip-service/publicTripService';
import type { TripResponse } from '../../types/trip-service/Trip';


export const useTripDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [passengers, setPassengers] = useState(1);

    const [trip, setTrip] = useState<TripResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const fetchTripDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const res = await publicTripService.getTripById(id);
                const payload = res.data.result || res.data.data;
                if (payload) {
                    setTrip(payload);
                }
            } catch (error) {
                console.error("Failed to fetch trip details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTripDetails();
    }, [id]);

    const formatTime = (isoStr: string | undefined) => {
        if (!isoStr) return '--:--';
        return new Date(isoStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoStr: string | undefined) => {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return `${dayNames[d.getDay()]}, ${d.toLocaleDateString('vi-VN')}`;
    };

    const isNextDay = (dep: string | undefined, arr: string | undefined) => {
        if (!dep || !arr) return false;
        return new Date(arr).getDate() !== new Date(dep).getDate();
    };

    const from = trip?.route?.originCityName || 'Đang tải...';
    const to = trip?.route?.destinationCityName || 'Đang tải...';
    const routeName = trip?.route?.name || `${from} - ${to}`;
    const durationMin = trip?.route?.durationMinutes || 0;
    const durationStr = durationMin > 0
        ? `${Math.floor(durationMin / 60)} giờ ${durationMin % 60 > 0 ? `${durationMin % 60} phút` : ''}`
        : 'Đang cập nhật';
    const distanceKm = trip?.route?.distanceKm || 0;

    const vehicleType = trip?.vehicle?.vehicleTypeName || 'Đang cập nhật';
    const vehicleBrand = trip?.vehicle?.brand || '';
    const vehicleModel = trip?.vehicle?.model || '';
    const vehicleFullName = [vehicleBrand, vehicleModel].filter(Boolean).join(' ') || vehicleType;
    const licensePlate = trip?.vehicle?.licensePlate || 'Đang cập nhật';
    const totalSeats = trip?.vehicle?.totalSeats || trip?.totalSeats || 0;
    const availableSeats = trip?.availableSeats ?? 0;

    const basePrice = trip?.prices?.[0]?.basePrice || 0;
    const finalPrice = trip?.prices?.[0]?.finalPrice || basePrice;
    const seatType = trip?.prices?.[0]?.seatType || '';
    const currency = trip?.prices?.[0]?.currency || 'VND';

    const tripStatus = trip?.status || 'SCHEDULED';
    const tripCode = trip?.tripCode || '';

    const handleSelectSeat = () => {
        if (!trip) return;
        navigate(`/tuyen-duong/${trip.id}/chon-ghe`, {
            state: {
                passengers,
                currentTrip: {
                    id: trip.id,
                    from,
                    to,
                    routeName,
                    duration: durationStr,
                    price: finalPrice,
                    vehicleType,
                    vehicleFullName,
                    licensePlate,
                    totalSeats,
                    availableSeats,
                    departureDatetime: trip.departureDatetime,
                    arrivalDatetime: trip.arrivalDatetime,
                    tripCode,
                    seatType,
                    currency,
                }
            }
        });
    };

    return {
        id,
        navigate,
        passengers,
        setPassengers,
        trip,
        loading,
        from,
        to,
        routeName,
        durationStr,
        distanceKm,
        vehicleType,
        vehicleBrand,
        vehicleFullName,
        licensePlate,
        totalSeats,
        availableSeats,
        basePrice,
        finalPrice,
        seatType,
        currency,
        tripStatus,
        tripCode,
        formatTime,
        formatDate,
        isNextDay,
        handleSelectSeat
    };
};
