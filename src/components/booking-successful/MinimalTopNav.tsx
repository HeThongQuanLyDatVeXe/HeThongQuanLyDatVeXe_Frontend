import React from 'react';

interface MinimalTopNavProps {
    onNavigateHome: () => void;
}

export const MinimalTopNav: React.FC<MinimalTopNavProps> = ({ onNavigateHome }) => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-[#FFF4ED]/90 backdrop-blur-md border-b border-[#E8D5C4] shadow-[0_4px_20px_rgba(92,64,51,0.05)]">
            <div className="flex justify-between items-center px-8 py-4 max-w-[1200px] mx-auto w-full">
                <div 
                    onClick={onNavigateHome}
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
    );
};
