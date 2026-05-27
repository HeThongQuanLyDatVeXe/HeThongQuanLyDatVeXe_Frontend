import React from 'react';

interface RouteCardProps {
    route: any;
    stopPoints: any[];
    onClick: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, stopPoints, onClick }) => {
    const fmtDuration = (m: number) => {
        if (!m) return '—';
        const h = Math.floor(m / 60);
        const mm = m % 60;
        return h > 0 ? `${h}h${mm > 0 ? mm + 'p' : ''}` : `${mm}p`;
    };

    const pickups = stopPoints.filter(s => s.isPickup);
    const dropoffs = stopPoints.filter(s => s.isDropoff);

    return (
        <article 
            onClick={onClick}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant hover:border-primary/50 hover:shadow-lg transition-all duration-300 p-5 cursor-pointer group"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">directions_bus</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="typo-body-lg font-bold text-on-surface truncate">{route.name || `${route.originCityName} — ${route.destinationCityName}`}</h3>
                    <span className="typo-label-sm text-outline font-mono">{route.code}</span>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col items-start">
                    <span className="typo-headline-sm text-primary font-bold">{route.originCityName}</span>
                    <span className="typo-label-sm text-outline-variant">Điểm đi</span>
                </div>
                <div className="flex flex-col items-center flex-1 px-3">
                    <span className="typo-label-sm text-outline bg-surface-container-low px-3 py-0.5 rounded-full mb-1.5">
                        ~{fmtDuration(route.durationMinutes)}
                    </span>
                    <div className="flex items-center w-full">
                        <div className="w-2 h-2 rounded-full border-2 border-primary bg-white" />
                        <div className="flex-1 h-px border-t-2 border-dashed border-outline-variant/60 -mx-0.5" />
                        <span className="material-symbols-outlined text-primary text-[16px] -mx-1">arrow_forward</span>
                        <div className="flex-1 h-px border-t-2 border-dashed border-outline-variant/60 -mx-0.5" />
                        <div className="w-2 h-2 rounded-full border-2 border-primary bg-primary" />
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="typo-headline-sm text-on-surface font-bold">{route.destinationCityName}</span>
                    <span className="typo-label-sm text-outline-variant">Điểm đến</span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 typo-label-sm text-on-surface-variant">
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">straighten</span>
                        <span>{route.distanceKm ? `${route.distanceKm} km` : '—'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <span>{fmtDuration(route.durationMinutes)}</span>
                    </div>
                </div>
                <span className="text-primary typo-label-caps font-bold group-hover:underline flex items-center gap-1">
                    Xem chuyến <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </span>
            </div>

            {/* Stop Points */}
            {(pickups.length > 0 || dropoffs.length > 0) && (
                <div className="mt-3 pt-3 border-t border-outline/10 space-y-1.5">
                    {pickups.length > 0 && (
                        <div className="flex items-start gap-1.5 typo-label-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-green-600 text-[14px] mt-0.5 shrink-0">location_on</span>
                            <span><span className="font-semibold text-green-700">Đón:</span> {pickups.map(p => p.stopPointName).join(', ')}</span>
                        </div>
                    )}
                    {dropoffs.length > 0 && (
                        <div className="flex items-start gap-1.5 typo-label-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-red-500 text-[14px] mt-0.5 shrink-0">flag</span>
                            <span><span className="font-semibold text-red-600">Trả:</span> {dropoffs.map(p => p.stopPointName).join(', ')}</span>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
};
