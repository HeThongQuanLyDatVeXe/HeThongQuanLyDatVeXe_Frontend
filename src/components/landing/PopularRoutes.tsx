import React from 'react';
import { ArrowRight } from '@phosphor-icons/react';

interface PopularRoutesProps {
    popularRoutes: any[];
    loadingPopular: boolean;
    navigate: (url: string) => void;
    ROUTES: Record<string, string>;
}

export const PopularRoutes: React.FC<PopularRoutesProps> = ({ popularRoutes, loadingPopular, navigate, ROUTES }) => {
    return (
        <section id="tuyen-duong" className="py-24 bg-background scroll-mt-20">
            <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                <div className="flex items-end justify-between mb-12 md:mb-16">
                    <div>
                        <h2 className="font-headline-md text-3xl md:text-4xl text-on-surface font-bold">
                            Tuyến phổ biến
                        </h2>
                        <div className="w-20 h-1 bg-primary mt-4 rounded-full"></div>
                    </div>
                    <button 
                        onClick={() => navigate(ROUTES.ROUTES)}
                        className="text-primary font-label-caps text-xs tracking-wider uppercase flex items-center gap-2 hover:gap-3.5 transition-all duration-300 group font-bold bg-transparent border-none cursor-pointer"
                    >
                        <span>Xem tất cả</span>
                        <ArrowRight size={14} weight="bold" />
                    </button>
                </div>

                {loadingPopular ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {popularRoutes.map((route, i) => {
                            const fromName = route.originCityName || 'Không xác định';
                            const toName = route.destinationCityName || 'Không xác định';
                            const title = route.name || 'Hành trình kết nối'; 
                            const priceNum = (route as any).basePrice;
                            const price = priceNum ? `${priceNum.toLocaleString()}₫` : null;
                            const distanceKm = route.distanceKm;
                            const durationMin = route.durationMinutes;
                            const durationStr = durationMin ? `${Math.floor(durationMin / 60)}h${durationMin % 60 > 0 ? `${durationMin % 60}p` : ''}` : null;

                            const handleRouteClick = () => {
                                navigate(`/tuyen-duong/${route.id}/chuyen-xe`);
                            };

                            return (
                                <div key={route.id || i} className="group cursor-pointer flex flex-col" onClick={handleRouteClick}>
                                    {/* Route card */}
                                    <div className="relative h-64 rounded-2xl overflow-hidden shadow-md mb-4 bg-[#1A1410] flex flex-col items-center justify-center">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_#F4600C22_0%,_transparent_70%)] pointer-events-none" />
                                        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
                                            <span className="material-symbols-outlined text-primary text-4xl mb-3">directions_bus</span>
                                            <p className="font-label-caps text-[10px] text-white/60 uppercase tracking-wider" style={{ letterSpacing: '0.05em' }}>
                                                {fromName} → {toName}
                                            </p>
                                            <p className="font-headline-md text-base md:text-lg font-bold text-white leading-tight mt-2">{title}</p>
                                            <div className="flex gap-3 mt-3 text-white/50 text-xs">
                                                {distanceKm ? <span>{distanceKm} km</span> : null}
                                                {distanceKm && durationStr ? <span>•</span> : null}
                                                {durationStr ? <span>~{durationStr}</span> : null}
                                            </div>
                                        </div>
                                        
                                        {price && (
                                            <div className="absolute top-4 right-4 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                Từ {price}
                                            </div>
                                        )}
                                    </div>

                                    {/* Animated Order Button */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleRouteClick(); }}
                                        className="w-full py-3 border border-primary/20 hover:border-primary text-primary rounded-xl font-semibold text-xs tracking-wider uppercase hover:bg-primary hover:text-on-primary transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 shadow-sm cursor-pointer"
                                    >
                                        Tìm chuyến
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};
