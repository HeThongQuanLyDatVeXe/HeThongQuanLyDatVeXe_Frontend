import React from 'react';

interface BookingPaymentMethodsProps {
    paymentOptions: any[];
    paymentMethod: string;
    setPaymentMethod: (val: any) => void;
}

export const BookingPaymentMethods: React.FC<BookingPaymentMethodsProps> = ({ paymentOptions, paymentMethod, setPaymentMethod }) => {
    return (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_8px_20px_rgba(92,64,51,0.05)]">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">3</div>
                <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'Playfair Display, serif' }}>Phương thức thanh toán</h2>
            </div>
            <div className="space-y-4">
                {paymentOptions.map(opt => (
                    <label key={opt.key} className={`flex items-center p-5 border rounded-xl cursor-pointer hover:border-primary transition-all bg-surface group ${paymentMethod === opt.key ? 'border-primary bg-surface-container-low ring-1 ring-primary' : 'border-outline-variant'}`}>
                        <input type="radio" name="payment" checked={paymentMethod === opt.key} onChange={() => setPaymentMethod(opt.key)} className="sr-only" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${paymentMethod === opt.key ? 'border-primary' : 'border-outline'}`}>
                            {paymentMethod === opt.key && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <div className="flex-grow text-left">
                            <span className="text-base font-semibold text-on-surface block">{opt.label}</span>
                            <span className="text-sm text-on-surface-variant block mt-0.5">{opt.desc}</span>
                        </div>
                        <span className="material-symbols-outlined text-primary text-[32px]">{opt.icon}</span>
                    </label>
                ))}
            </div>
        </section>
    );
};
