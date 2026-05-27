import React from 'react';
import { CaretDown } from '@phosphor-icons/react';

interface HeroSectionProps {
    handleScrollToSearch: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ handleScrollToSearch }) => {
    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background Video */}
            <div className="absolute inset-0 w-full h-full z-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover select-none pointer-events-none"
                    src="https://res.cloudinary.com/dtxmo5yo1/video/upload/v1778238353/vietnam4k-60fps_rdmtsd.mp4"
                />
                {/* Overlay Dark Gradation for high contrast */}
                <div className="absolute inset-0 hero-gradient-overlay" />
            </div>

            {/* Hero Title Container */}
            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
                <h1 
                    className="font-display-hero text-6xl md:text-[5.5rem] text-surface-container-lowest italic drop-shadow-2xl font-bold"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                >
                    Về nhà thôi.
                </h1>
                <p className="font-body text-surface-container-low max-w-2xl drop-shadow-md text-lg md:text-xl font-medium tracking-wide leading-relaxed">
                    Kết nối mọi nẻo đường, mang hơi ấm gia đình đến gần hơn.
                </p>
            </div>

            {/* Animated Scroll indicator */}
            <button 
                onClick={handleScrollToSearch}
                className="absolute bottom-36 md:bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors animate-bounce-slow z-20 cursor-pointer"
            >
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ letterSpacing: '0.15em' }}>
                    Cuộn để khám phá
                </span>
                <CaretDown size={20} />
            </button>
        </section>
    );
};
