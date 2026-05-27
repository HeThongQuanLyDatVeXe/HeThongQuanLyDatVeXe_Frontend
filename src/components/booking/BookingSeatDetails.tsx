import React from 'react';

interface BookingSeatDetailsProps {
    seatDetails: any[];
    selectedSeats: string[];
    totalAmount: number;
    fmtPrice: (n: number) => string;
}

export const BookingSeatDetails: React.FC<BookingSeatDetailsProps> = ({ seatDetails, selectedSeats, totalAmount, fmtPrice }) => {
    return (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_8px_20px_rgba(92,64,51,0.05)]">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">2</div>
                <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'Playfair Display, serif' }}>Chi tiết ghế đã chọn</h2>
            </div>
            <div className="space-y-3">
                {(seatDetails || selectedSeats.map(s => ({ seatNumber: s, seatType: 'REGULAR', price: totalAmount / selectedSeats.length }))).map((seat: any) => (
                    <div key={seat.seatNumber} className="flex items-center justify-between p-4 bg-surface border border-outline-variant/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[20px]">airline_seat_recline_extra</span>
                            </div>
                            <div>
                                <p className="font-semibold text-on-surface">Ghế {seat.seatNumber}</p>
                                <p className="text-xs text-on-surface-variant">{seat.seatType}</p>
                            </div>
                        </div>
                        <span className="font-bold text-primary">{fmtPrice(seat.price)}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};
