import React, { useMemo } from 'react';

interface BookingSeatDetailsProps {
    seatDetails: any[];
    selectedSeats: string[];
    totalAmount: number;
    fmtPrice: (n: number) => string;
}

export const BookingSeatDetails: React.FC<BookingSeatDetailsProps> = ({ seatDetails, selectedSeats, totalAmount, fmtPrice }) => {
    // Fallback if seatDetails is empty
    const seats = seatDetails?.length > 0 ? seatDetails : selectedSeats.map(s => ({ 
        seatNumber: s, 
        seatType: 'REGULAR', 
        price: totalAmount / (selectedSeats.length || 1) 
    }));

    // Group seats by seatType
    const groupedSeats = useMemo(() => {
        const groups: Record<string, { count: number, pricePerSeat: number, total: number, seatNumbers: string[] }> = {};
        seats.forEach((seat: any) => {
            const type = seat.seatType || 'REGULAR';
            if (!groups[type]) {
                groups[type] = { count: 0, pricePerSeat: seat.price, total: 0, seatNumbers: [] };
            }
            groups[type].count += 1;
            groups[type].total += seat.price;
            groups[type].seatNumbers.push(seat.seatNumber);
        });
        return groups;
    }, [seats]);

    const getSeatTypeName = (type: string) => {
        const upper = type.toUpperCase();
        if (upper === 'VIP') return 'Ghế VIP';
        if (upper === 'NORMAL' || upper === 'REGULAR') return 'Ghế Thường';
        if (upper === 'BED') return 'Giường Nằm';
        if (upper === 'DOUBLE_BED') return 'Giường Đôi';
        if (upper === 'LIMOUSINE') return 'Ghế Limousine';
        return type;
    };

    return (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_8px_20px_rgba(92,64,51,0.05)]">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">2</div>
                <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'Playfair Display, serif' }}>Chi tiết vé đã chọn</h2>
            </div>
            
            <div className="space-y-4">
                {Object.entries(groupedSeats).map(([type, data]) => (
                    <div key={type} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-surface border border-outline-variant/50 rounded-xl gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0">
                                <span className="font-bold text-lg leading-none">{data.count}</span>
                                <span className="text-[10px] font-medium uppercase mt-0.5">Vé</span>
                            </div>
                            <div>
                                <p className="font-semibold text-on-surface text-base">{getSeatTypeName(type)}</p>
                                <p className="text-sm text-on-surface-variant mt-0.5">
                                    Mã ghế: <span className="font-medium text-on-surface">{data.seatNumbers.join(', ')}</span>
                                </p>
                                <p className="text-xs text-outline mt-1">
                                    Đơn giá: {fmtPrice(data.pricePerSeat)} / vé
                                </p>
                            </div>
                        </div>
                        <div className="text-right md:ml-auto pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/30">
                            <p className="text-xs text-on-surface-variant mb-0.5">Thành tiền</p>
                            <span className="font-bold text-primary text-lg">{fmtPrice(data.total)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
