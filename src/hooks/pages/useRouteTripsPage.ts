import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { routeService } from '../../services/route-service/routeService';
import { publicTripService } from '../../services/trip-service/publicTripService';
import { priceService } from '../../services/price-service/priceService';
import { useToast } from '../../contexts/ToastContext';
import type { RouteResponse, RouteStopPointResponse } from '../../types/route-service/response';
import type { TripResponse, TripPriceResponse, SeatMapResponse } from '../../types/trip-service/Trip';

export const useRouteTripsPage = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [stopPoints, setStopPoints] = useState<RouteStopPointResponse[]>([]);
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [routePrices, setRoutePrices] = useState<{seatType: string; minPrice: number}[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('departure');

  // Seat selection
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [seatMap, setSeatMap] = useState<SeatMapResponse | null>(null);
  const [seatMapLoading, setSeatMapLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    if (!routeId) return;
    loadData();
  }, [routeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [routeRes, tripsRes, spRes] = await Promise.all([
        routeService.getRouteDetails(routeId!),
        publicTripService.getTripsByRoute(routeId!, 0, 100),
        routeService.getRouteStopPoints(routeId!).catch(() => ({ data: { result: [] } } as any)),
      ]);
      const routeData = routeRes.data.result || routeRes.data.data;
      setRoute(routeData as RouteResponse);

      const spData = spRes.data.result || spRes.data.data;
      setStopPoints(Array.isArray(spData) ? spData : []);

      const tripsPayload = tripsRes.data.result || tripsRes.data.data;
      const tripsList: TripResponse[] = (tripsPayload as any)?.content || (Array.isArray(tripsPayload) ? tripsPayload : []);
      // Only show future, bookable trips
      const now = new Date();
      const bookable = tripsList.filter(t =>
        t.status === 'SCHEDULED' && t.departureDatetime && new Date(t.departureDatetime) > now
      );

      // Fetch route-level pricing from price-service as fallback
      try {
        const priceRes = await priceService.getPricingByRoute(routeId!);
        const pp = priceRes.data.result || priceRes.data.data;
        const tiers = (pp as any)?.priceTiers || [];
        if (tiers.length > 0) {
          setRoutePrices(tiers.map((t: any) => ({
            seatType: t.seatType || 'STANDARD',
            minPrice: t.minPrice || t.basePrice || 0,
          })));

          // Enrich trips that have no prices with route-level pricing
          for (const trip of bookable) {
            if (!trip.prices || trip.prices.length === 0) {
              trip.prices = tiers.map((t: any) => ({
                id: '',
                seatType: t.seatType || 'STANDARD',
                basePrice: t.basePrice || t.minPrice || 0,
                finalPrice: t.minPrice || t.basePrice || 0,
                currency: 'VND',
              } as TripPriceResponse));
            }
          }
        }
      } catch {
        // Price service may not be available
      }

      setTrips(bookable);
    } catch {
      showError('Không thể tải dữ liệu tuyến đường');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic vehicle type options
  const vehicleTypes = useMemo(() =>
    Array.from(new Set(trips.map(t => t.vehicle?.vehicleTypeName).filter(Boolean) as string[])).sort()
  , [trips]);

  // Available dates
  const availableDates = useMemo(() =>
    Array.from(new Set(trips.map(t => t.departureDatetime?.split('T')[0]).filter(Boolean) as string[])).sort()
  , [trips]);

  const getMinPrice = (t: TripResponse) => {
    if (!t.prices?.length) return 0;
    return Math.min(...t.prices.map(p => p.finalPrice || p.basePrice || 0));
  };
  const getMaxPrice = (t: TripResponse) => {
    if (!t.prices?.length) return 0;
    return Math.max(...t.prices.map(p => p.finalPrice || p.basePrice || 0));
  };

  const filtered = useMemo(() => {
    return trips
      .filter(t => {
        if (dateFilter && !t.departureDatetime?.startsWith(dateFilter)) return false;
        if (vehicleTypeFilter && t.vehicle?.vehicleTypeName !== vehicleTypeFilter) return false;
        if (onlyAvailable && (t.availableSeats ?? t.totalSeats ?? 0) <= 0) return false;
        if (timeFilter && t.departureDatetime) {
          const h = new Date(t.departureDatetime).getHours();
          if (timeFilter === 'morning' && (h < 0 || h >= 12)) return false;
          if (timeFilter === 'afternoon' && (h < 12 || h >= 18)) return false;
          if (timeFilter === 'evening' && h < 18) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price') return getMinPrice(a) - getMinPrice(b);
        if (sortBy === 'seats') return (b.availableSeats ?? 0) - (a.availableSeats ?? 0);
        return new Date(a.departureDatetime).getTime() - new Date(b.departureDatetime).getTime();
      });
  }, [trips, dateFilter, vehicleTypeFilter, onlyAvailable, timeFilter, sortBy]);


  const handleSelectTrip = async (tripId: string) => {
    if (selectedTripId === tripId) {
      setSelectedTripId(null);
      setSeatMap(null);
      setSelectedSeats([]);
      return;
    }
    setSelectedTripId(tripId);
    setSelectedSeats([]);
    setSeatMapLoading(true);
    try {
      const res = await publicTripService.getSeatMap(tripId);
      setSeatMap(res.data.result || res.data.data as SeatMapResponse);
    } catch {
      setSeatMap(null);
      showError('Không thể tải sơ đồ ghế');
    } finally {
      setSeatMapLoading(false);
    }
  };

  const toggleSeat = (seatNumber: string) => {
    setSelectedSeats(prev =>
      prev.includes(seatNumber) ? prev.filter(s => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  const selectedTrip = trips.find(t => t.id === selectedTripId);
  const calculateTotal = () => {
    if (!selectedTrip?.prices?.length || selectedSeats.length === 0) return 0;
    let total = 0;
    for (const seatNum of selectedSeats) {
      const seatInfo = seatMap?.seats?.find(s => s.seatNumber === seatNum);
      const seatType = seatInfo?.seatType || 'REGULAR';
      const priceEntry = selectedTrip.prices.find(p => p.seatType === seatType)
        || selectedTrip.prices[0];
      total += priceEntry?.finalPrice || priceEntry?.basePrice || 0;
    }
    return total;
  };

  return {
    route,
    stopPoints,
    loading,
    routePrices,
    dateFilter, setDateFilter,
    timeFilter, setTimeFilter,
    vehicleTypeFilter, setVehicleTypeFilter,
    onlyAvailable, setOnlyAvailable,
    sortBy, setSortBy,
    selectedTripId,
    seatMap,
    seatMapLoading,
    selectedSeats,
    vehicleTypes,
    availableDates,
    filtered,
    getMinPrice,
    getMaxPrice,
    handleSelectTrip,
    toggleSeat,
    selectedTrip,
    calculateTotal,
    navigate
  };
};
