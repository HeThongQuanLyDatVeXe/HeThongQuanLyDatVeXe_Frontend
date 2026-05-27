import React from 'react';
import { useBookingSuccessfulPage } from '../hooks/pages/useBookingSuccessfulPage';
import { MinimalTopNav } from '../components/booking-successful/MinimalTopNav';
import { MinimalFooter } from '../components/booking-successful/MinimalFooter';
import { SuccessHeader } from '../components/booking-successful/SuccessHeader';
import { TicketBox } from '../components/booking-successful/TicketBox';
import { ActionButtons } from '../components/booking-successful/ActionButtons';

export const BookingSuccessfulPage: React.FC = () => {
    const {
        details,
        handleDownloadPDF,
        handleNavigateHome
    } = useBookingSuccessfulPage();

    return (
        <div className="min-h-screen bg-background text-on-background noise-bg relative flex flex-col font-body-md pb-16">
            {/* Grain Overlay */}
            <div className="grain-overlay" />

            {/* Minimal Transactional Top Nav */}
            <MinimalTopNav onNavigateHome={handleNavigateHome} />

            {/* Main Content */}
            <main className="flex-grow pt-32 pb-24 px-8 flex flex-col items-center justify-center">
                <div className="max-w-[800px] w-full flex flex-col items-center gap-12">
                    
                    {/* Success Header Message */}
                    <SuccessHeader />

                    {/* Bento Ticket Box */}
                    <TicketBox details={details} />

                    {/* Action buttons */}
                    <ActionButtons 
                        onDownloadPDF={handleDownloadPDF} 
                        onNavigateHome={handleNavigateHome} 
                    />
                </div>
            </main>

            {/* Footer minimal */}
            <MinimalFooter />
        </div>
    );
};
