import React from 'react';
import { Bus, CheckCircle, MapPin } from '@phosphor-icons/react';

interface TripDetailLeftColumnProps {
    trip: any;
    from: string;
    to: string;
    routeName: string;
    durationStr: string;
    distanceKm: number;
    vehicleType: string;
    vehicleBrand: string;
    vehicleFullName: string;
    licensePlate: string;
    totalSeats: number;
    availableSeats: number;
    seatType: string;
    tripStatus: string;
    tripCode: string;
    formatTime: (iso: string) => string;
    isNextDay: (d1: string, d2: string) => boolean;
}

export const TripDetailLeftColumn: React.FC<TripDetailLeftColumnProps> = ({
    trip, from, to, routeName, durationStr, distanceKm, vehicleType, vehicleBrand,
    vehicleFullName, licensePlate, totalSeats, availableSeats, seatType, tripStatus,
    tripCode, formatTime, isNextDay
}) => {
    return (
        <div className="w-full lg:w-[65%] space-y-md">
            {/* Hero Trip Header */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_8px_20px_rgba(92,64,51,0.03)] p-md text-left">
                {/* Trip Code & Status */}
                <div className="flex justify-between items-start border-b border-outline-variant pb-sm mb-sm">
                    <div className="flex items-center space-x-md">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Bus size={28} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="typo-headline-md text-headline-md text-on-surface">{routeName}</h1>
                            <div className="flex items-center space-x-2 mt-xs flex-wrap">
                                {tripCode && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant border border-outline-variant text-xs font-mono">
                                        #{tripCode}
                                    </span>
                                )}
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    tripStatus === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    tripStatus === 'BOARDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    tripStatus === 'ON_ROUTE' ? 'bg-green-50 text-green-700 border border-green-200' :
                                    tripStatus === 'COMPLETED' ? 'bg-slate-50 text-slate-600 border border-slate-200' :
                                    tripStatus === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    'bg-surface-container-low text-on-surface-variant border border-outline-variant'
                                }`}>
                                    {tripStatus === 'SCHEDULED' ? 'Đã lên lịch' :
                                     tripStatus === 'BOARDING' ? 'Đang lên xe' :
                                     tripStatus === 'ON_ROUTE' ? 'Đang chạy' :
                                     tripStatus === 'COMPLETED' ? 'Hoàn thành' :
                                     tripStatus === 'CANCELLED' ? 'Đã hủy' :
                                     tripStatus === 'DELAYED' ? 'Trễ giờ' : tripStatus}
                                </span>
                                <span className="text-outline-variant">•</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-low text-secondary border border-outline-variant text-xs">
                                    <CheckCircle size={14} className="mr-1" /> Còn {availableSeats}/{totalSeats} ghế
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Time Display */}
                <div className="flex items-center justify-between py-sm">
                    <div className="text-center w-1/4">
                        <div className="typo-label-caps text-xs text-on-surface-variant mb-xs">KHỞI HÀNH</div>
                        <div className="typo-display-hero text-3xl font-bold text-on-surface">{formatTime(trip.departureDatetime)}</div>
                        <div className="typo-body-md text-sm text-on-surface-variant mt-1">Bến xe {from}</div>
                    </div>

                    <div className="w-2/4 flex flex-col items-center justify-center px-md">
                        <div className="typo-label-sm text-sm text-on-surface-variant mb-2">~{durationStr}</div>
                        <div className="w-full relative flex items-center">
                            <div className="h-0.5 w-full border-t-2 border-dashed border-outline-variant relative"></div>
                            <Bus size={24} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary bg-surface-container-lowest px-1" />
                        </div>
                        {distanceKm > 0 && (
                            <div className="typo-label-sm text-xs text-primary mt-2 uppercase tracking-wider">{distanceKm} km</div>
                        )}
                    </div>

                    <div className="text-center w-1/4">
                        <div className="typo-label-caps text-xs text-on-surface-variant mb-xs">ĐẾN NƠI</div>
                        <div className="typo-display-hero text-3xl font-bold text-on-surface">{formatTime(trip.arrivalDatetime)}</div>
                        {isNextDay(trip.departureDatetime, trip.arrivalDatetime) && (
                            <div className="typo-label-sm text-xs text-on-surface-variant mt-xs">+1 ngày</div>
                        )}
                        <div className="typo-body-md text-sm text-on-surface-variant mt-1">Bến xe {to}</div>
                    </div>
                </div>
            </div>

            {/* Vehicle Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-sm flex items-center space-x-md text-left">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                        <Bus size={24} />
                    </div>
                    <div>
                        <div className="typo-label-sm text-xs text-on-surface-variant">Loại xe</div>
                        <div className="typo-body-lg text-base font-semibold text-on-surface">{vehicleType}</div>
                        {vehicleBrand && (
                            <div className="typo-label-sm text-xs text-on-surface-variant">{vehicleFullName}</div>
                        )}
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-sm flex items-center space-x-md text-left">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <div className="typo-label-sm text-xs text-on-surface-variant">Biển số xe</div>
                        <div className="mt-1 inline-block border-2 border-on-surface rounded bg-surface-container-lowest px-2 py-0.5">
                            <span className="typo-body-lg text-sm font-bold text-on-surface tracking-widest">{licensePlate}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-sm flex items-center space-x-md text-left">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-primary">airline_seat_recline_extra</span>
                    </div>
                    <div>
                        <div className="typo-label-sm text-xs text-on-surface-variant">Số ghế</div>
                        <div className="typo-body-lg text-base font-semibold text-on-surface">{totalSeats} chỗ</div>
                        <div className="typo-label-sm text-xs text-secondary">Còn trống: {availableSeats} ghế</div>
                    </div>
                </div>

                {seatType && (
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-sm flex items-center space-x-md text-left">
                        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-primary">chair</span>
                        </div>
                        <div>
                            <div className="typo-label-sm text-xs text-on-surface-variant">Loại ghế</div>
                            <div className="typo-body-lg text-base font-semibold text-on-surface">{seatType}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Itinerary */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_8px_20px_rgba(92,64,51,0.03)] p-md text-left">
                <h2 className="typo-headline-md text-xl font-bold text-on-surface mb-md">Lộ trình chi tiết</h2>
                <div className="relative ml-4 border-l-2 border-outline-variant space-y-lg pb-4">
                    {/* Departure */}
                    <div className="relative pl-sm">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-surface-container-lowest"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-semibold text-on-surface text-base">Bến xe {from}</div>
                                <div className="typo-label-sm text-xs text-on-surface-variant mt-xs">{from}</div>
                            </div>
                            <div className="text-sm font-semibold text-primary">{formatTime(trip.departureDatetime)}</div>
                        </div>
                    </div>
                    {/* Arrival */}
                    <div className="relative pl-sm">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-surface-container-lowest"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-semibold text-on-surface text-base">Bến xe {to}</div>
                                <div className="typo-label-sm text-xs text-on-surface-variant mt-xs">{to}</div>
                            </div>
                            <div className="text-sm font-semibold text-primary">{formatTime(trip.arrivalDatetime)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price Breakdown (if multiple price tiers) */}
            {trip.prices && trip.prices.length > 0 && (
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_8px_20px_rgba(92,64,51,0.03)] p-md text-left">
                    <h2 className="typo-headline-md text-xl font-bold text-on-surface mb-md">Bảng giá</h2>
                    <div className="space-y-3">
                        {trip.prices.map((p: any, idx: number) => (
                            <div key={p.id || idx} className="flex justify-between items-center py-2 border-b border-outline-variant last:border-b-0">
                                <div>
                                    <span className="font-semibold text-on-surface">{p.seatType || 'Ghế tiêu chuẩn'}</span>
                                </div>
                                <div className="text-right">
                                    {p.basePrice !== p.finalPrice ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-on-surface-variant line-through">{Number(p.basePrice).toLocaleString()}đ</span>
                                            <span className="font-bold text-primary">{Number(p.finalPrice).toLocaleString()}đ</span>
                                        </div>
                                    ) : (
                                        <span className="font-bold text-primary">{Number(p.finalPrice).toLocaleString()}đ</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes */}
            {trip.notes && (
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md text-left">
                    <h2 className="typo-headline-md text-lg font-bold text-on-surface mb-sm">Ghi chú</h2>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{trip.notes}</p>
                </div>
            )}
        </div>
    );
};
