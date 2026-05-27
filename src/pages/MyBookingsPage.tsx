import React from 'react';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { useMyBookingsPage } from '../hooks/pages/useMyBookingsPage';

// Components
import { BookingCard } from '../components/my-bookings/BookingCard';
import { MyBookingsSidebar } from '../components/my-bookings/MyBookingsSidebar';
import { NextTripBanner } from '../components/my-bookings/NextTripBanner';

export const MyBookingsPage: React.FC = () => {
    const {
        user,
        activeTab,
        setActiveTab,
        filteredBookings,
        nextTrip,
        avatarInitials,
        handleNavigateProfile,
        TABS,
        SIDEBAR_NAV,
        MOCK_BOOKINGS
    } = useMyBookingsPage();

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            <Header />

            <main className="max-w-[1200px] mx-auto px-4 md:px-6 pt-28 pb-24 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* ── Sidebar ── */}
                <MyBookingsSidebar 
                    user={user} 
                    avatarInitials={avatarInitials} 
                    SIDEBAR_NAV={SIDEBAR_NAV} 
                />

                {/* ── Main Content ── */}
                <section className="col-span-1 md:col-span-9 flex flex-col gap-8">
                    {/* Page heading */}
                    <header className="flex flex-col gap-1">
                        <h1
                            className="text-3xl font-semibold"
                            style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-background)' }}
                        >
                            Vé của tôi
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                            Quản lý những chuyến hành trình sắp tới và đã qua của bạn.
                        </p>
                    </header>

                    {/* ── Next trip highlight banner ── */}
                    {nextTrip && (
                        <NextTripBanner 
                            nextTrip={nextTrip} 
                            handleNavigateProfile={handleNavigateProfile} 
                        />
                    )}

                    {/* ── Tab filters ── */}
                    <div
                        className="flex gap-6 border-b overflow-x-auto"
                        style={{ borderColor: 'var(--color-outline-variant)' }}
                    >
                        {TABS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className="pb-3 text-sm font-medium whitespace-nowrap transition-all border-b-2"
                                style={
                                    activeTab === key
                                        ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontWeight: 700 }
                                        : { borderColor: 'transparent', color: 'var(--color-on-surface-variant)' }
                                }
                            >
                                {label}
                                {key !== 'all' && (
                                    <span
                                        className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                        style={{
                                            backgroundColor:
                                                activeTab === key ? 'var(--color-primary)' : 'var(--color-surface-container)',
                                            color: activeTab === key ? '#fff' : 'var(--color-on-surface-variant)',
                                        }}
                                    >
                                        {MOCK_BOOKINGS.filter((b) => b.status === key).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── Booking cards ── */}
                    <div className="flex flex-col gap-5">
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} />
                            ))
                        ) : (
                            /* Empty state */
                            <div
                                className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed"
                                style={{ borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}
                            >
                                <span className="material-symbols-outlined text-5xl mb-3 opacity-40">
                                    confirmation_number
                                </span>
                                <p className="text-sm font-medium">Không có vé nào trong mục này.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
