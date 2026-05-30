import React from 'react';

interface CheckoutSummaryProps {
    currentTrip: any;
    selectedSeats: string[];
    baseTotal: number;
    promoInput: string;
    setPromoInput: (val: string) => void;
    handleApplyPromo: () => void;
    promoMessage: { isError: boolean; text: string } | null;
    appliedDiscount: number;
    handleCheckout?: (e?: React.FormEvent) => void;
    isProcessing?: boolean;
    buttonText?: string;
    showButton?: boolean;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
    currentTrip,
    selectedSeats,
    baseTotal,
    promoInput,
    setPromoInput,
    handleApplyPromo,
    promoMessage,
    appliedDiscount,
    handleCheckout = () => {},
    isProcessing = false,
    buttonText,
    showButton = true
}) => {
    const fromCity = currentTrip?.from || currentTrip?.route?.originCityName || '—';
    const toCity = currentTrip?.to || currentTrip?.route?.destinationCityName || '—';
    const vehType = currentTrip?.vehicleType || currentTrip?.vehicle?.vehicleTypeName || 'Giường nằm';
    const tripPrice = currentTrip?.price ?? (currentTrip?.prices?.[0]?.finalPrice ?? currentTrip?.prices?.[0]?.basePrice ?? 200000);

    return (
        <div className="sticky top-[120px] bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_12px_32px_rgba(92,64,51,0.1)] relative overflow-hidden flex flex-col h-full text-left">
            <h3 className="text-lg font-bold text-on-surface mb-6 border-b border-outline-variant pb-4 border-dashed relative z-10" style={{ fontFamily: 'Playfair Display, serif' }}>
                Tóm tắt chuyến đi
            </h3>

            <div className="space-y-6 flex-grow relative z-10">
                {/* Route details */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">{fromCity}</span>
                        <span className="material-symbols-outlined text-outline text-[18px]">arrow_right_alt</span>
                        <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">{toCity}</span>
                    </div>
                    <div className="text-base font-semibold text-on-surface">{vehType}</div>
                    
                    {currentTrip?.departureDatetime && (
                        <div className="text-sm text-on-surface-variant mt-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            <span>{new Date(currentTrip.departureDatetime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                    )}
                    
                    <div className="text-sm text-on-surface-variant mt-1.5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">chair</span>
                        <span>Ghế: {selectedSeats.join(', ')}</span>
                    </div>
                </div>

                <div className="border-t border-outline-variant border-dashed"></div>

                {/* Promo code input block */}
                <div className="space-y-2">
                    <div className="relative">
                        <input 
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-4 pr-24 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                            placeholder="Mã khuyến mãi (Ví dụ: HOMING)"
                        />
                        <button 
                            type="button"
                            onClick={handleApplyPromo}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-primary-hover transition-colors uppercase px-3 py-1.5 rounded-md hover:bg-surface-container-high cursor-pointer"
                        >
                            Áp dụng
                        </button>
                    </div>
                    
                    {promoMessage && (
                        <p className={`text-xs font-semibold mt-1 text-left ${
                            promoMessage.isError ? 'text-error' : 'text-primary'
                        }`}>
                            {promoMessage.text}
                        </p>
                    )}
                </div>

                <div className="border-t border-outline-variant border-dashed"></div>

                {/* Price breakdown */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm text-on-surface-variant">
                        <span>Giá vé ({selectedSeats.length} x {tripPrice.toLocaleString()}đ)</span>
                        <span>{baseTotal.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-on-surface-variant">
                        <span>Phụ phí</span>
                        <span>0đ</span>
                    </div>
                    {appliedDiscount > 0 && (
                        <div className="flex justify-between items-center text-sm text-primary font-semibold">
                            <span>Giảm giá</span>
                            <span>-{appliedDiscount.toLocaleString()}đ</span>
                        </div>
                    )}
                </div>

                <div className="border-t border-outline-variant mt-4 pt-4">
                    <div className="flex justify-between items-end">
                        <span className="text-base text-on-surface font-semibold">Tổng tiền</span>
                        <span className="text-xl font-bold text-[#F4600C]">
                            {Math.max(0, baseTotal - appliedDiscount).toLocaleString()}đ
                        </span>
                    </div>
                </div>
            </div>

            {/* Checkout CTA */}
            {showButton && (
                <>
                    <button 
                        type="button"
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="mt-8 w-full bg-[#F4600C] text-white font-semibold text-base py-4 rounded-xl hover:bg-[#c94c00] active:scale-98 transition-all shadow-lg hover:shadow-xl relative z-10 flex items-center justify-center gap-2 cursor-pointer border-none uppercase tracking-wider disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                {buttonText || 'Xác nhận & Thanh toán'}
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </>
                        )}
                    </button>
                    
                    <p className="text-xs text-on-surface-variant text-center mt-4 relative z-10 leading-relaxed">
                        Bằng việc bấm xác nhận, bạn đồng ý với các{' '}
                        <a className="text-primary hover:underline font-semibold" href="#">điều khoản</a> của chúng tôi.
                    </p>
                </>
            )}
        </div>
    );
};
