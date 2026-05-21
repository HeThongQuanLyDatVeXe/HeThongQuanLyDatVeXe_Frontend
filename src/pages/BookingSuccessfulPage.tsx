import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

interface SuccessfulState {
    bookingCode: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    selectedSeats: string[];
    currentRoute: any;
    totalPaid: number;
}

export const BookingSuccessfulPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Recover transaction details from state
    const passedState = location.state as SuccessfulState | null;

    // Default route/details fallback in case of direct URL access
    const defaultDetails = {
        bookingCode: 'DVN-8A2F9',
        fullName: 'Nguyễn Văn A',
        phoneNumber: '0987654321',
        email: 'nguyen.vana@gmail.com',
        selectedSeats: ['A12', 'A13'],
        totalPaid: 650000,
        currentRoute: {
            id: 'default',
            from: 'Sài Gòn',
            to: 'Đà Lạt',
            duration: '8h 30m',
            price: 350000,
            operator: 'Phương Trang',
            vehicleType: 'Limousine 22 phòng nằm'
        }
    };

    const details = passedState || defaultDetails;

    // Custom CSS style block inside component to simulate dashed divider
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleDownloadPDF = () => {
        alert('Tải vé PDF thành công! Vui lòng kiểm tra thư mục Download trên thiết bị của bạn.');
    };

    return (
        <div className="min-h-screen bg-background text-on-background noise-bg relative flex flex-col font-body-md pb-16">
            {/* Grain Overlay */}
            <div className="grain-overlay" />

            {/* Minimal Transactional Top Nav */}
            <nav className="fixed top-0 w-full z-50 bg-[#FFF4ED]/90 backdrop-blur-md border-b border-[#E8D5C4] shadow-[0_4px_20px_rgba(92,64,51,0.05)]">
                <div className="flex justify-between items-center px-8 py-4 max-w-[1200px] mx-auto w-full">
                    <div 
                        onClick={() => navigate(ROUTES.HOME)}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <span 
                            className="text-2xl font-bold text-[#F4600C]"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Đi Về Nhà
                        </span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow pt-32 pb-24 px-8 flex flex-col items-center justify-center">
                <div className="max-w-[800px] w-full flex flex-col items-center gap-12">
                    
                    {/* Success Header Message */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-container text-on-primary-container mb-4 shadow-[0_8px_30px_rgba(244,96,12,0.2)] animate-bounce">
                            <span className="material-symbols-outlined text-5xl font-bold">check_circle</span>
                        </div>
                        <h1 
                            className="text-4xl font-semibold text-primary italic"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Đặt vé thành công! Về nhà thôi 🧡
                        </h1>
                        <p className="text-base text-on-surface-variant max-w-md mx-auto">
                            Chuyến xe của bạn đã được xác nhận. Chúng tôi đã gửi thông tin vé qua email và tin nhắn của bạn.
                        </p>
                    </div>

                    {/* Bento Ticket Box */}
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
                                        {details.currentRoute.from}
                                    </p>
                                    <p className="text-sm text-on-surface-variant">Bến xe đón</p>
                                    <p className="text-sm font-semibold text-primary mt-2">18:00</p>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center px-2 w-32 relative">
                                    <div className="w-full h-0.5 bg-outline-variant absolute top-1/2 -translate-y-1/2 z-0"></div>
                                    <span className="material-symbols-outlined text-primary bg-surface-container-low px-2 z-10 font-bold">directions_bus</span>
                                    <p className="text-xs text-on-surface-variant mt-4 z-10 bg-surface-container-low px-1 font-semibold">
                                        {details.currentRoute.duration || '7 tiếng'}
                                    </p>
                                </div>
                                
                                <div className="flex-1 text-right">
                                    <p 
                                        className="text-xl font-bold text-on-surface"
                                        style={{ fontFamily: 'Playfair Display, serif' }}
                                    >
                                        {details.currentRoute.to}
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
                                Biển số: {details.currentRoute.id === '1' ? '29B-999.99' : '49B-123.45'}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
                        <button 
                            onClick={handleDownloadPDF}
                            className="px-8 py-4 rounded-xl border border-primary text-primary font-bold hover:bg-primary-container/10 transition-colors flex items-center justify-center gap-2 cursor-pointer bg-transparent text-base"
                        >
                            <span className="material-symbols-outlined">download</span>
                            Tải vé PDF
                        </button>
                        <button 
                            onClick={() => navigate(ROUTES.HOME)}
                            className="px-8 py-4 rounded-xl bg-primary text-on-primary font-bold hover:bg-[#c84d04] transition-colors shadow-[0_4px_12px_rgba(161,59,0,0.3)] flex items-center justify-center gap-2 cursor-pointer border-none text-base"
                        >
                            <span className="material-symbols-outlined">home</span>
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer minimal */}
            <footer className="bg-[#1A1410] w-full py-8 mt-auto">
                <div className="max-w-[1200px] mx-auto px-8 flex justify-center items-center">
                    <p className="text-white/60 text-sm">© 2026 Đi Về Nhà. Mang yêu thương về với gia đình.</p>
                </div>
            </footer>
        </div>
    );
};
