import React from 'react';
import { RoadHorizon, Users, Star, Timer, Headset } from '@phosphor-icons/react';
import { AnimatedCounter } from './AnimatedCounter';

export const TrustBar: React.FC = () => {
    return (
        <section className="py-16 bg-surface-container-low border-y border-outline-variant/30 select-none">
            <div className="max-w-[1200px] mx-auto px-6 md:px-8 grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 text-center">
                {/* Stat 1 */}
                <div className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-2">
                        <RoadHorizon size={28} />
                    </div>
                    <AnimatedCounter target={500} suffix="+" />
                    <span className="text-sm font-medium text-on-surface-variant">Tuyến đường</span>
                </div>

                {/* Stat 2 */}
                <div className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-2">
                        <Users size={28} />
                    </div>
                    <AnimatedCounter target={2000000} suffix="+" />
                    <span className="text-sm font-medium text-on-surface-variant">Khách hàng</span>
                </div>

                {/* Stat 3 */}
                <div className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-2">
                        <Star size={28} />
                    </div>
                    <span className="font-headline-lg text-primary font-bold">4.9★</span>
                    <span className="text-sm font-medium text-on-surface-variant">Đánh giá</span>
                </div>

                {/* Stat 4 */}
                <div className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-2">
                        <Timer size={28} />
                    </div>
                    <AnimatedCounter target={98} suffix="%" />
                    <span className="text-sm font-medium text-on-surface-variant">Đúng giờ</span>
                </div>

                {/* Stat 5 */}
                <div className="flex flex-col items-center gap-2 group col-span-2 lg:col-span-1">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-2">
                        <Headset size={28} />
                    </div>
                    <span className="font-headline-lg text-primary font-bold">24/7</span>
                    <span className="text-sm font-medium text-on-surface-variant">Hỗ trợ tận tâm</span>
                </div>
            </div>
        </section>
    );
};
