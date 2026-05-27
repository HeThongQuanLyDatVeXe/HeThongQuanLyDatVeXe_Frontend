import React from 'react';

interface TripDetailRightColumnProps {
    trip: any;
    from: string;
    to: string;
    vehicleType: string;
    availableSeats: number;
    passengers: number;
    setPassengers: (val: number) => void;
    finalPrice: number;
    tripStatus: string;
    formatTime: (iso: string) => string;
    formatDate: (iso: string) => string;
    handleSelectSeat: () => void;
}

export const TripDetailRightColumn: React.FC<TripDetailRightColumnProps> = ({
    trip, from, to, vehicleType, availableSeats, passengers, setPassengers,
    finalPrice, tripStatus, formatTime, formatDate, handleSelectSeat
}) => {
    return (
        <div className="w-full lg:w-[35%] relative">
            <div className="sticky top-28 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_8px_20px_rgba(92,64,51,0.03)] p-md flex flex-col text-left">
                <h3 className="typo-headline-md text-lg font-bold text-on-surface mb-md">Tóm tắt chuyến đi</h3>
                
                <div className="space-y-sm mb-md flex-grow">
                    <div className="flex justify-between items-center border-b border-outline-variant pb-xs">
                        <span className="typo-label-sm text-xs text-on-surface-variant">Tuyến đường</span>
                        <span className="typo-body-md text-sm text-on-surface font-semibold">{from} - {to}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-outline-variant pb-xs mt-2">
                        <span className="typo-label-sm text-xs text-on-surface-variant">Ngày đi</span>
                        <span className="typo-body-md text-sm text-on-surface font-semibold">{formatDate(trip.departureDatetime)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-outline-variant pb-xs mt-2">
                        <span className="typo-label-sm text-xs text-on-surface-variant">Giờ khởi hành</span>
                        <span className="typo-body-md text-sm text-on-surface font-semibold">{formatTime(trip.departureDatetime)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-outline-variant pb-xs mt-2">
                        <span className="typo-label-sm text-xs text-on-surface-variant">Loại xe</span>
                        <span className="typo-body-md text-sm text-on-surface">{vehicleType}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-outline-variant pb-xs mt-2">
                        <span className="typo-label-sm text-xs text-on-surface-variant">Ghế trống</span>
                        <span className="typo-body-md text-sm text-secondary font-semibold">{availableSeats} ghế</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-outline-variant pb-xs mt-2">
                        <span className="typo-label-sm text-xs text-on-surface-variant">Hành khách</span>
                        <div className="flex items-center space-x-2">
                            <button 
                                disabled={passengers <= 1}
                                onClick={() => setPassengers(passengers - 1)}
                                className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                -
                            </button>
                            <span className="typo-body-md text-sm text-on-surface w-4 text-center font-bold">{passengers}</span>
                            <button 
                                disabled={passengers >= Math.min(5, availableSeats)}
                                onClick={() => setPassengers(passengers + 1)}
                                className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-xs mt-6">
                        <span className="typo-body-lg text-sm text-on-surface font-medium">Tổng tạm tính</span>
                        <span className="typo-headline-md text-xl font-bold text-primary">
                            {finalPrice > 0 ? `${(finalPrice * passengers).toLocaleString()}đ` : 'Liên hệ'}
                        </span>
                    </div>
                </div>

                <button 
                    onClick={handleSelectSeat}
                    disabled={tripStatus === 'CANCELLED' || availableSeats <= 0}
                    className="w-full bg-primary text-on-primary font-body-lg text-sm font-semibold py-3.5 rounded-xl hover:bg-primary-hover transition-all duration-300 shadow-[0_8px_25px_rgba(161,59,0,0.2)] flex items-center justify-center mt-sm uppercase tracking-wider disabled:bg-surface-container-highest disabled:text-outline disabled:cursor-not-allowed cursor-pointer"
                >
                    {availableSeats <= 0 ? 'Hết ghế' : tripStatus === 'CANCELLED' ? 'Chuyến đã hủy' : 'Chọn ghế'}
                    <span className="material-symbols-outlined ml-2 text-sm font-bold">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};
