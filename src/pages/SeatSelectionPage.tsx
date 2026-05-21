import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { mockRoutes } from './RoutesPage';
import { ROUTES } from '../constants/routes';

export const SeatSelectionPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Recover passengers count if passed from previous page
    const passedState = location.state as { passengers?: number } | null;
    const initialSeatsCount = passedState?.passengers || 2;

    // Find the route
    const route = mockRoutes.find((r) => r.id === id);
    const defaultRoute = {
        id: 'default',
        from: 'Sài Gòn',
        to: 'Đà Lạt',
        duration: '7 tiếng di chuyển',
        price: 420000,
        operator: 'Phương Trang',
        vehicleType: 'Giường nằm VIP 34 chỗ'
    };
    const currentRoute = route 
        ? {
            ...route,
            operator: 'Phương Trang',
            vehicleType: 'Giường nằm VIP 34 chỗ'
          }
        : defaultRoute;

    // State for selected seats
    // We can pre-select A12 and A13 to match the template default, but make it fully interactive!
    const [selectedSeats, setSelectedSeats] = useState<string[]>(['A12', 'A13']);
    const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');

    // Scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Set of sold seats
    const soldSeats = new Set<string>([
        'A01', 'A03', 'A15', // Lower deck sold
        'B04', 'B10', 'B16'  // Upper deck sold
    ]);

    const handleSeatClick = (seatCode: string) => {
        if (soldSeats.has(seatCode)) return; // Don't allow selecting sold seats

        setSelectedSeats((prev) => {
            if (prev.includes(seatCode)) {
                return prev.filter((s) => s !== seatCode);
            } else {
                return [...prev, seatCode];
            }
        });
    };

    const handleContinue = () => {
        if (selectedSeats.length === 0) {
            alert('Vui lòng chọn ít nhất một ghế ngồi để tiếp tục!');
            return;
        }
        navigate(`/tuyen-duong/${currentRoute.id}/thanh-toan`, {
            state: {
                selectedSeats,
                currentRoute,
                totalAmount: currentRoute.price * selectedSeats.length
            }
        });
    };

    const renderSeatButton = (seatCode: string) => {
        const isSold = soldSeats.has(seatCode);
        const isSelected = selectedSeats.includes(seatCode);

        if (isSold) {
            return (
                <button
                    disabled
                    className="w-16 h-20 rounded-xl bg-surface-variant flex flex-col items-center justify-center cursor-not-allowed opacity-70 border border-transparent"
                >
                    <span className="material-symbols-outlined text-on-surface-variant text-sm mb-1">bed</span>
                    <span className="font-body-md text-xs font-semibold text-on-surface-variant">{seatCode}</span>
                </button>
            );
        }

        if (isSelected) {
            return (
                <button
                    onClick={() => handleSeatClick(seatCode)}
                    className="w-16 h-20 rounded-xl bg-primary shadow-[0_4px_12px_rgba(161,59,0,0.3)] transition-all flex flex-col items-center justify-center ring-2 ring-primary ring-offset-2 ring-offset-surface cursor-pointer"
                >
                    <span className="material-symbols-outlined text-on-primary text-sm mb-1">bed</span>
                    <span className="font-body-md text-xs font-bold text-on-primary">{seatCode}</span>
                </button>
            );
        }

        return (
            <button
                onClick={() => handleSeatClick(seatCode)}
                className="w-16 h-20 rounded-xl border-2 border-outline-variant bg-surface-container-lowest hover:border-primary hover:shadow-[0_4px_12px_rgba(161,59,0,0.2)] transition-all flex flex-col items-center justify-center cursor-pointer"
            >
                <span className="material-symbols-outlined text-outline text-sm mb-1">bed</span>
                <span className="font-body-md text-xs font-semibold text-on-surface">{seatCode}</span>
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-background text-on-background font-body-md antialiased noise-bg relative pb-32">
            {/* Grain/Noise Overlay */}
            <div className="grain-overlay" />

            {/* Top Navigation */}
            <header className="fixed top-0 w-full z-50 bg-[#FFF4ED]/90 backdrop-blur-md border-b border-[#E8D5C4] shadow-[0_4px_20px_rgba(92,64,51,0.05)] transition-all duration-300">
                <div className="flex justify-between items-center px-8 py-4 max-w-[1200px] mx-auto w-full">
                    <div 
                        onClick={() => navigate(ROUTES.HOME)}
                        className="text-2xl font-bold text-[#F4600C] cursor-pointer"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Đi Về Nhà
                    </div>
                    <button 
                        onClick={() => navigate(`/tuyen-duong/${currentRoute.id}`)}
                        className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none font-bold text-sm tracking-wider uppercase"
                    >
                        <span>Hủy & Quay Lại</span>
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </header>

            {/* Main Content Layout */}
            <main className="pt-32 max-w-[1200px] mx-auto px-8 w-full flex flex-col md:flex-row gap-lg">
                
                {/* LEFT COLUMN: Summary (Sticky) */}
                <aside className="w-full md:w-1/3 md:sticky md:top-32 h-fit space-y-md text-left">
                    {/* Trip details card */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-[0_8px_20px_rgba(92,64,51,0.05)]">
                        <h2 className="text-xl font-bold text-primary mb-md" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Chi Tiết Chuyến Đi
                        </h2>
                        
                        <div className="flex flex-col gap-sm relative">
                            {/* Dash Line */}
                            <div className="absolute left-3 top-6 bottom-6 w-px border-l-2 border-dashed border-outline-variant z-0"></div>
                            
                            {/* Source */}
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-6 h-6 rounded-full bg-surface-container-highest border-2 border-primary flex items-center justify-center mt-1">
                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">{currentRoute.from} - BẾN XE ĐÓN</p>
                                    <p className="text-lg text-on-surface font-semibold">18:00 • T6, 24 Th11</p>
                                </div>
                            </div>
                            
                            {/* Destination */}
                            <div className="flex items-start gap-4 relative z-10 mt-4">
                                <div className="w-6 h-6 rounded-full bg-surface-container-highest border-2 border-tertiary-container flex items-center justify-center mt-1">
                                    <span className="material-symbols-outlined text-[14px] text-tertiary-container font-bold">location_on</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">{currentRoute.to} - BẾN XE ĐẾN</p>
                                    <p className="text-lg text-on-surface font-semibold">01:00 • T7, 25 Th11</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-outline-variant w-full my-md"></div>
                        
                        {/* Operator */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-surface-container-high p-1 border border-outline-variant flex items-center justify-center overflow-hidden">
                                <img 
                                    alt="Operator Logo" 
                                    className="w-full h-full object-cover" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuEB2Q-JwrrQERd-PuDRc2EIgr2fGvsL0Vecrvw-Hefzu9ghwAns0PYBbO3NUGErTlTJdTFTUKr3du6IerDV6dF5IEs0FoNLC42IDq8Nj3qPMkcT8WCc5wpGWpYyprh713Ppqj0ATOdxtMVW586uzGAsQkQn655dyzTndrV0yJOySEE21Fvnk6_3oYWy12wSRrwFBLcrDK8LMZhg5Ni5DANAkih_YPW4MVQIKsVHpVajP50aG8NB3x7Xg9DUkY_JmyJOp1-hV77NU" 
                                />
                            </div>
                            <div>
                                <p className="text-base font-semibold text-on-surface">{currentRoute.operator}</p>
                                <p className="text-sm text-on-surface-variant">{currentRoute.vehicleType}</p>
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

                {/* CENTER COLUMN: Bus seat diagram */}
                <section className="w-full md:w-2/3 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col items-center shadow-[0_8px_20px_rgba(92,64,51,0.05)]">
                    <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Chọn Chỗ Ngồi
                    </h1>
                    <p className="text-sm text-on-surface-variant text-center mb-lg">
                        {activeDeck === 'lower' ? 'Tầng Dưới' : 'Tầng Trên'} • Giường Nằm VIP
                    </p>
                    
                    {/* Legend info */}
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

                    {/* Bus layout outline */}
                    <div className="relative border-4 border-outline-variant rounded-[40px] rounded-t-[80px] p-8 w-full max-w-sm mx-auto bg-surface">
                        {/* Steering wheel */}
                        <div className="flex justify-start mb-8 opacity-50">
                            <span className="material-symbols-outlined text-on-surface-variant text-2xl">radio_button_unchecked</span>
                        </div>

                        {/* Seat grids (3 columns: Left, Aisle, Right) */}
                        <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                            {/* Generate dynamic seat map rows depending on active deck */}
                            {activeDeck === 'lower' ? (
                                <>
                                    {/* Row 1 */}
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('A01')}</div>
                                    <div className="col-span-1"></div> {/* Aisle */}
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('A02')}</div>

                                    {/* Row 2 */}
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('A03')}</div>
                                    <div className="col-span-1"></div>
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('A04')}</div>

                                    {/* Row 3 */}
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('A05')}</div>
                                    <div className="col-span-1"></div>
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('A06')}</div>

                                    {/* Row 4 */}
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('A07')}</div>
                                    <div className="col-span-1"></div>
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('A08')}</div>

                                    {/* Row 5 */}
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('A12')}</div>
                                    <div className="col-span-1"></div>
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('A13')}</div>

                                    {/* Row 6 (Full Width Back) */}
                                    <div className="col-span-3 grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-dashed border-outline-variant">
                                        {['A14', 'A15', 'A16', 'A17', 'A18'].map((seat) => (
                                            <div key={seat} className="col-span-1 h-20 flex justify-center">
                                                {/* Mini custom render since width differs */}
                                                {soldSeats.has(seat) ? (
                                                    <button disabled className="w-full h-full rounded-xl bg-surface-variant flex flex-col items-center justify-center opacity-70">
                                                        <span className="font-body-md text-[10px] font-semibold text-on-surface-variant">{seat}</span>
                                                    </button>
                                                ) : selectedSeats.includes(seat) ? (
                                                    <button onClick={() => handleSeatClick(seat)} className="w-full h-full rounded-xl bg-primary text-on-primary flex flex-col items-center justify-center cursor-pointer font-bold text-[10px] ring-2 ring-primary ring-offset-2 ring-offset-surface">
                                                        {seat}
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleSeatClick(seat)} className="w-full h-full rounded-xl border-2 border-outline-variant bg-surface-container-lowest flex flex-col items-center justify-center cursor-pointer text-on-surface font-semibold text-[10px] hover:border-primary">
                                                        {seat}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Upper Deck (B-series seats) */}
                                    {/* Row 1 */}
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('B01')}</div>
                                    <div className="col-span-1"></div>
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('B02')}</div>

                                    {/* Row 2 */}
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('B03')}</div>
                                    <div className="col-span-1"></div>
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('B04')}</div>

                                    {/* Row 3 */}
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('B05')}</div>
                                    <div className="col-span-1"></div>
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('B06')}</div>

                                    {/* Row 4 */}
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('B07')}</div>
                                    <div className="col-span-1"></div>
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('B08')}</div>

                                    {/* Row 5 */}
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('B12')}</div>
                                    <div className="col-span-1"></div>
                                    <div className="col-span-1 flex justify-center">{renderSeatButton('B13')}</div>

                                    {/* Row 6 (Full Width Back) */}
                                    <div className="col-span-3 grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-dashed border-outline-variant">
                                        {['B14', 'B15', 'B16', 'B17', 'B18'].map((seat) => (
                                            <div key={seat} className="col-span-1 h-20 flex justify-center">
                                                {soldSeats.has(seat) ? (
                                                    <button disabled className="w-full h-full rounded-xl bg-surface-variant flex flex-col items-center justify-center opacity-70">
                                                        <span className="font-body-md text-[10px] font-semibold text-on-surface-variant">{seat}</span>
                                                    </button>
                                                ) : selectedSeats.includes(seat) ? (
                                                    <button onClick={() => handleSeatClick(seat)} className="w-full h-full rounded-xl bg-primary text-on-primary flex flex-col items-center justify-center cursor-pointer font-bold text-[10px] ring-2 ring-primary ring-offset-2 ring-offset-surface">
                                                        {seat}
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleSeatClick(seat)} className="w-full h-full rounded-xl border-2 border-outline-variant bg-surface-container-lowest flex flex-col items-center justify-center cursor-pointer text-on-surface font-semibold text-[10px] hover:border-primary">
                                                        {seat}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Deck selections */}
                    <div className="mt-8 flex gap-4">
                        <button 
                            onClick={() => setActiveDeck('lower')}
                            className={`px-6 py-2 border rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                                activeDeck === 'lower' 
                                    ? 'border-outline text-on-surface bg-surface-container-high shadow-inner' 
                                    : 'border-transparent text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                        >
                            Tầng Dưới
                        </button>
                        <button 
                            onClick={() => setActiveDeck('upper')}
                            className={`px-6 py-2 border rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                                activeDeck === 'upper' 
                                    ? 'border-outline text-on-surface bg-surface-container-high shadow-inner' 
                                    : 'border-transparent text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                        >
                            Tầng Trên
                        </button>
                    </div>
                </section>
            </main>

            {/* BOTTOM STICKY BAR */}
            <div className="fixed bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_20px_rgba(92,64,51,0.1)] p-4 md:p-6 z-40">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-base text-on-surface-variant">
                            Bạn đã chọn: <span className="font-semibold text-on-surface">{selectedSeats.length} ghế</span> 
                            {selectedSeats.length > 0 && ` (${selectedSeats.join(', ')})`}
                        </p>
                        <p className="text-2xl font-bold text-primary mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Tổng: {(currentRoute.price * selectedSeats.length).toLocaleString()}₫
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleContinue}
                        className="w-full md:w-auto bg-primary text-on-primary font-semibold text-base py-4 px-12 rounded-xl hover:bg-[#c84d04] shadow-[0_4px_12px_rgba(161,59,0,0.3)] hover:shadow-[0_6px_18px_rgba(161,59,0,0.4)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border-none uppercase tracking-wider"
                    >
                        <span>Tiếp tục</span>
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
