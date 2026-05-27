import React from 'react';

interface RouteSeatMapProps {
    seatMapLoading: boolean;
    seatMap: any;
    selectedSeats: string[];
    toggleSeat: (seatNumber: string) => void;
    selectedTrip: any;
    fmtPrice: (p: number) => string;
    calculateTotal: () => number;
    navigate: (url: string, options?: any) => void;
    route: any;
}

export const RouteSeatMap: React.FC<RouteSeatMapProps> = ({
    seatMapLoading, seatMap, selectedSeats, toggleSeat, selectedTrip,
    fmtPrice, calculateTotal, navigate, route
}) => {
    return (
        <div className="border-t border-outline/20 bg-surface-container-low p-5">
            {seatMapLoading ? (
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
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
                        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border-2 border-red-300 bg-red-50" /> Hỏng/Khóa</span>
                    </div>

                    {/* Seat Grid */}
                    {(() => {
                        const floors = Array.from(new Set(seatMap.seats.map((s: any) => s.floor))).sort((a: any, b: any) => a - b);
                        return (
                            <div className={`grid gap-6 max-w-4xl ${floors.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md'}`}>
                                {floors.map((floor: any) => {
                                    const floorSeats = seatMap.seats.filter((s: any) => s.floor === floor);
                                    const maxCol = Math.max(...floorSeats.map((s: any) => s.columnNumber));
                                    const maxRow = Math.max(...floorSeats.map((s: any) => s.rowNumber));
                                    const floorAvail = floorSeats.filter((s: any) => s.status === 'AVAILABLE').length;

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

                                                        const getSeatTypeName = (type?: string) => {
                                                            if (!type) return '';
                                                            const upper = type.toUpperCase();
                                                            if (upper === 'VIP') return 'VIP';
                                                            if (upper === 'NORMAL' || upper === 'REGULAR') return 'Thường';
                                                            if (upper === 'BED') return 'Giường';
                                                            if (upper === 'DOUBLE_BED') return 'Giường đôi';
                                                            if (upper === 'LIMOUSINE') return 'Limousine';
                                                            return type;
                                                        };
                                                        const seatTypeName = getSeatTypeName(seat.seatType);

                                                        return (
                                                            <button key={seat.seatNumber}
                                                                disabled={!isAvailable && !isChosen}
                                                                onClick={() => (isAvailable || isChosen) ? toggleSeat(seat.seatNumber) : undefined}
                                                                className={`h-14 flex flex-col items-center justify-center rounded-lg border-2 text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed p-1 ${isChosen ? 'border-primary bg-primary text-white scale-105 shadow-md' :
                                                                    isAvailable ? 'border-green-400 bg-green-50 text-green-700 hover:border-primary hover:bg-primary/10' :
                                                                        isBooked ? 'border-slate-300 bg-slate-200 text-slate-400' :
                                                                            isHeld ? 'border-orange-400 bg-orange-50 text-orange-600' :
                                                                                'border-red-300 bg-red-50 text-red-400'
                                                                    }`}
                                                                title={`${seat.seatNumber} (${seat.seatType})`}>
                                                                <span>{seat.seatNumber}</span>
                                                                <span className="text-[9px] font-normal opacity-80 truncate w-full text-center mt-0.5">{seatTypeName}</span>
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
                                    const si = seatMap.seats.find((s: any) => s.seatNumber === sn);
                                    const st = si?.seatType || 'REGULAR';
                                    const pe = selectedTrip?.prices?.find((p: any) => p.seatType === st) || selectedTrip?.prices?.[0];
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
                                    className="px-6 py-3 bg-primary text-on-primary rounded-xl typo-label-caps font-bold hover:bg-primary-hover transition-colors shadow-md active:scale-95 cursor-pointer"
                                    onClick={() => {
                                        const seatDetails = selectedSeats.map(sn => {
                                            const si = seatMap!.seats.find((s: any) => s.seatNumber === sn);
                                            const st = si?.seatType || 'REGULAR';
                                            const pe = selectedTrip?.prices?.find((p: any) => p.seatType === st) || selectedTrip?.prices?.[0];
                                            return { seatNumber: sn, seatType: st, price: pe?.finalPrice || pe?.basePrice || 0 };
                                        });
                                        navigate(`/dat-ve/${selectedTrip.id}`, {
                                            state: {
                                                selectedSeats,
                                                seatDetails,
                                                trip: {
                                                    id: selectedTrip!.id,
                                                    from: route.originCityName,
                                                    to: route.destinationCityName,
                                                    vehicleType: selectedTrip!.vehicle?.vehicleTypeName || '',
                                                    licensePlate: selectedTrip!.vehicle?.licensePlate || '',
                                                    departureDatetime: selectedTrip!.departureDatetime,
                                                    arrivalDatetime: selectedTrip!.arrivalDatetime,
                                                    tripCode: selectedTrip!.tripCode || '',
                                                },
                                                totalAmount: calculateTotal(),
                                            }
                                        });
                                    }}>
                                    Đặt vé ngay
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
