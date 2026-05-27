import React from 'react';
import { ROUTES } from '../constants/routes';
import { useSeatSelectionPage } from '../hooks/pages/useSeatSelectionPage';

// Components
import { SeatSelectionHeader } from '../components/seat-selection/SeatSelectionHeader';
import { TripSummarySidebar } from '../components/seat-selection/TripSummarySidebar';
import { SeatMapDiagram } from '../components/seat-selection/SeatMapDiagram';
import { SeatSelectionBottomBar } from '../components/seat-selection/SeatSelectionBottomBar';

export const SeatSelectionPage: React.FC = () => {
    const {
        navigate,
        ct,
        loadingTrip,
        seatMap,
        soldSeats,
        loadingSeats,
        selectedSeats,
        activeDeck,
        setActiveDeck,
        handleSeatClick,
        handleContinue
    } = useSeatSelectionPage();

    if (loadingTrip) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!ct) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
                <span className="material-symbols-outlined text-6xl text-outline">error_outline</span>
                <h2 className="text-xl font-bold text-on-surface">Không tìm thấy thông tin chuyến đi</h2>
                <button onClick={() => navigate(ROUTES.ROUTES)} className="px-6 py-2 bg-primary text-on-primary rounded-xl cursor-pointer">
                    Quay lại tuyến đường
                </button>
            </div>
        );
    }

    const price = Number(ct.price) || 0;

    // Derived state for the diagram
    const lowerDeckSeats = seatMap.filter(s => s.floor === 1 || s.seatNumber.startsWith('A'));
    const upperDeckSeats = seatMap.filter(s => s.floor === 2 || s.seatNumber.startsWith('B'));
    const currentDeckSeats = activeDeck === 'lower' ? lowerDeckSeats : upperDeckSeats;
    const hasMultipleDecks = upperDeckSeats.length > 0;
    const hasSeatPositionInfo = currentDeckSeats.some(s => s.rowNumber > 0 && s.columnNumber > 0);

    return (
        <div className="min-h-screen bg-background text-on-background font-body-md antialiased noise-bg relative pb-32">
            <div className="grain-overlay" />

            {/* Top Navigation */}
            <SeatSelectionHeader 
                onNavigateHome={() => navigate(ROUTES.HOME)} 
                onCancel={() => navigate(`/tuyen-duong/${ct.id}`)} 
            />

            {/* Main Content Layout */}
            <main className="pt-32 max-w-[1200px] mx-auto px-8 w-full flex flex-col md:flex-row gap-lg">
                
                {/* LEFT COLUMN: Summary (Sticky) */}
                <TripSummarySidebar 
                    ct={ct} 
                    selectedSeats={selectedSeats} 
                />

                {/* CENTER COLUMN: Bus seat diagram */}
                <SeatMapDiagram
                    vehicleType={ct.vehicleType}
                    loadingSeats={loadingSeats}
                    seatMap={seatMap}
                    soldSeats={soldSeats}
                    selectedSeats={selectedSeats}
                    handleSeatClick={handleSeatClick}
                    activeDeck={activeDeck}
                    setActiveDeck={setActiveDeck}
                    lowerDeckSeats={lowerDeckSeats}
                    upperDeckSeats={upperDeckSeats}
                    currentDeckSeats={currentDeckSeats}
                    hasMultipleDecks={hasMultipleDecks}
                    hasSeatPositionInfo={hasSeatPositionInfo}
                />
            </main>

            {/* BOTTOM STICKY BAR */}
            <SeatSelectionBottomBar 
                selectedSeats={selectedSeats} 
                price={price} 
                handleContinue={handleContinue} 
            />
        </div>
    );
};
