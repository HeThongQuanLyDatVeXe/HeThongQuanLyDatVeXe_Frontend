import React from 'react';
import { ShieldCheck, Lightning, WifiHigh, ArrowsClockwise } from '@phosphor-icons/react';

export const WhyChooseUs: React.FC = () => {
    return (
        <section id="tien-ich" className="py-24 bg-surface-container-low scroll-mt-20">
            <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-headline-md text-3xl md:text-4xl text-on-surface font-bold mb-4">
                        Tại sao chọn Đi Về Nhà?
                    </h2>
                    <p className="text-on-surface-variant max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                        Chúng tôi không chỉ bán vé xe, chúng tôi trao đi sự an tâm và niềm hạnh phúc khi trở về nhà.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {/* Card 1 */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/30 flex flex-col gap-5 group">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                            <ShieldCheck size={28} />
                        </div>
                        <h4 className="font-headline-md text-lg font-bold">An toàn tuyệt đối</h4>
                        <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                            Đội ngũ tài xế kinh nghiệm và quy trình bảo trì xe định kỳ khắt khe.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-surface-container p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/30 flex flex-col gap-5 group">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                            <Lightning size={28} />
                        </div>
                        <h4 className="font-headline-md text-lg font-bold">Tốc độ &amp; Đúng giờ</h4>
                        <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                            Cam kết khởi hành và đến nơi đúng khung giờ đã đặt trước.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/30 flex flex-col gap-5 group">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                            <WifiHigh size={28} />
                        </div>
                        <h4 className="font-headline-md text-lg font-bold">Tiện nghi cao cấp</h4>
                        <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                            Wifi miễn phí, nước uống, khăn lạnh và ghế massage hiện đại.
                        </p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-surface-container p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/30 flex flex-col gap-5 group">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                            <ArrowsClockwise size={28} />
                        </div>
                        <h4 className="font-headline-md text-lg font-bold">Linh hoạt đổi trả</h4>
                        <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                            Hỗ trợ đổi trả vé nhanh chóng trong 24h trước giờ khởi hành.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
