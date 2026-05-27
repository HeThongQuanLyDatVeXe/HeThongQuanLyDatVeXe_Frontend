import React from 'react';

const formatTime = (isoString?: string) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatShortDate = (isoString?: string) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

interface TripSummarySidebarProps {
    ct: any;
    selectedSeats: string[];
}

export const TripSummarySidebar: React.FC<TripSummarySidebarProps> = ({ ct, selectedSeats }) => {
    return (
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
    );
};
