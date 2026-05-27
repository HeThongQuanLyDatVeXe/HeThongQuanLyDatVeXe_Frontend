import React from 'react';

interface TicketBoxProps {
    details: {
        bookingCode: string;
        fullName: string;
        selectedSeats: string[];
        currentTrip: any;
    };
}

export const TicketBox: React.FC<TicketBoxProps> = ({ details }) => {
    return (
        <div className="w-full bg-surface-container-lowest border border-[#E8D5C4] rounded-xl shadow-[0_12px_40px_rgba(92,64,51,0.08)] overflow-hidden flex flex-col md:flex-row relative text-left">
            {/* Decorative side ticket cutouts */}
            <div className="absolute top-0 bottom-0 left-[66.666%] hidden md:block">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-background rounded-full border-b border-l border-[#E8D5C4] rotate-45"></div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-background rounded-full border-t border-l border-[#E8D5C4] -rotate-45"></div>
            </div>

            {/* LEFT STUB: Journey details */}
            <div className="p-8 md:w-2/3 flex flex-col gap-8">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-on-surface-variant tracking-wider uppercase mb-1">Mã Đặt Chỗ</p>
                        <p 
                            className="text-2xl font-bold text-primary tracking-tight"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            {details.bookingCode}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-on-surface-variant tracking-wider uppercase mb-1">Ngày Đi</p>
                        <p 
                            className="text-2xl font-bold text-on-surface"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            24 Thg 11, 2026
                        </p>
                    </div>
                </div>

                {/* Visual route container */}
                <div className="flex items-center gap-4 bg-surface-container-low p-6 rounded-lg border border-outline-variant/30">
                    <div className="flex-1">
                        <p 
                            className="text-xl font-bold text-on-surface"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            {details.currentTrip?.from || '—'}
                        </p>
                        <p className="text-sm text-on-surface-variant">Bến xe đón</p>
                        <p className="text-sm font-semibold text-primary mt-2">18:00</p>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center px-2 w-32 relative">
                        <div className="w-full h-0.5 bg-outline-variant absolute top-1/2 -translate-y-1/2 z-0"></div>
                        <span className="material-symbols-outlined text-primary bg-surface-container-low px-2 z-10 font-bold">directions_bus</span>
                        <p className="text-xs text-on-surface-variant mt-4 z-10 bg-surface-container-low px-1 font-semibold">
                            {details.currentTrip?.duration || '7 tiếng'}
                        </p>
                    </div>
                    
                    <div className="flex-1 text-right">
                        <p 
                            className="text-xl font-bold text-on-surface"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            {details.currentTrip?.to || '—'}
                        </p>
                        <p className="text-sm text-on-surface-variant">Bến xe khách</p>
                        <p className="text-sm font-semibold text-primary mt-2">01:30</p>
                    </div>
                </div>

                {/* Passenger list info */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-outline-variant/30">
                    <div>
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Hành Khách</p>
                        <p className="text-base text-on-surface font-semibold">{details.fullName}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Ghế Ngồi</p>
                        <p className="text-base text-on-surface font-semibold">{details.selectedSeats.join(', ')}</p>
                    </div>
                </div>
            </div>

            {/* RIGHT STUB: QR scan section */}
            <div className="md:w-1/3 bg-surface-container flex flex-col items-center justify-center p-8 relative border-t md:border-t-0 md:border-l border-dashed border-[#E8D5C4]">
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-outline-variant/20 mb-6">
                    <img 
                        alt="QR Code" 
                        className="w-32 h-32 object-contain" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCg8AOmBfm1IQuKrFov71uFptBSnjyeW3URHPCDckUhGuirhZg9Qy2GpEYm6gSSACnNi7rIuAtovQbzvCMa-jO_pmnI-VIJdxOhHWRDpVM9ywrszFa9H6_Y851-c5q8I3j2KGauo764vwQgTE-YY7zODA8UY3ILPVRvkB7byO_xurwiounRtUTUluqkPxBigsM-zwRqtcvZwdzneiIzvedi05ScO-LQ367JpR2c5cB-5km4Hygs5jRrNSQ7t-jR03a8bIVus0Iosd4" 
                    />
                </div>
                
                <p className="text-xs font-bold text-on-surface-variant text-center mb-2 uppercase tracking-wide">
                    Quét mã QR khi lên xe
                </p>
                <p className="text-sm text-on-surface font-semibold text-center bg-surface-container-lowest px-3 py-1 rounded-full border border-outline-variant/30 shadow-inner">
                    Biển số: {details.currentTrip?.id === '1' ? '29B-999.99' : '49B-123.45'}
                </p>
            </div>
        </div>
    );
};
