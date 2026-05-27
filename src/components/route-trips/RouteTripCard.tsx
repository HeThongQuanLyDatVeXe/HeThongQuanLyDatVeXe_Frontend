import React from 'react';
import { RouteSeatMap } from './RouteSeatMap';

interface RouteTripCardProps {
    trip: any;
    route: any;
    isSelected: boolean;
    getMinPrice: (t: any) => number;
    getMaxPrice: (t: any) => number;
    handleSelectTrip: (id: any) => void;
    fmtPrice: (p: number) => string;
    fmtDuration: (m: number) => string;
    fmtTime: (d: string) => string;
    seatMapLoading: boolean;
    seatMap: any;
    selectedSeats: string[];
    toggleSeat: (seatNumber: string) => void;
    calculateTotal: () => number;
    navigate: (url: string, options?: any) => void;
}

export const RouteTripCard: React.FC<RouteTripCardProps> = ({
    trip, route, isSelected, getMinPrice, getMaxPrice, handleSelectTrip, fmtPrice, fmtDuration, fmtTime,
    seatMapLoading, seatMap, selectedSeats, toggleSeat, calculateTotal, navigate
}) => {
    const minP = getMinPrice(trip);
    const maxP = getMaxPrice(trip);
    const avail = trip.availableSeats ?? trip.totalSeats ?? 0;
    const depTime = fmtTime(trip.departureDatetime);
    const arrTime = trip.arrivalDatetime ? fmtTime(trip.arrivalDatetime) : '—';
    const dur = trip.route?.durationMinutes || route.durationMinutes;
    const depDateFull = new Date(trip.departureDatetime).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    const arrDateFull = trip.arrivalDatetime
        ? new Date(trip.arrivalDatetime).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
        : null;

    return (
        <div className={`bg-surface-container-lowest rounded-xl border transition-all duration-300 overflow-hidden ${isSelected ? 'border-primary shadow-lg' : 'border-outline-variant hover:border-primary/40 hover:shadow-md'}`}>
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
                        {trip.prices.map((p: any, i: number) => (
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
                <RouteSeatMap
                    seatMapLoading={seatMapLoading}
                    seatMap={seatMap}
                    selectedSeats={selectedSeats}
                    toggleSeat={toggleSeat}
                    selectedTrip={trip}
                    fmtPrice={fmtPrice}
                    calculateTotal={calculateTotal}
                    navigate={navigate}
                    route={route}
                />
            )}
        </div>
    );
};
