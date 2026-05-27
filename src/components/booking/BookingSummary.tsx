import React from 'react';

interface BookingSummaryProps {
    trip: any;
    selectedSeats: string[];
    promoCode: string;
    setPromoCode: (val: string) => void;
    handleApplyPromo: () => void;
    promoMsg: any;
    totalAmount: number;
    discount: number;
    finalTotal: number;
    agreedTerms: boolean;
    setAgreedTerms: (val: boolean) => void;
    errors: any;
    processing: boolean;
    fmtPrice: (n: number) => string;
    fmtTime: (iso?: string) => string;
    fmtDate: (iso?: string) => string;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
    trip, selectedSeats, promoCode, setPromoCode, handleApplyPromo, promoMsg, totalAmount, discount, finalTotal,
    agreedTerms, setAgreedTerms, errors, processing, fmtPrice, fmtTime, fmtDate
}) => {
    return (
        <div className="lg:col-span-5 relative">
            <div className="sticky top-[120px] space-y-6">

                {/* Trip summary card */}
                <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_12px_32px_rgba(92,64,51,0.1)] text-left">
                    <h3 className="text-lg font-bold text-on-surface mb-5 pb-4 border-b border-dashed border-outline-variant" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Tóm tắt chuyến đi
                    </h3>

                    <div className="space-y-4">
                        {/* Route */}
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">route</span>
                            <div>
                                <p className="font-semibold text-on-surface">{trip.from || trip.route?.originCityName} → {trip.to || trip.route?.destinationCityName}</p>
                                <p className="text-sm text-on-surface-variant">{trip.vehicleType || trip.vehicle?.vehicleTypeName}</p>
                            </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">schedule</span>
                            <div>
                                <p className="font-semibold text-on-surface">{fmtTime(trip.departureDatetime)} → {fmtTime(trip.arrivalDatetime)}</p>
                                <p className="text-sm text-on-surface-variant">{fmtDate(trip.departureDatetime)}</p>
                            </div>
                        </div>

                        {/* Seats */}
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">chair</span>
                            <div>
                                <p className="font-semibold text-on-surface">{selectedSeats.length} ghế: {selectedSeats.join(', ')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-outline-variant my-5" />

                    {/* Promo code */}
                    <div className="space-y-2 mb-5">
                        <div className="relative">
                            <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-4 pr-24 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Mã khuyến mãi" />
                            <button type="button" onClick={handleApplyPromo}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-primary-hover px-3 py-1.5 rounded-md hover:bg-surface-container-high cursor-pointer uppercase">Áp dụng</button>
                        </div>
                        {promoMsg && <p className={`text-xs font-semibold ${promoMsg.ok ? 'text-primary' : 'text-red-500'}`}>{promoMsg.text}</p>}
                    </div>

                    <div className="border-t border-dashed border-outline-variant mb-5" />

                    {/* Price breakdown */}
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-on-surface-variant">
                            <span>Giá vé ({selectedSeats.length} ghế)</span>
                            <span>{fmtPrice(totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-on-surface-variant">
                            <span>Phụ phí</span><span>0đ</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-primary font-semibold">
                                <span>Giảm giá</span><span>-{fmtPrice(discount)}</span>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-outline-variant mt-4 pt-4">
                        <div className="flex justify-between items-end">
                            <span className="text-base text-on-surface font-semibold">Tổng thanh toán</span>
                            <span className="text-2xl font-bold text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>{fmtPrice(finalTotal)}</span>
                        </div>
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-3 mt-6 cursor-pointer group">
                        <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)}
                            className="w-4 h-4 mt-0.5 accent-primary cursor-pointer rounded" />
                        <span className="text-xs text-on-surface-variant leading-relaxed">
                            Tôi đồng ý với <a className="text-primary hover:underline font-semibold" href="#">điều khoản sử dụng</a> và <a className="text-primary hover:underline font-semibold" href="#">chính sách bảo mật</a>
                        </span>
                    </label>
                    {errors.terms && <p className="text-xs text-red-500 font-semibold mt-1">{errors.terms}</p>}

                    {/* CTA */}
                    <button type="submit" disabled={processing}
                        className="mt-6 w-full bg-[#F4600C] text-white font-semibold text-base py-4 rounded-xl hover:bg-[#c94c00] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer border-none uppercase tracking-wider disabled:opacity-75 disabled:cursor-not-allowed">
                        {processing ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Đang xử lý...</>
                        ) : (
                            <>Xác nhận & Thanh toán<span className="material-symbols-outlined text-[18px]">lock</span></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
