import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { publicTripService } from '../services/trip-service/publicTripService';
import type { TripResponse, SeatInfo } from '../types/trip-service/Trip';

export const SeatSelectionPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // State passed from TripDetailPage
    const passedState = location.state as { passengers?: number; currentTrip?: any } | null;

    // ── Trip data: fetch from API if not passed ──────────────────────────
    const [trip, setTrip] = useState<TripResponse | null>(null);
    const [loadingTrip, setLoadingTrip] = useState(!passedState?.currentTrip);

    useEffect(() => {
        if (passedState?.currentTrip) return; // Already have data from navigation state
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

    // Build currentTrip from either passed state or fetched data
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

    // ── Format helpers ───────────────────────────────────────────────────
    const formatTime = (isoStr: string | undefined) => {
        if (!isoStr) return '--:--';
        return new Date(isoStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatShortDate = (isoStr: string | undefined) => {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const day = d.getDate();
        const month = d.getMonth() + 1;
        return `${dayNames[d.getDay()]}, ${day < 10 ? '0' + day : day} Th${month}`;
    };

    // ── Seat map: fetch from API ─────────────────────────────────────────
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
    }, [id]);

    // ── Seat selection state ─────────────────────────────────────────────
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

    // ── Dynamic seat rendering from API data ─────────────────────────────
    // Group seats by floor
    const lowerDeckSeats = seatMap.filter(s => s.floor === 1 || s.seatNumber.startsWith('A'));
    const upperDeckSeats = seatMap.filter(s => s.floor === 2 || s.seatNumber.startsWith('B'));
    const currentDeckSeats = activeDeck === 'lower' ? lowerDeckSeats : upperDeckSeats;
    const hasMultipleDecks = upperDeckSeats.length > 0;

    // Group by rows for rendering
    const groupByRow = (seats: SeatInfo[]) => {
        const rows: Record<number, SeatInfo[]> = {};
        seats.forEach(s => {
            const row = s.rowNumber || 0;
            if (!rows[row]) rows[row] = [];
            rows[row].push(s);
        });
        // Sort each row by column
        Object.values(rows).forEach(r => r.sort((a, b) => (a.columnNumber || 0) - (b.columnNumber || 0)));
        return Object.entries(rows).sort(([a], [b]) => Number(a) - Number(b));
    };

    const getSeatTypeName = (type?: string) => {
        if (!type) return '';
        const upper = type.toUpperCase();
        if (upper === 'VIP') return 'VIP';
        if (upper === 'NORMAL') return 'Thường';
        if (upper === 'BED') return 'Giường';
        return type;
    };

    const renderSeatButton = (seat: SeatInfo) => {
        const seatCode = seat.seatNumber;
        const isSold = soldSeats.has(seatCode);
        const isSelected = selectedSeats.includes(seatCode);
        const seatTypeDisplay = getSeatTypeName(seat.seatType);

        if (isSold) {
            return (
                <button
                    disabled
                    className="w-16 h-20 rounded-xl bg-surface-variant flex flex-col items-center justify-center cursor-not-allowed opacity-70 border border-transparent p-1"
                >
                    <span className="material-symbols-outlined text-on-surface-variant text-sm mb-1">bed</span>
                    <span className="font-body-md text-xs font-semibold text-on-surface-variant">{seatCode}</span>
                    <span className="text-[9px] text-on-surface-variant truncate w-full text-center">{seatTypeDisplay}</span>
                </button>
            );
        }

        if (isSelected) {
            return (
                <button
                    onClick={() => handleSeatClick(seatCode)}
                    className="w-16 h-20 rounded-xl bg-primary shadow-[0_4px_12px_rgba(161,59,0,0.3)] transition-all flex flex-col items-center justify-center ring-2 ring-primary ring-offset-2 ring-offset-surface cursor-pointer p-1"
                >
                    <span className="material-symbols-outlined text-on-primary text-sm mb-1">bed</span>
                    <span className="font-body-md text-xs font-bold text-on-primary">{seatCode}</span>
                    <span className="text-[9px] text-primary-container font-medium truncate w-full text-center">{seatTypeDisplay}</span>
                </button>
            );
        }

        return (
            <button
                onClick={() => handleSeatClick(seatCode)}
                className="w-16 h-20 rounded-xl border-2 border-outline-variant bg-surface-container-lowest hover:border-primary hover:shadow-[0_4px_12px_rgba(161,59,0,0.2)] transition-all flex flex-col items-center justify-center cursor-pointer p-1"
            >
                <span className="material-symbols-outlined text-outline text-sm mb-1">bed</span>
                <span className="font-body-md text-xs font-semibold text-on-surface">{seatCode}</span>
                <span className="text-[9px] text-on-surface-variant truncate w-full text-center">{seatTypeDisplay}</span>
            </button>
        );
    };

    // Fallback static layout when seat map has no row/col info
    const renderFallbackLayout = (seats: SeatInfo[]) => {
        // Arrange in 2-column layout with aisle
        const rows: SeatInfo[][] = [];
        for (let i = 0; i < seats.length; i += 2) {
            rows.push(seats.slice(i, i + 2));
        }
        return (
            <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                {rows.map((row, ri) => (
                    <React.Fragment key={ri}>
                        <div className="col-span-1 flex justify-center">{row[0] && renderSeatButton(row[0])}</div>
                        <div className="col-span-1"></div>
                        <div className="col-span-1 flex justify-center">{row[1] && renderSeatButton(row[1])}</div>
                    </React.Fragment>
                ))}
            </div>
        );
    };

    // Smart layout when seat map has row/col info
    const renderSmartLayout = (seats: SeatInfo[]) => {
        const rowGroups = groupByRow(seats);
        const maxCols = Math.max(...seats.map(s => s.columnNumber || 1), 2);

        return (
            <div className="space-y-4">
                {rowGroups.map(([rowNum, rowSeats]) => (
                    <div key={rowNum} className="flex justify-center gap-3">
                        {Array.from({ length: maxCols }, (_, colIdx) => {
                            const seat = rowSeats.find(s => (s.columnNumber || 0) === colIdx + 1);
                            // Insert aisle gap in the middle
                            const isAisle = maxCols >= 3 && colIdx === Math.floor(maxCols / 2) - 1;
                            return (
                                <React.Fragment key={colIdx}>
                                    <div className="flex justify-center">
                                        {seat ? renderSeatButton(seat) : <div className="w-16 h-20" />}
                                    </div>
                                    {isAisle && <div className="w-4" />}
                                </React.Fragment>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    const hasSeatPositionInfo = currentDeckSeats.some(s => s.rowNumber > 0 && s.columnNumber > 0);

    // ── Loading / Error states ───────────────────────────────────────────
    if (loadingTrip) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!ct) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
                <span className="material-symbols-outlined text-6xl text-outline">error_outline</span>
                <h2 className="text-xl font-bold text-on-surface">Không tìm thấy thông tin chuyến đi</h2>
                <button onClick={() => navigate(ROUTES.ROUTES)} className="px-6 py-2 bg-primary text-on-primary rounded-xl cursor-pointer">
                    Quay lại tuyến đường
                </button>
            </div>
        );
    }

    const price = Number(ct.price) || 0;

    return (
        <div className="min-h-screen bg-background text-on-background font-body-md antialiased noise-bg relative pb-32">
            <div className="grain-overlay" />

            {/* Top Navigation */}
            <header className="fixed top-0 w-full z-50 bg-[#FFF4ED]/90 backdrop-blur-md border-b border-[#E8D5C4] shadow-[0_4px_20px_rgba(92,64,51,0.05)] transition-all duration-300">
                <div className="flex justify-between items-center px-8 py-4 max-w-[1200px] mx-auto w-full">
                    <div 
                        onClick={() => navigate(ROUTES.HOME)}
                        className="text-2xl font-bold text-[#F4600C] cursor-pointer"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Đi Về Nhà
                    </div>
                    <button 
                        onClick={() => navigate(`/tuyen-duong/${ct.id}`)}
                        className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none font-bold text-sm tracking-wider uppercase"
                    >
                        <span>Hủy & Quay Lại</span>
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </header>

            {/* Main Content Layout */}
            <main className="pt-32 max-w-[1200px] mx-auto px-8 w-full flex flex-col md:flex-row gap-lg">
                
                {/* LEFT COLUMN: Summary (Sticky) */}
                <aside className="w-full md:w-1/3 md:sticky md:top-32 h-fit space-y-md text-left">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-[0_8px_20px_rgba(92,64,51,0.05)]">
                        <h2 className="text-xl font-bold text-primary mb-md" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Chi Tiết Chuyến Đi
                        </h2>
                        
                        <div className="flex flex-col gap-sm relative">
                            <div className="absolute left-3 top-6 bottom-6 w-px border-l-2 border-dashed border-outline-variant z-0"></div>
                            
                            {/* Departure */}
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-6 h-6 rounded-full bg-surface-container-highest border-2 border-primary flex items-center justify-center mt-1">
                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">{ct.from} - BẾN XE ĐÓN</p>
                                    <p className="text-lg text-on-surface font-semibold">
                                        {formatTime(ct.departureDatetime)} • {formatShortDate(ct.departureDatetime)}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Destination */}
                            <div className="flex items-start gap-4 relative z-10 mt-4">
                                <div className="w-6 h-6 rounded-full bg-surface-container-highest border-2 border-tertiary-container flex items-center justify-center mt-1">
                                    <span className="material-symbols-outlined text-[14px] text-tertiary-container font-bold">location_on</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">{ct.to} - BẾN XE ĐẾN</p>
                                    <p className="text-lg text-on-surface font-semibold">
                                        {formatTime(ct.arrivalDatetime)} • {formatShortDate(ct.arrivalDatetime)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-outline-variant w-full my-md"></div>
                        
                        {/* Vehicle info */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-outline-variant flex items-center justify-center overflow-hidden">
                                <span className="material-symbols-outlined text-primary text-2xl">directions_bus</span>
                            </div>
                            <div>
                                <p className="text-base font-semibold text-on-surface">{ct.vehicleType}</p>
                                <p className="text-sm text-on-surface-variant">
                                    {ct.vehicleFullName && ct.vehicleFullName !== ct.vehicleType ? ct.vehicleFullName : ''} 
                                    {ct.licensePlate ? ` • ${ct.licensePlate}` : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Selected seats display */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-[0_8px_20px_rgba(92,64,51,0.05)]">
                        <div className="flex justify-between items-center mb-sm">
                            <h3 className="text-base font-semibold text-on-surface">Ghế Đã Chọn</h3>
                            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold">
                                {selectedSeats.length}
                            </span>
                        </div>
                        
                        {selectedSeats.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                                {selectedSeats.map((seat) => (
                                    <span 
                                        key={seat} 
                                        className="border border-primary text-primary px-3 py-1.5 rounded-lg font-semibold bg-primary/5 text-sm"
                                    >
                                        {seat}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-on-surface-variant italic">Chưa chọn ghế ngồi nào</p>
                        )}
                    </div>
                </aside>

                {/* CENTER COLUMN: Bus seat diagram */}
                <section className="w-full md:w-2/3 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col items-center shadow-[0_8px_20px_rgba(92,64,51,0.05)]">
                    <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Chọn Chỗ Ngồi
                    </h1>
                    <p className="text-sm text-on-surface-variant text-center mb-lg">
                        {hasMultipleDecks ? (activeDeck === 'lower' ? 'Tầng Dưới' : 'Tầng Trên') : 'Sơ đồ ghế'} • {ct.vehicleType}
                    </p>
                    
                    {/* Legend */}
                    <div className="flex gap-md mb-xl justify-center w-full flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded border border-outline-variant bg-surface-container-lowest"></div>
                            <span className="text-sm text-on-surface-variant">Còn trống</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-primary"></div>
                            <span className="text-sm text-on-surface-variant">Đang chọn</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-surface-variant"></div>
                            <span className="text-sm text-on-surface-variant">Đã bán</span>
                        </div>
                    </div>

                    {/* Seat map content */}
                    {loadingSeats ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : seatMap.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <span className="material-symbols-outlined text-5xl text-outline">event_seat</span>
                            <p className="text-on-surface-variant">Chưa có sơ đồ ghế cho chuyến này</p>
                        </div>
                    ) : (
                        <div className="relative border-4 border-outline-variant rounded-[40px] rounded-t-[80px] p-8 w-full max-w-sm mx-auto bg-surface">
                            {/* Steering wheel */}
                            <div className="flex justify-start mb-8 opacity-50">
                                <span className="material-symbols-outlined text-on-surface-variant text-2xl">radio_button_unchecked</span>
                            </div>

                            {hasSeatPositionInfo
                                ? renderSmartLayout(currentDeckSeats)
                                : renderFallbackLayout(currentDeckSeats)
                            }
                        </div>
                    )}

                    {/* Deck toggle */}
                    {hasMultipleDecks && (
                        <div className="mt-8 flex gap-4">
                            <button 
                                onClick={() => setActiveDeck('lower')}
                                className={`px-6 py-2 border rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                                    activeDeck === 'lower' 
                                        ? 'border-outline text-on-surface bg-surface-container-high shadow-inner' 
                                        : 'border-transparent text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                            >
                                Tầng Dưới ({lowerDeckSeats.length} ghế)
                            </button>
                            <button 
                                onClick={() => setActiveDeck('upper')}
                                className={`px-6 py-2 border rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                                    activeDeck === 'upper' 
                                        ? 'border-outline text-on-surface bg-surface-container-high shadow-inner' 
                                        : 'border-transparent text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                            >
                                Tầng Trên ({upperDeckSeats.length} ghế)
                            </button>
                        </div>
                    )}
                </section>
            </main>

            {/* BOTTOM STICKY BAR */}
            <div className="fixed bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_20px_rgba(92,64,51,0.1)] p-4 md:p-6 z-40">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-base text-on-surface-variant">
                            Bạn đã chọn: <span className="font-semibold text-on-surface">{selectedSeats.length} ghế</span> 
                            {selectedSeats.length > 0 && ` (${selectedSeats.join(', ')})`}
                        </p>
                        <p className="text-2xl font-bold text-primary mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Tổng: {(price * selectedSeats.length).toLocaleString()}₫
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleContinue}
                        disabled={selectedSeats.length === 0}
                        className="w-full md:w-auto bg-primary text-on-primary font-semibold text-base py-4 px-12 rounded-xl hover:bg-[#c84d04] shadow-[0_4px_12px_rgba(161,59,0,0.3)] hover:shadow-[0_6px_18px_rgba(161,59,0,0.4)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border-none uppercase tracking-wider disabled:bg-surface-container-highest disabled:text-outline disabled:cursor-not-allowed"
                    >
                        <span>Tiếp tục</span>
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
