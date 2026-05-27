import React from 'react';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { ROUTES } from '../constants/routes';
import { useTripDetailPage } from '../hooks/pages/useTripDetailPage';

// Components
import { TripDetailLeftColumn } from '../components/trip-detail/TripDetailLeftColumn';
import { TripDetailRightColumn } from '../components/trip-detail/TripDetailRightColumn';

export const TripDetailPage: React.FC = () => {
    const {
        navigate,
        passengers,
        setPassengers,
        trip,
        loading,
        from,
        to,
        routeName,
        durationStr,
        distanceKm,
        vehicleType,
        vehicleBrand,
        vehicleFullName,
        licensePlate,
        totalSeats,
        availableSeats,
        finalPrice,
        seatType,
        tripStatus,
        tripCode,
        formatTime,
        formatDate,
        isNextDay,
        handleSelectSeat
    } = useTripDetailPage();

    return (
        <div className="min-h-screen bg-background text-on-background font-body select-none">
            <Header />
            <div className="grain-overlay" />

            <main className="flex-grow container mx-auto max-w-container-max px-gutter py-lg pt-28">
                {loading ? (
                    <div className="flex justify-center items-center py-20 min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : !trip ? (
                    <div className="flex flex-col items-center justify-center py-20 min-h-[50vh] gap-4">
                        <span className="material-symbols-outlined text-6xl text-outline">error_outline</span>
                        <h2 className="typo-headline-md text-on-surface">Không tìm thấy chuyến đi</h2>
                        <p className="text-on-surface-variant">Chuyến đi này không tồn tại hoặc đã bị hủy.</p>
                        <button onClick={() => navigate(ROUTES.ROUTES)} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-xl cursor-pointer">
                            Quay lại tuyến đường
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Breadcrumb */}
                        <div className="mb-md flex items-center space-x-2 text-on-surface-variant font-label-sm text-sm">
                            <span className="cursor-pointer hover:text-primary" onClick={() => navigate(ROUTES.HOME)}>Trang chủ</span>
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                            <span className="cursor-pointer hover:text-primary" onClick={() => navigate(ROUTES.ROUTES)}>Tuyến đường</span>
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                            <span className="text-on-surface font-semibold">{from} - {to}</span>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-lg">
                            {/* Left Column (65%) */}
                            <TripDetailLeftColumn
                                trip={trip}
                                from={from}
                                to={to}
                                routeName={routeName}
                                durationStr={durationStr}
                                distanceKm={distanceKm}
                                vehicleType={vehicleType}
                                vehicleBrand={vehicleBrand}
                                vehicleFullName={vehicleFullName}
                                licensePlate={licensePlate}
                                totalSeats={totalSeats}
                                availableSeats={availableSeats}
                                seatType={seatType}
                                tripStatus={tripStatus}
                                tripCode={tripCode}
                                formatTime={formatTime}
                                isNextDay={isNextDay}
                            />

                            {/* Right Column (35% Sticky) */}
                            <TripDetailRightColumn
                                trip={trip}
                                from={from}
                                to={to}
                                vehicleType={vehicleType}
                                availableSeats={availableSeats}
                                passengers={passengers}
                                setPassengers={setPassengers}
                                finalPrice={finalPrice}
                                tripStatus={tripStatus}
                                formatTime={formatTime}
                                formatDate={formatDate}
                                handleSelectSeat={handleSelectSeat}
                            />
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};
