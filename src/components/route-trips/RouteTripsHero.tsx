import React from 'react';
import { Link } from 'react-router-dom';

interface RouteTripsHeroProps {
    route: any;
    stopPoints: any[];
    ROUTES: Record<string, string>;
    fmtDuration: (m: number) => string;
    fmtPrice: (p: number) => string;
    routePrices: any[];
}

export const RouteTripsHero: React.FC<RouteTripsHeroProps> = ({ route, stopPoints, ROUTES, fmtDuration, fmtPrice, routePrices }) => {
    return (
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
    );
};
