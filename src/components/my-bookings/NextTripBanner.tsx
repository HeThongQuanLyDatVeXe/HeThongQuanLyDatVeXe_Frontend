import React from 'react';

interface NextTripBannerProps {
    nextTrip: any;
    handleNavigateProfile: () => void;
}

export const NextTripBanner: React.FC<NextTripBannerProps> = ({ nextTrip, handleNavigateProfile }) => {
    return (
        <div
            className="rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden text-left"
            style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)',
                boxShadow: '0 8px 30px rgba(161,59,0,0.2)',
                color: 'var(--color-on-primary)',
            }}
        >
            {/* Decorative bus icon */}
            <div className="absolute -right-8 -top-8 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[140px]">directions_bus</span>
            </div>

            <div className="flex flex-col gap-2 z-10 text-left">
                <div className="flex items-center gap-3 flex-wrap">
                    <span
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{ backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}
                    >
                        Chuyến đi tiếp theo
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                        {nextTrip.date} • {nextTrip.departureTime}
                    </span>
                </div>

                <div className="flex items-center gap-3 mt-1">
                    <span className="text-xl font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {nextTrip.origin}
                    </span>
                    <span className="material-symbols-outlined text-2xl">arrow_right_alt</span>
                    <span className="text-xl font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {nextTrip.destination}
                    </span>
                </div>
                <p className="text-sm opacity-85">
                    {nextTrip.operator} &bull; {nextTrip.seatInfo}
                </p>
            </div>

            <button
                onClick={handleNavigateProfile}
                className="z-10 w-full md:w-auto px-6 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95 border-none cursor-pointer"
                style={{
                    backgroundColor: 'var(--color-surface-container-lowest)',
                    color: 'var(--color-primary)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
            >
                Xem chi tiết vé
            </button>
        </div>
    );
};
