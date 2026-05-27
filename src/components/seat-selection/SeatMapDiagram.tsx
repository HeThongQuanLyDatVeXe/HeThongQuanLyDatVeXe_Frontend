import React from 'react';
import type { SeatInfo } from '../../types/trip-service/Trip';

interface SeatMapDiagramProps {
    vehicleType: string;
    loadingSeats: boolean;
    seatMap: SeatInfo[];
    soldSeats: Set<string>;
    selectedSeats: string[];
    handleSeatClick: (seatCode: string) => void;
    activeDeck: 'lower' | 'upper';
    setActiveDeck: (deck: 'lower' | 'upper') => void;
    lowerDeckSeats: SeatInfo[];
    upperDeckSeats: SeatInfo[];
    currentDeckSeats: SeatInfo[];
    hasMultipleDecks: boolean;
    hasSeatPositionInfo: boolean;
}

export const SeatMapDiagram: React.FC<SeatMapDiagramProps> = ({
    vehicleType,
    loadingSeats,
    seatMap,
    soldSeats,
    selectedSeats,
    handleSeatClick,
    activeDeck,
    setActiveDeck,
    lowerDeckSeats,
    upperDeckSeats,
    currentDeckSeats,
    hasMultipleDecks,
    hasSeatPositionInfo
}) => {
    const groupByRow = (seats: SeatInfo[]) => {
        const rows: Record<number, SeatInfo[]> = {};
        seats.forEach(s => {
            const row = s.rowNumber || 0;
            if (!rows[row]) rows[row] = [];
            rows[row].push(s);
        });
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

    const renderFallbackLayout = (seats: SeatInfo[]) => {
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

    const renderSmartLayout = (seats: SeatInfo[]) => {
        const rowGroups = groupByRow(seats);
        const maxCols = Math.max(...seats.map(s => s.columnNumber || 1), 2);

        return (
            <div className="space-y-4">
                {rowGroups.map(([rowNum, rowSeats]) => (
                    <div key={rowNum} className="flex justify-center gap-3">
                        {Array.from({ length: maxCols }, (_, colIdx) => {
                            const seat = rowSeats.find(s => (s.columnNumber || 0) === colIdx + 1);
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

    return (
        <section className="w-full md:w-2/3 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col items-center shadow-[0_8px_20px_rgba(92,64,51,0.05)]">
            <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Chọn Chỗ Ngồi
            </h1>
            <p className="text-sm text-on-surface-variant text-center mb-lg">
                {hasMultipleDecks ? (activeDeck === 'lower' ? 'Tầng Dưới' : 'Tầng Trên') : 'Sơ đồ ghế'} • {vehicleType}
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
    );
};
