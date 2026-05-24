import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { ROUTES } from '../constants/routes';
import { routeService } from '../services/route-service/routeService';
import { publicTripService } from '../services/trip-service/publicTripService';
import { priceService } from '../services/price-service/priceService';
import { useToast } from '../contexts/ToastContext';
import type { RouteResponse, RouteStopPointResponse } from '../types/route-service/response';
import type { TripResponse, TripPriceResponse, SeatMapResponse } from '../types/trip-service/Trip';

export const RouteTripsPage: React.FC = () => {
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
        routeService.getRouteStopPoints(routeId!).catch(() => ({ data: { result: [] } })),
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

  const getMinPrice = (t: TripResponse) => {
    if (!t.prices?.length) return 0;
    return Math.min(...t.prices.map(p => p.finalPrice || p.basePrice || 0));
  };
  const getMaxPrice = (t: TripResponse) => {
    if (!t.prices?.length) return 0;
    return Math.max(...t.prices.map(p => p.finalPrice || p.basePrice || 0));
  };
  const fmtPrice = (n: number) => n > 0 ? `${n.toLocaleString('vi-VN')}đ` : 'Liên hệ';
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
  const fmtDuration = (m: number) => {
    if (!m) return '—';
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return h > 0 ? `${h}h${mm > 0 ? mm + 'p' : ''}` : `${mm}p`;
  };

  // Seat map
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

  // Calculate total price for selected seats
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

  if (loading) return (
    <div className="min-h-screen bg-background"><Header />
      <div className="flex justify-center items-center pt-40"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
    </div>
  );

  if (!route) return (
    <div className="min-h-screen bg-background"><Header />
      <div className="flex flex-col items-center justify-center pt-40 gap-4">
        <p className="typo-body-lg text-on-surface-variant">Không tìm thấy tuyến đường</p>
        <Link to={ROUTES.ROUTES} className="text-primary underline">Quay lại</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-on-background font-body select-none">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-[#1A1410] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#F4600C22_0%,_transparent_70%)] opacity-60 pointer-events-none" />
          <div className="relative z-10 max-w-container-max mx-auto px-gutter py-10">
            <Link to={ROUTES.ROUTES} className="inline-flex items-center gap-1 text-on-primary/60 hover:text-on-primary typo-label-sm mb-4 transition-colors">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Tất cả tuyến đường
            </Link>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <h1 className="typo-headline-lg text-on-primary mb-2">{route.originCityName} → {route.destinationCityName}</h1>
                <div className="flex items-center gap-4 typo-body-md text-on-primary/70 flex-wrap">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">straighten</span> {route.distanceKm} km</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> ~{fmtDuration(route.durationMinutes)}</span>
                  {route.code && <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded">{route.code}</span>}
                  {routePrices.length > 0 && (
                    <span className="flex items-center gap-1 text-on-primary/90">
                      <span className="material-symbols-outlined text-[16px]">payments</span>
                      Từ {fmtPrice(Math.min(...routePrices.map(p => p.minPrice)))}
                    </span>
                  )}
                </div>
                {/* Stop points in hero */}
                {stopPoints.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 typo-label-sm text-on-primary/60">
                    {(() => {
                      const pickups = stopPoints.filter(s => s.isPickup || s.type === 'PICKUP' || s.type === 'BOTH');
                      const dropoffs = stopPoints.filter(s => s.isDropoff || s.type === 'DROPOFF' || s.type === 'BOTH');
                      return (
                        <>
                          {pickups.length > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-green-400 text-[14px]">location_on</span>
                              <span className="font-semibold text-green-400">Đón:</span> {pickups.map(p => p.stopPointName).join(', ')}
                            </span>
                          )}
                          {dropoffs.length > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-red-400 text-[14px]">flag</span>
                              <span className="font-semibold text-red-400">Trả:</span> {dropoffs.map(p => p.stopPointName).join(', ')}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-container-max mx-auto px-gutter py-lg grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-5">
              <h3 className="typo-headline-md text-on-surface">Lọc chuyến xe</h3>

              <div>
                <span className="typo-label-caps mb-2 block text-outline">Ngày đi</span>
                <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                  className="w-full rounded-xl border border-outline/20 p-2.5 bg-surface-container-lowest typo-body-md text-on-surface">
                  <option value="">Tất cả ngày</option>
                  {availableDates.map(d => <option key={d} value={d}>{new Date(d + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</option>)}
                </select>
              </div>

              <div>
                <span className="typo-label-caps mb-2 block text-outline">Sắp xếp</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="w-full rounded-xl border border-outline/20 p-2.5 bg-surface-container-lowest typo-body-md text-on-surface">
                  <option value="departure">Giờ đi sớm nhất</option>
                  <option value="price">Giá thấp nhất</option>
                  <option value="seats">Còn nhiều ghế nhất</option>
                </select>
              </div>

              <div>
                <span className="typo-label-caps mb-2 block text-outline">Giờ khởi hành</span>
                <div className="flex flex-col gap-2">
                  {[{k:'morning',l:'Sáng',d:'00:00–12:00'},{k:'afternoon',l:'Chiều',d:'12:00–18:00'},{k:'evening',l:'Tối',d:'18:00–24:00'}].map(t => (
                    <label key={t.k} className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="time" checked={timeFilter===t.k} onChange={() => setTimeFilter(t.k)} onClick={() => { if (timeFilter===t.k) setTimeFilter(''); }}
                        className="w-4 h-4 accent-primary cursor-pointer" />
                      <span className="typo-body-md group-hover:text-primary transition-colors">{t.l} <span className="text-outline-variant typo-label-sm">({t.d})</span></span>
                    </label>
                  ))}
                </div>
              </div>

              {vehicleTypes.length > 0 && (
                <div>
                  <span className="typo-label-caps mb-2 block text-outline">Loại xe</span>
                  <div className="flex flex-col gap-2">
                    {vehicleTypes.map(vt => (
                      <label key={vt} className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="vtype" checked={vehicleTypeFilter===vt} onChange={() => setVehicleTypeFilter(vt)} onClick={() => { if (vehicleTypeFilter===vt) setVehicleTypeFilter(''); }}
                          className="w-4 h-4 accent-primary cursor-pointer" />
                        <span className="typo-body-md group-hover:text-primary transition-colors">{vt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer group pt-2">
                <input type="checkbox" checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer rounded" />
                <span className="typo-body-md font-semibold group-hover:text-primary transition-colors">Chỉ chuyến còn ghế</span>
              </label>
            </div>
          </aside>

          {/* Trips List */}
          <div className="lg:col-span-9 space-y-md">
            <p className="typo-body-md text-on-surface-variant italic">
              {filtered.length} chuyến xe {dateFilter ? `ngày ${new Date(dateFilter+'T00:00:00').toLocaleDateString('vi-VN')}` : ''}
            </p>

            {filtered.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-16 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[32px]">directions_bus</span>
                </div>
                <h4 className="typo-headline-md text-primary">Không có chuyến xe nào</h4>
                <p className="typo-body-md text-on-surface-variant">Thử thay đổi ngày hoặc bộ lọc khác.</p>
              </div>
            ) : filtered.map(trip => {
              const minP = getMinPrice(trip);
              const maxP = getMaxPrice(trip);
              const avail = trip.availableSeats ?? trip.totalSeats ?? 0;
              const isSelected = selectedTripId === trip.id;
              const depTime = fmtTime(trip.departureDatetime);
              const arrTime = trip.arrivalDatetime ? fmtTime(trip.arrivalDatetime) : '—';
              const dur = trip.route?.durationMinutes || route.durationMinutes;
              const depDateFull = new Date(trip.departureDatetime).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
              const arrDateFull = trip.arrivalDatetime
                ? new Date(trip.arrivalDatetime).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
                : null;

              return (
                <div key={trip.id} className={`bg-surface-container-lowest rounded-xl border transition-all duration-300 overflow-hidden ${isSelected ? 'border-primary shadow-lg' : 'border-outline-variant hover:border-primary/40 hover:shadow-md'}`}>
                  {/* Departure date banner */}
                  <div className="px-5 pt-4 pb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">calendar_today</span>
                    <span className="typo-body-md font-bold text-primary capitalize">{depDateFull}</span>
                  </div>

                  {/* Trip Card */}
                  <div className="px-5 pb-5 pt-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Time & Route */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col items-center min-w-[70px]">
                          <span className="text-xs font-semibold text-outline uppercase tracking-wider mb-0.5">Khởi hành</span>
                          <span className="typo-headline-md text-primary font-bold">{depTime}</span>
                        </div>
                        <div className="flex flex-col items-center flex-1 px-2">
                          <span className="typo-label-sm text-outline bg-surface-container-low px-2 py-0.5 rounded-full mb-1">~{fmtDuration(dur)}</span>
                          <div className="flex items-center w-full">
                            <div className="w-2 h-2 rounded-full border-2 border-primary bg-white" />
                            <div className="flex-1 h-px border-t-2 border-dashed border-outline-variant/60" />
                            <div className="w-2 h-2 rounded-full border-2 border-primary bg-primary" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center min-w-[70px]">
                          <span className="text-xs font-semibold text-outline uppercase tracking-wider mb-0.5">Dự kiến đến</span>
                          <span className="typo-headline-md text-on-surface font-bold">{arrTime}</span>
                          {arrDateFull && <span className="typo-label-sm text-outline-variant mt-0.5">{arrDateFull}</span>}
                        </div>
                      </div>

                      {/* Info chips */}
                      <div className="flex flex-wrap gap-2 items-center typo-label-sm text-on-surface-variant">
                        {trip.vehicle && (
                          <span className="bg-surface-container-low px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">directions_bus</span>
                            {trip.vehicle.vehicleTypeName}
                          </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-lg flex items-center gap-1 ${avail <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                          <span className="material-symbols-outlined text-[14px]">airline_seat_recline_extra</span>
                          Còn {avail} ghế
                        </span>
                        {trip.tripCode && <span className="font-mono text-xs text-outline bg-surface-container px-2 py-1 rounded">#{trip.tripCode}</span>}
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center gap-4 md:ml-auto">
                        <div className="text-right">
                          {minP > 0 ? (
                            <div>
                              <span className="typo-headline-sm text-primary font-bold">{fmtPrice(minP)}</span>
                              {maxP > minP && <span className="typo-label-sm text-outline-variant ml-1">– {fmtPrice(maxP)}</span>}
                            </div>
                          ) : <span className="typo-body-md text-outline">Liên hệ</span>}
                          {trip.prices && trip.prices.length > 1 && (
                            <span className="typo-label-sm text-outline-variant">{trip.prices.length} loại ghế</span>
                          )}
                        </div>
                        <button onClick={() => handleSelectTrip(trip.id)}
                          disabled={avail <= 0}
                          className={`px-5 py-2.5 rounded-xl typo-label-caps transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isSelected ? 'bg-outline text-on-surface' : 'bg-primary text-on-primary hover:bg-primary-hover'}`}>
                          {isSelected ? 'Thu gọn' : avail <= 0 ? 'Hết ghế' : 'Chọn ghế'}
                        </button>
                      </div>
                    </div>

                    {/* Price breakdown */}
                    {trip.prices && trip.prices.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-outline/10 flex flex-wrap gap-3">
                        {trip.prices.map((p, i) => (
                          <div key={i} className="flex items-center gap-1.5 typo-label-sm text-on-surface-variant">
                            <span className="w-2 h-2 rounded-full bg-primary/60" />
                            <span className="font-medium">{p.seatType}:</span>
                            <span className="text-primary font-bold">{fmtPrice(p.finalPrice || p.basePrice)}</span>
                            {p.currency && p.currency !== 'VND' && <span className="text-outline">({p.currency})</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Seat Map Panel */}
                  {isSelected && (
                    <div className="border-t border-outline/20 bg-surface-container-low p-5">
                      {seatMapLoading ? (
                        <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
                      ) : !seatMap ? (
                        <p className="text-center py-6 text-on-surface-variant">Không thể tải sơ đồ ghế.</p>
                      ) : (
                        <div className="space-y-5">
                          {/* Legend */}
                          <div className="flex flex-wrap gap-4 typo-label-sm text-on-surface-variant">
                            <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border-2 border-green-400 bg-green-50" /> Trống</span>
                            <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border-2 border-primary bg-primary" /> Đang chọn</span>
                            <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border-2 border-slate-300 bg-slate-200" /> Đã đặt</span>
                            <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border-2 border-orange-400 bg-orange-50" /> Đang giữ</span>
                          </div>

                          {/* Seat Grid */}
                          {(() => {
                            // Detect all unique floors dynamically
                            const floors = Array.from(new Set(seatMap.seats.map(s => s.floor))).sort((a, b) => a - b);
                            return (
                              <div className={`grid gap-6 max-w-4xl ${floors.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md'}`}>
                                {floors.map(floor => {
                                  const floorSeats = seatMap.seats.filter(s => s.floor === floor);
                                  const maxCol = Math.max(...floorSeats.map(s => s.columnNumber));
                                  const maxRow = Math.max(...floorSeats.map(s => s.rowNumber));
                                  const floorAvail = floorSeats.filter(s => s.status === 'AVAILABLE').length;

                                  // Build a grid map for quick lookup
                                  const seatGrid = new Map<string, typeof floorSeats[0]>();
                                  for (const s of floorSeats) {
                                    seatGrid.set(`${s.rowNumber}-${s.columnNumber}`, s);
                                  }

                                  return (
                                    <div key={floor} className="bg-white p-4 rounded-xl border border-outline/20">
                                      <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-on-surface">
                                          {floors.length > 1 ? `Tầng ${floor}` : 'Sơ đồ ghế'}
                                        </h4>
                                        <span className="typo-label-sm text-outline-variant">
                                          {floorAvail}/{floorSeats.length} ghế trống
                                        </span>
                                      </div>
                                      <div
                                        className="gap-2 mx-auto"
                                        style={{
                                          display: 'grid',
                                          gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))`,
                                          maxWidth: `${Math.min(maxCol * 56, 320)}px`,
                                        }}
                                      >
                                        {Array.from({ length: maxRow }, (_, r) =>
                                          Array.from({ length: maxCol }, (_, c) => {
                                            const row = r + 1;
                                            const col = c + 1;
                                            const seat = seatGrid.get(`${row}-${col}`);
                                            if (!seat) {
                                              return <div key={`empty-${row}-${col}`} className="h-10" />;
                                            }
                                            const isAvailable = seat.status === 'AVAILABLE';
                                            const isChosen = selectedSeats.includes(seat.seatNumber);
                                            const isBooked = seat.status === 'BOOKED';
                                            const isHeld = seat.status === 'HELD';
                                            return (
                                              <button key={seat.seatNumber}
                                                disabled={!isAvailable && !isChosen}
                                                onClick={() => (isAvailable || isChosen) ? toggleSeat(seat.seatNumber) : undefined}
                                                className={`h-10 flex items-center justify-center rounded-lg border-2 text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${
                                                  isChosen ? 'border-primary bg-primary text-white scale-105 shadow-md' :
                                                  isAvailable ? 'border-green-400 bg-green-50 text-green-700 hover:border-primary hover:bg-primary/10' :
                                                  isBooked ? 'border-slate-300 bg-slate-200 text-slate-400' :
                                                  isHeld ? 'border-orange-400 bg-orange-50 text-orange-600' :
                                                  'border-red-300 bg-red-50 text-red-400'
                                                }`}
                                                title={`${seat.seatNumber} (${seat.seatType})`}>
                                                {seat.seatNumber}
                                              </button>
                                            );
                                          })
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {/* Summary */}
                          {selectedSeats.length > 0 && (
                            <div className="bg-white rounded-xl border border-primary/30 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                              <div>
                                <p className="typo-body-md text-on-surface">
                                  Đã chọn: <span className="font-bold text-primary">{selectedSeats.join(', ')}</span>
                                  <span className="text-outline-variant ml-2">({selectedSeats.length} ghế)</span>
                                </p>
                                {selectedSeats.map(sn => {
                                  const si = seatMap.seats.find(s => s.seatNumber === sn);
                                  const st = si?.seatType || 'REGULAR';
                                  const pe = selectedTrip?.prices?.find(p => p.seatType === st) || selectedTrip?.prices?.[0];
                                  return (
                                    <span key={sn} className="inline-block typo-label-sm text-on-surface-variant mr-3">
                                      {sn} ({st}): <span className="text-primary font-bold">{fmtPrice(pe?.finalPrice || pe?.basePrice || 0)}</span>
                                    </span>
                                  );
                                })}
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="typo-label-sm text-outline-variant">Tổng tiền</p>
                                  <p className="typo-headline-md text-primary font-bold">{fmtPrice(calculateTotal())}</p>
                                </div>
                                <button
                                  className="px-6 py-3 bg-primary text-on-primary rounded-xl typo-label-caps font-bold hover:bg-primary-hover transition-colors shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                                  disabled
                                  title="Chờ Booking Service hoàn thành">
                                  Đặt vé (Sắp ra mắt)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
