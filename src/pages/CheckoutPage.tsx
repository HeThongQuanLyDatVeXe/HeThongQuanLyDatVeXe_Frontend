import React from 'react';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { useCheckoutPage } from '../hooks/pages/useCheckoutPage';

// Components
import { PassengerForm } from '../components/checkout/PassengerForm';
import { PaymentMethods } from '../components/checkout/PaymentMethods';
import { CheckoutSummary } from '../components/checkout/CheckoutSummary';

export const CheckoutPage: React.FC = () => {
    const {
        passedState,
        currentTrip,
        selectedSeats,
        baseTotal,
        fullName,
        setFullName,
        phoneNumber,
        setPhoneNumber,
        email,
        setEmail,
        notes,
        setNotes,
        paymentMethod,
        setPaymentMethod,
        formErrors,
        promoInput,
        setPromoInput,
        appliedDiscount,
        promoMessage,
        isProcessing,
        handleApplyPromo,
        handleCheckout,
        handleNavigateRoutes
    } = useCheckoutPage();

    if (!passedState?.currentTrip || !passedState?.selectedSeats?.length) {
        // No valid state: redirect back
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <span className="material-symbols-outlined text-6xl text-outline">error_outline</span>
                <h2 className="text-xl font-bold text-on-surface">Không có thông tin đặt vé</h2>
                <p className="text-on-surface-variant">Vui lòng quay lại chọn chuyến và ghế trước.</p>
                <button onClick={handleNavigateRoutes} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-xl cursor-pointer">
                    Quay lại tuyến đường
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-on-background font-body-md antialiased relative flex flex-col pb-16">
            {/* Standard Header Layout */}
            <Header />

            {/* Grain Overlay */}
            <div className="grain-overlay" />

            {/* Main Content */}
            <main className="flex-grow pt-[104px] pb-xl px-8 max-w-[1200px] mx-auto w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                    
                    {/* LEFT COLUMN: Passenger details & payments */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* Passenger information form */}
                        <PassengerForm
                            fullName={fullName}
                            setFullName={setFullName}
                            phoneNumber={phoneNumber}
                            setPhoneNumber={setPhoneNumber}
                            email={email}
                            setEmail={setEmail}
                            notes={notes}
                            setNotes={setNotes}
                            formErrors={formErrors}
                        />

                        {/* Payment methods section */}
                        <PaymentMethods 
                            paymentMethod={paymentMethod} 
                            setPaymentMethod={setPaymentMethod} 
                        />
                    </div>

                    {/* RIGHT COLUMN: Sticky summary panel */}
                    <div className="lg:col-span-4 relative">
                        <CheckoutSummary
                            currentTrip={currentTrip}
                            selectedSeats={selectedSeats}
                            baseTotal={baseTotal}
                            promoInput={promoInput}
                            setPromoInput={setPromoInput}
                            handleApplyPromo={handleApplyPromo}
                            promoMessage={promoMessage}
                            appliedDiscount={appliedDiscount}
                            handleCheckout={handleCheckout}
                            isProcessing={isProcessing}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
