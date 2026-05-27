import React from 'react';
import { Star, Quotes } from '@phosphor-icons/react';

interface TestimonialsProps {
    testimonials: any[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
    return (
        <section className="py-24 bg-background">
            <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                <h2 
                    className="font-headline-md text-3xl md:text-4xl text-center mb-16 italic font-bold"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                >
                    Khách hàng nói về chúng tôi
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {testimonials.map((test, index) => (
                        <div 
                            key={index}
                            className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 flex flex-col gap-6 relative shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                        >
                            {/* Quotes symbol */}
                            <Quotes 
                                size={54} 
                                weight="fill" 
                                className="absolute top-6 right-6 text-primary/5 group-hover:text-primary/10 transition-colors duration-300 pointer-events-none" 
                            />

                            {/* Rating stars */}
                            <div className="flex text-secondary-container gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={14} 
                                        weight={i < test.stars ? 'fill' : 'regular'} 
                                        className={i < test.stars ? 'text-amber-500' : 'text-slate-200'}
                                    />
                                ))}
                            </div>

                            {/* Feedback */}
                            <p className="text-on-surface italic text-sm leading-relaxed">
                                "{test.content}"
                            </p>

                            {/* Author Info */}
                            <div className="mt-auto flex items-center gap-4 border-t border-slate-50 pt-4">
                                <img 
                                    alt={test.author} 
                                    src={test.avatar} 
                                    className="w-12 h-12 rounded-full object-cover select-none pointer-events-none"
                                />
                                <div>
                                    <h5 className="font-bold text-sm text-on-surface">{test.author}</h5>
                                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">{test.route}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
