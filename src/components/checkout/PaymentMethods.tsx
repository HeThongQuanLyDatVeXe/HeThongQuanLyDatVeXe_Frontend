import React from 'react';

interface PaymentMethodsProps {
    paymentMethod: string;
    setPaymentMethod: (method: any) => void;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ paymentMethod, setPaymentMethod }) => {
    const isActive = paymentMethod === 'card' || true;
    const selectMethod = () => setPaymentMethod('card');

    return (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_8px_20px_rgba(92,64,51,0.05)] relative overflow-hidden">
            <h2 className="text-xl font-bold text-on-surface mb-8 flex items-center gap-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="material-symbols-outlined text-primary font-bold">payments</span>
                Phương thức thanh toán
            </h2>

            <div className="space-y-4">
                {/* PayOS Cổng thanh toán */}
                <label 
                    onClick={selectMethod}
                    className={`relative flex items-center p-5 border rounded-xl cursor-pointer transition-colors bg-surface group text-left ${
                        isActive ? 'border-primary bg-surface-container-low ring-1 ring-primary' : 'border-outline-variant'
                    }`}
                >
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 border-primary">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                    <div className="flex-grow text-left">
                        <span className="text-base font-semibold text-on-surface block">Cổng thanh toán PayOS</span>
                        <span className="text-sm text-on-surface-variant block mt-0.5">Quét mã QR liên ngân hàng nhanh chóng (VietQR), thẻ ATM, Visa, Mastercard</span>
                    </div>
                    <span className="material-symbols-outlined text-primary text-[32px]">qr_code_2</span>
                </label>
            </div>
        </section>
    );
};
