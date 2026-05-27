import React from 'react';

interface SeatSelectionHeaderProps {
    onNavigateHome: () => void;
    onCancel: () => void;
}

export const SeatSelectionHeader: React.FC<SeatSelectionHeaderProps> = ({ onNavigateHome, onCancel }) => {
    return (
        <header className="fixed top-0 w-full z-50 bg-[#FFF4ED]/90 backdrop-blur-md border-b border-[#E8D5C4] shadow-[0_4px_20px_rgba(92,64,51,0.05)] transition-all duration-300">
            <div className="flex justify-between items-center px-8 py-4 max-w-[1200px] mx-auto w-full">
                <div 
                    onClick={onNavigateHome}
                    className="text-2xl font-bold text-[#F4600C] cursor-pointer"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                >
                    Đi Về Nhà
                </div>
                <button 
                    onClick={onCancel}
                    className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none font-bold text-sm tracking-wider uppercase"
                >
                    <span>Hủy & Quay Lại</span>
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>
        </header>
    );
};
