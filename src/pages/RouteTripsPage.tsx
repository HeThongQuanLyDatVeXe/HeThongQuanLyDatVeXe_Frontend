import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { ROUTES } from '../constants/routes';
import { useRouteTripsPage } from '../hooks/pages/useRouteTripsPage';

// Components
import { RouteTripsHero } from '../components/route-trips/RouteTripsHero';
import { RouteTripsFilter } from '../components/route-trips/RouteTripsFilter';
import { RouteTripCard } from '../components/route-trips/RouteTripCard';

const fmtPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const fmtDuration = (m: number) => `${Math.floor(m / 60)}h${m % 60 > 0 ? `${m % 60}p` : ''}`;
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

export const RouteTripsPage: React.FC = () => {
    const {
        route,
        stopPoints,
        loading,
        routePrices,
        dateFilter, setDateFilter,
        timeFilter, setTimeFilter,
        vehicleTypeFilter, setVehicleTypeFilter,
        onlyAvailable, setOnlyAvailable,
        sortBy, setSortBy,
        selectedTripId,
        seatMap,
        seatMapLoading,
        selectedSeats,
        vehicleTypes,
        availableDates,
        filtered,
        getMinPrice,
        getMaxPrice,
        handleSelectTrip,
        toggleSeat,
        calculateTotal,
        navigate
    } = useRouteTripsPage();

    if (loading) return (
        <div className="min-h-screen bg-background"><Header />
            <div className="flex justify-center items-center pt-40"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        </div>
    );

    if (!route) return (
        <div className="min-h-screen bg-background"><Header />
            <div className="flex flex-col items-center justify-center pt-40 gap-4">
                <p className="typo-body-lg text-on-surface-variant">Không tìm thấy tuyến đường</p>
                <Link to={ROUTES.ROUTES} className="text-primary underline">Quay lại</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-on-background font-body select-none">
            <Header />
            <main className="pt-20">
                {/* Hero */}
                <RouteTripsHero
                    route={route}
                    stopPoints={stopPoints}
                    ROUTES={ROUTES}
                    fmtDuration={fmtDuration}
                    fmtPrice={fmtPrice}
                    routePrices={routePrices}
                />

                <div className="max-w-container-max mx-auto px-gutter py-lg grid grid-cols-1 lg:grid-cols-12 gap-lg">
                    {/* Sidebar */}
                    <RouteTripsFilter
                        dateFilter={dateFilter}
                        setDateFilter={setDateFilter}
                        availableDates={availableDates}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        timeFilter={timeFilter}
                        setTimeFilter={setTimeFilter}
                        vehicleTypes={vehicleTypes}
                        vehicleTypeFilter={vehicleTypeFilter}
                        setVehicleTypeFilter={setVehicleTypeFilter}
                        onlyAvailable={onlyAvailable}
                        setOnlyAvailable={setOnlyAvailable}
                    />

                    {/* Trips List */}
                    <div className="lg:col-span-9 space-y-md">
                        <p className="typo-body-md text-on-surface-variant italic">
                            {filtered.length} chuyến xe {dateFilter ? `ngày ${new Date(dateFilter + 'T00:00:00').toLocaleDateString('vi-VN')}` : ''}
                        </p>

                        {filtered.length === 0 ? (
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-16 text-center flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-[32px]">directions_bus</span>
                                </div>
                                <h4 className="typo-headline-md text-primary">Không có chuyến xe nào</h4>
                                <p className="typo-body-md text-on-surface-variant">Thử thay đổi ngày hoặc bộ lọc khác.</p>
                            </div>
                        ) : filtered.map(trip => (
                            <RouteTripCard
                                key={trip.id}
                                trip={trip}
                                route={route}
                                isSelected={selectedTripId === trip.id}
                                getMinPrice={getMinPrice}
                                getMaxPrice={getMaxPrice}
                                handleSelectTrip={handleSelectTrip}
                                fmtPrice={fmtPrice}
                                fmtDuration={fmtDuration}
                                fmtTime={fmtTime}
                                seatMapLoading={seatMapLoading}
                                seatMap={seatMap}
                                selectedSeats={selectedSeats}
                                toggleSeat={toggleSeat}
                                calculateTotal={calculateTotal}
                                navigate={navigate}
                            />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
