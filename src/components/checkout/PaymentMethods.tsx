import React from 'react';

interface PaymentMethodsProps {
    paymentMethod: string;
    setPaymentMethod: (method: any) => void;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ paymentMethod, setPaymentMethod }) => {
    return (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_8px_20px_rgba(92,64,51,0.05)] relative overflow-hidden">
            <h2 className="text-xl font-bold text-on-surface mb-8 flex items-center gap-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="material-symbols-outlined text-primary font-bold">payments</span>
                Phương thức thanh toán
            </h2>

            <div className="space-y-4">
                {/* Momo */}
                <label className={`relative flex items-center p-5 border rounded-xl cursor-pointer hover:border-primary transition-colors bg-surface group ${
                    paymentMethod === 'momo' ? 'border-primary bg-surface-container-low ring-1 ring-primary' : 'border-outline-variant'
                }`}>
                    <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'momo'}
                        onChange={() => setPaymentMethod('momo')}
                        className="sr-only" 
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                        paymentMethod === 'momo' ? 'border-primary' : 'border-outline'
                    }`}>
                        {paymentMethod === 'momo' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <div className="flex-grow text-left">
                        <span className="text-base font-semibold text-on-surface block">Ví MoMo</span>
                        <span className="text-sm text-on-surface-variant block mt-0.5">Thanh toán nhanh chóng qua ứng dụng MoMo</span>
                    </div>
                    <span className="material-symbols-outlined text-primary text-[32px]">account_balance_wallet</span>
                </label>

                {/* VNPay */}
                <label className={`relative flex items-center p-5 border rounded-xl cursor-pointer hover:border-primary transition-colors bg-surface group ${
                    paymentMethod === 'vnpay' ? 'border-primary bg-surface-container-low ring-1 ring-primary' : 'border-outline-variant'
                }`}>
                    <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'vnpay'}
                        onChange={() => setPaymentMethod('vnpay')}
                        className="sr-only" 
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                        paymentMethod === 'vnpay' ? 'border-primary' : 'border-outline'
                    }`}>
                        {paymentMethod === 'vnpay' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <div className="flex-grow text-left">
                        <span className="text-base font-semibold text-on-surface block">VNPAY</span>
                        <span className="text-sm text-on-surface-variant block mt-0.5">Quét mã QR qua ứng dụng ngân hàng</span>
                    </div>
                    <span className="material-symbols-outlined text-primary text-[32px]">qr_code_scanner</span>
                </label>

                {/* Credit Card */}
                <label className={`relative flex items-center p-5 border rounded-xl cursor-pointer hover:border-primary transition-colors bg-surface group ${
                    paymentMethod === 'card' ? 'border-primary bg-surface-container-low ring-1 ring-primary' : 'border-outline-variant'
                }`}>
                    <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="sr-only" 
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                        paymentMethod === 'card' ? 'border-primary' : 'border-outline'
                    }`}>
                        {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <div className="flex-grow text-left">
                        <span className="text-base font-semibold text-on-surface block">Thẻ tín dụng / Ghi nợ</span>
                        <span className="text-sm text-on-surface-variant block mt-0.5">Visa, Mastercard, JCB</span>
                    </div>
                    <span className="material-symbols-outlined text-primary text-[32px]">credit_card</span>
                </label>
            </div>
        </section>
    );
};
