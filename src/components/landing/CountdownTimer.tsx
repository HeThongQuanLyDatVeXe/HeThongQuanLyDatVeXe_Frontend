import React, { useState, useEffect } from 'react';

export const CountdownTimer: React.FC = () => {
    const [targetTime] = useState(() => {
        const saved = localStorage.getItem('divenha_promo_countdown');
        if (saved) {
            const parsed = parseInt(saved, 10);
            if (parsed > Date.now()) return parsed;
        }
        const newTarget = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
        localStorage.setItem('divenha_promo_countdown', newTarget.toString());
        return newTarget;
    });

    const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const updateCountdown = () => {
            const now = Date.now();
            const distance = targetTime - now;

            if (distance <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [targetTime]);

    return (
        <div className="flex gap-4 md:gap-6" id="countdown">
            <div className="flex flex-col items-center">
                <span className="text-4xl md:text-6xl font-serif text-primary font-bold">
                    {timeLeft.days.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] md:text-xs text-white/50 font-label-caps uppercase tracking-wider mt-1">Ngày</span>
            </div>
            <div className="text-3xl md:text-5xl text-white/20 select-none">:</div>
            <div className="flex flex-col items-center">
                <span className="text-4xl md:text-6xl font-serif text-primary font-bold">
                    {timeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] md:text-xs text-white/50 font-label-caps uppercase tracking-wider mt-1">Giờ</span>
            </div>
            <div className="text-3xl md:text-5xl text-white/20 select-none">:</div>
            <div className="flex flex-col items-center">
                <span className="text-4xl md:text-6xl font-serif text-primary font-bold">
                    {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] md:text-xs text-white/50 font-label-caps uppercase tracking-wider mt-1">Phút</span>
            </div>
            <div className="text-3xl md:text-5xl text-white/20 select-none">:</div>
            <div className="flex flex-col items-center">
                <span className="text-4xl md:text-6xl font-serif text-primary font-bold">
                    {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] md:text-xs text-white/50 font-label-caps uppercase tracking-wider mt-1">Giây</span>
            </div>
        </div>
    );
};
