import React from 'react';
import { MagnifyingGlass, CalendarBlank } from '@phosphor-icons/react';

// Specialized SVG replacement for Material event_seat icon
const ArmchairConnectorIcon: React.FC = () => {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 256 256" 
            className="w-[38px] h-[38px]" 
            fill="currentColor"
        >
            <path d="M208,80H48a16,16,0,0,0-16,16v80a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm0,96H48V96H208v80ZM88,112a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,112Zm0,32a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,142Z" />
        </svg>
    );
};

export const HowItWorks: React.FC = () => {
    return (
        <section id="hanh-trinh" className="py-24 bg-surface relative overflow-hidden scroll-mt-20">
            <div className="max-w-[1200px] mx-auto px-6 md:px-8 text-center">
                <h2 className="font-headline-md text-3xl md:text-4xl text-on-surface font-bold mb-16 md:mb-20">
                    Hành trình 3 bước đơn giản
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10 lg:gap-20">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center relative group">
                        <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300 mb-8 relative z-10">
                            <MagnifyingGlass size={38} weight="bold" />
                        </div>
                        <h3 className="font-headline-md text-lg md:text-xl font-bold mb-4">Tìm chuyến xe</h3>
                        <p className="text-on-surface-variant max-w-xs text-sm leading-relaxed">
                            Chọn điểm xuất phát, điểm đến và thời gian mong muốn của bạn.
                        </p>
                        {/* Dashed Connector */}
                        <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 border-t-2 border-dashed border-primary/20 -z-0" />
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center relative group">
                        <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300 mb-8 relative z-10">
                            <ArmchairConnectorIcon />
                        </div>
                        <h3 className="font-headline-md text-lg md:text-xl font-bold mb-4">Chọn chỗ ngồi</h3>
                        <p className="text-on-surface-variant max-w-xs text-sm leading-relaxed">
                            Lựa chọn vị trí yêu thích trên sơ đồ xe trực quan và minh bạch.
                        </p>
                        {/* Dashed Connector */}
                        <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 border-t-2 border-dashed border-primary/20 -z-0" />
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center group">
                        <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300 mb-8 relative z-10">
                            <CalendarBlank size={38} weight="bold" />
                        </div>
                        <h3 className="font-headline-md text-lg md:text-xl font-bold mb-4">Thanh toán &amp; Nhận vé</h3>
                        <p className="text-on-surface-variant max-w-xs text-sm leading-relaxed">
                            Thanh toán linh hoạt và nhận vé điện tử qua Email/SMS tức thì.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
