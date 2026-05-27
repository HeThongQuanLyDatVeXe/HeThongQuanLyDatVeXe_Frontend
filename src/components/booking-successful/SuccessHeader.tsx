import React from 'react';

export const SuccessHeader: React.FC = () => {
    return (
        <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-container text-on-primary-container mb-4 shadow-[0_8px_30px_rgba(244,96,12,0.2)] animate-bounce">
                <span className="material-symbols-outlined text-5xl font-bold">check_circle</span>
            </div>
            <h1 
                className="text-4xl font-semibold text-primary italic"
                style={{ fontFamily: 'Playfair Display, serif' }}
            >
                Đặt vé thành công! Về nhà thôi 🧡
            </h1>
            <p className="text-base text-on-surface-variant max-w-md mx-auto">
                Chuyến xe của bạn đã được xác nhận. Chúng tôi đã gửi thông tin vé qua email và tin nhắn của bạn.
            </p>
        </div>
    );
};
