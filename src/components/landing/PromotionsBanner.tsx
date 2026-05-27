import React from 'react';
import { CountdownTimer } from './CountdownTimer';

export const PromotionsBanner: React.FC = () => {
    return (
        <section id="khuyen-mai" className="py-24 bg-[#1A1410] relative overflow-hidden scroll-mt-20 select-none">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 skew-x-[-20deg] translate-x-1/2 pointer-events-none z-0" />
            <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                {/* Promo copy */}
                <div className="flex flex-col gap-6 max-w-xl text-left">
                    <span className="font-semibold text-xs tracking-widest bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full w-fit uppercase font-body" style={{ letterSpacing: '0.15em' }}>
                        Khuyến mãi cực hot
                    </span>
                    <h2 
                        className="font-headline-lg text-4xl md:text-5xl text-white italic font-bold leading-tight"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Ưu đãi hè rực rỡ 2026
                    </h2>
                    <p className="text-white/70 text-base md:text-lg leading-relaxed">
                        Giảm ngay 20% cho tất cả các tuyến đường miền Trung. Đặt vé ngay hôm nay để nhận ưu đãi có một không hai!
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2">
                        <button 
                            onClick={() => alert('Mã code: HE2026 đã được lưu!')}
                            className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all duration-300 cursor-pointer"
                        >
                            Lấy mã ngay
                        </button>
                        <button 
                            onClick={() => alert('Thông tin khuyến mãi: Áp dụng từ 01/06 đến 31/08/2026.')}
                            className="px-8 py-3.5 border border-white/20 hover:border-white text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-white/10 transition-all duration-300 cursor-pointer"
                        >
                            Xem chi tiết
                        </button>
                    </div>
                </div>

                {/* Countdown Clock Card */}
                <div className="flex flex-col items-center gap-6 bg-white/5 border border-white/10 p-8 md:p-10 rounded-[2rem] backdrop-blur-md">
                    <p className="text-white font-semibold text-xs tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
                        KẾT THÚC SAU
                    </p>
                    <CountdownTimer />
                </div>
            </div>
        </section>
    );
};
