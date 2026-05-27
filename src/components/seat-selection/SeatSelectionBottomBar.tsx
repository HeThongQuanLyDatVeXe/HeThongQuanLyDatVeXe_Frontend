import React from 'react';

interface SeatSelectionBottomBarProps {
    selectedSeats: string[];
    price: number;
    handleContinue: () => void;
}

export const SeatSelectionBottomBar: React.FC<SeatSelectionBottomBarProps> = ({ selectedSeats, price, handleContinue }) => {
    return (
        <div className="fixed bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_20px_rgba(92,64,51,0.1)] p-4 md:p-6 z-40">
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                    <p className="text-base text-on-surface-variant">
                        Bạn đã chọn: <span className="font-semibold text-on-surface">{selectedSeats.length} ghế</span> 
                        {selectedSeats.length > 0 && ` (${selectedSeats.join(', ')})`}
                    </p>
                    <p className="text-2xl font-bold text-primary mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Tổng: {(price * selectedSeats.length).toLocaleString()}₫
                    </p>
                </div>
                
                <button 
                    onClick={handleContinue}
                    disabled={selectedSeats.length === 0}
                    className="w-full md:w-auto bg-primary text-on-primary font-semibold text-base py-4 px-12 rounded-xl hover:bg-[#c84d04] shadow-[0_4px_12px_rgba(161,59,0,0.3)] hover:shadow-[0_6px_18px_rgba(161,59,0,0.4)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border-none uppercase tracking-wider disabled:bg-surface-container-highest disabled:text-outline disabled:cursor-not-allowed"
                >
                    <span>Tiếp tục</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};
