import React, { useState, useEffect, useRef } from 'react';

export const AnimatedCounter: React.FC<{ target: number; suffix?: string }> = ({ target, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const elementRef = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    let startTimestamp: number | null = null;
                    const duration = 1500; // 1.5 seconds

                    const step = (timestamp: number) => {
                        if (!startTimestamp) startTimestamp = timestamp;
                        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                        // Ease-out quad formula
                        const easeProgress = progress * (2 - progress);
                        setCount(Math.floor(easeProgress * target));
                        
                        if (progress < 1) {
                            window.requestAnimationFrame(step);
                        } else {
                            setCount(target);
                        }
                    };

                    window.requestAnimationFrame(step);
                }
            },
            { threshold: 0.2 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, [target]);

    return (
        <span ref={elementRef} className="font-headline-lg text-primary select-none font-bold">
            {count.toLocaleString()}{suffix}
        </span>
    );
};
