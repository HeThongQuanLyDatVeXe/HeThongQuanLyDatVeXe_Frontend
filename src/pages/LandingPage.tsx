import React from 'react';
import { useLandingPage } from '../hooks/pages/useLandingPage';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';

// Landing Components
import { HeroSection } from '../components/landing/HeroSection';
import { SearchPanel } from '../components/landing/SearchPanel';
import { TrustBar } from '../components/landing/TrustBar';
import { PopularRoutes } from '../components/landing/PopularRoutes';
import { PromotionsBanner } from '../components/landing/PromotionsBanner';
import { HowItWorks } from '../components/landing/HowItWorks';
import { WhyChooseUs } from '../components/landing/WhyChooseUs';
import { AppDownload } from '../components/landing/AppDownload';
import { Testimonials } from '../components/landing/Testimonials';
import { NewsletterSignup } from '../components/landing/NewsletterSignup';

export const LandingPage: React.FC = () => {
    const {
        cities,
        popularRoutes,
        loadingPopular,
        tripType,
        setTripType,
        fromCityId,
        setFromCityId,
        toCityId,
        setToCityId,
        date,
        setDate,
        passengers,
        setPassengers,
        showPassengerMenu,
        setShowPassengerMenu,
        passengerMenuRef,
        handleSwapCities,
        handleSearch,
        navigate,
        ROUTES
    } = useLandingPage();

    const testimonials = [
        {
            stars: 5,
            content: 'Dịch vụ cực kỳ tốt. Xe sạch sẽ và nhân viên rất lịch sự. Tôi chắc chắn sẽ quay lại.',
            author: 'Trần Minh Anh',
            route: 'Tuyến HN - HP',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCIshQ-Ra8g3mNfVrb6ZUV65k_V1lhJFZqh92wLjZ-R7i1Gd-9XI3n73qAJWtFRcpJKeS0PIDO_1vinW3RVd2--oG8MWGOVaLvmOEa8VH-1KBaUZY_BSA-JtzPcjUMgAjFBx-qhosFakKzrVG0dI2XH6taJInPzyHbgH6K1muVPA_gW436Mf0J3qET98lZEUzd964hO_4R1COoixcegQbHWYTQGgyOqjoSGINXOG0kGFTvywFpAvu5Hqf8NfbNDcBAREB88pR6RCE'
        },
        {
            stars: 5,
            content: 'App rất dễ sử dụng, thanh toán bằng ví điện tử chỉ mất vài giây. Rất hài lòng!',
            author: 'Lê Quang Huy',
            route: 'Tuyến SG - ĐL',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBue7vZMHPHKjQx4wnRm0_VSkJjNkB9qGn_odA1RYfwGud0kxxtu4if7eIapnxYSY8PfPKD4298YSraA83IQ4XBo1N_LxRn_izmjVv-nCGYXzC8voaHgkQ2FyPYuTeXUFjGMabO83BcbX_35ejsnDnpiP89XSZqD2udJ0f_hDJjh6WDYISILCtJ6HI_SdXGjnPJrXRaQsq8VA0XQ6EJqr9b87JYVNMMtIanCx2Dh7_pNnn8dCY2ajlZz7ToDm-P2X0qXg3AnxEwt_U'
        },
        {
            stars: 4,
            content: 'Chuyến xe đêm rất êm, tôi ngủ một mạch đến sáng là về tới quê. Cảm ơn Đi Về Nhà.',
            author: 'Phan Mỹ Linh',
            route: 'Tuyến ĐN - NT',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWpuiXoTxQfpgxmRJfvgBrHyQypk_iuesA8MV0EoVUqU6oauEJsZM4Un0B_obchzTXcaiWgpF6l9CumZM3UkcRyr_jP7EFXnoGA6PnsGWaH9hMLiKlBUfWrVTuHFx6uBcrH-aO23TKRBClwPbjFjrMaaeP2zhssgquWkeV5NqzEG3VWHXRUYdWT38yMRhbJu2OLqu2AKlppZjpesvHg3yJPJKoYZOkt-MRTr4xCX_ZyqrEw-jA217vifqR832snivmVlZKOSn5Yiw'
        },
        {
            stars: 5,
            content: 'Mọi thứ đều hoàn hảo từ khâu đặt vé đến khâu xuống xe. Sẽ giới thiệu cho bạn bè.',
            author: 'Nguyễn Gia Bảo',
            route: 'Tuyến HN - ĐN',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsx5AW5RUoyqOmWLVAstOGb4I0CrzloxFEpE1AUAwcvtSHm5cFkj5ntnZjqk_MO-PlHa6Gtf53uMzad5uuL7ALEDyvWqVIbww2E9KH3sc3zHQhwtrdRVMN8hNt-HTZnks6a5Irmi5qsnMTcODlaRlJGaIW1zQxbeNG5rUT57VoaTrFdOzU6XeYBMfnPmbJuYUV61q4l_ZS6K1REDA6H0aMEJwJ3oulVE2xLhPufieITnxmhDRrV6V8n4EGNZiDwDJSeKKZ7owujnI'
        }
    ];

    const handleScrollToSearch = () => {
        const searchPanel = document.getElementById('search-panel');
        if (searchPanel) {
            searchPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div className="min-h-screen bg-background text-on-background font-body select-none">
            <Header />

            {/* Cinematic Video Hero Section */}
            <HeroSection handleScrollToSearch={handleScrollToSearch} />

            {/* Frosted Ticket Search Overlay */}
            <SearchPanel
                tripType={tripType}
                setTripType={setTripType}
                fromCityId={fromCityId}
                setFromCityId={setFromCityId}
                toCityId={toCityId}
                setToCityId={setToCityId}
                date={date}
                setDate={setDate}
                passengers={passengers}
                setPassengers={setPassengers}
                showPassengerMenu={showPassengerMenu}
                setShowPassengerMenu={setShowPassengerMenu}
                passengerMenuRef={passengerMenuRef}
                handleSwapCities={handleSwapCities}
                handleSearch={handleSearch}
                cities={cities}
            />

            {/* Spacer to push down sections below the absolute search overlay */}
            <div className="h-[160px] md:h-[120px] bg-background" />

            {/* Trust Bar (Stats Section) */}
            <TrustBar />

            {/* Popular Routes Section */}
            <PopularRoutes
                popularRoutes={popularRoutes}
                loadingPopular={loadingPopular}
                navigate={navigate}
                ROUTES={ROUTES}
            />

            {/* Promotions Banner Section */}
            <PromotionsBanner />

            {/* How It Works Section */}
            <HowItWorks />

            {/* Why Choose Us Section */}
            <WhyChooseUs />

            {/* App Download Section */}
            <AppDownload />

            {/* Testimonials (Customer Reviews) Section */}
            <Testimonials testimonials={testimonials} />

            {/* Newsletter Signup Section */}
            <NewsletterSignup />

            <Footer />
        </div>
    );
};