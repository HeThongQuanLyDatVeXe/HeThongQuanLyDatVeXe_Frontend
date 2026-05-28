import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { publicTripService } from '../../services/trip-service/publicTripService';
import type { TripResponse, SeatInfo } from '../../types/trip-service/Trip';

export const useSeatSelectionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const passedState = location.state as { passengers?: number; currentTrip?: any } | null;

  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [loadingTrip, setLoadingTrip] = useState(!passedState?.currentTrip);

  useEffect(() => {
    if (passedState?.currentTrip) return;
    if (!id) return;
    const fetchTrip = async () => {
      setLoadingTrip(true);
      try {
        const res = await publicTripService.getTripById(id);
        const payload = res.data.result || res.data.data;
        if (payload) setTrip(payload);
      } catch (err) {
        console.error('Failed to fetch trip', err);
      } finally {
        setLoadingTrip(false);
      }
    };
    fetchTrip();
  }, [id, passedState]);

  useEffect(() => {
    const handleDataChanged = () => {
      if (id) {
        // We can't easily extract fetchTrip since it's defined inside useEffect,
        // so we'll just implement the fetch logic here again or refactor.
        setLoadingTrip(true);
        publicTripService.getTripById(id).then(res => {
            const payload = res.data.result || res.data.data;
            if (payload) setTrip(payload);
        }).catch(err => {
            console.error('Failed to refetch trip', err);
        }).finally(() => {
            setLoadingTrip(false);
        });
      }
    };
    window.addEventListener('public-data-changed', handleDataChanged);
    return () => window.removeEventListener('public-data-changed', handleDataChanged);
  }, [id]);

  const ct = passedState?.currentTrip || (trip ? {
    id: trip.id,
    from: trip.route?.originCityName || '—',
    to: trip.route?.destinationCityName || '—',
    routeName: trip.route?.name || '',
    duration: trip.route?.durationMinutes
      ? `${Math.floor(trip.route.durationMinutes / 60)} giờ ${trip.route.durationMinutes % 60 > 0 ? `${trip.route.durationMinutes % 60} phút` : ''}`
      : '',
    price: trip.prices?.[0]?.finalPrice || trip.prices?.[0]?.basePrice || 0,
    vehicleType: trip.vehicle?.vehicleTypeName || '—',
    vehicleFullName: [trip.vehicle?.brand, trip.vehicle?.model].filter(Boolean).join(' ') || '',
    licensePlate: trip.vehicle?.licensePlate || '—',
    totalSeats: trip.vehicle?.totalSeats || trip.totalSeats || 0,
    availableSeats: trip.availableSeats ?? 0,
    departureDatetime: trip.departureDatetime,
    arrivalDatetime: trip.arrivalDatetime,
    tripCode: trip.tripCode || '',
    seatType: trip.prices?.[0]?.seatType || '',
  } : null);

  const [seatMap, setSeatMap] = useState<SeatInfo[]>([]);
  const [soldSeats, setSoldSeats] = useState<Set<string>>(new Set());
  const [loadingSeats, setLoadingSeats] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchSeatMap = async () => {
      setLoadingSeats(true);
      try {
        const res = await publicTripService.getSeatMap(id);
        const payload = res.data.result || res.data.data;
        if (payload && payload.seats) {
          setSeatMap(payload.seats);
          const sold = new Set<string>();
          payload.seats.forEach((seat: SeatInfo) => {
            if (seat.status !== 'AVAILABLE') {
              sold.add(seat.seatNumber);
            }
          });
          setSoldSeats(sold);
        }
      } catch (error) {
        console.error("Failed to fetch seat map", error);
      } finally {
        setLoadingSeats(false);
      }
    };
    fetchSeatMap();

    const handleDataChanged = () => {
        if (id) fetchSeatMap();
    };
    window.addEventListener('public-data-changed', handleDataChanged);
    return () => window.removeEventListener('public-data-changed', handleDataChanged);
  }, [id]);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSeatClick = (seatCode: string) => {
    if (soldSeats.has(seatCode)) return;
    setSelectedSeats((prev) => {
      if (prev.includes(seatCode)) {
        return prev.filter((s) => s !== seatCode);
      } else {
        return [...prev, seatCode];
      }
    });
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế ngồi để tiếp tục!');
      return;
    }
    const price = ct?.price || 0;
    navigate(`/tuyen-duong/${ct?.id || id}/thanh-toan`, {
      state: {
        selectedSeats,
        currentTrip: ct,
        totalAmount: price * selectedSeats.length
      }
    });
  };

  return {
    id,
    navigate,
    ct,
    loadingTrip,
    seatMap,
    soldSeats,
    loadingSeats,
    selectedSeats,
    activeDeck,
    setActiveDeck,
    handleSeatClick,
    handleContinue
  };
};
