import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { useRoutesPage } from '../hooks/pages/useRoutesPage';

// Components
import { RoutesFilterSidebar } from '../components/routes/RoutesFilterSidebar';
import { RouteList } from '../components/routes/RouteList';

export const RoutesPage: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    cities,
    stopPointsMap,
    loading,
    originCityId,
    setOriginCityId,
    destCityId,
    setDestCityId,
    keyword,
    setKeyword,
    filtered
  } = useRoutesPage();

  return (
    <div className="min-h-screen bg-background text-on-background font-body select-none">
      <Header />
      <main className="pt-20">
        <div className="grain-overlay" />

        {/* Hero */}
        <section className="h-[260px] bg-[#1A1410] relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#F4600C22_0%,_transparent_70%)] opacity-60 pointer-events-none" />
          <div className="relative z-10 w-full max-w-container-max px-gutter text-center">
            <h1 className="typo-headline-lg text-on-primary mb-3">Tuyến đường</h1>
            <p className="typo-body-lg text-on-primary/70">Chọn tuyến đường để xem các chuyến xe hiện có</p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-container-max mx-auto px-gutter py-lg grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Sidebar Filters */}
          <RoutesFilterSidebar
            keyword={keyword}
            setKeyword={setKeyword}
            originCityId={originCityId}
            setOriginCityId={setOriginCityId}
            destCityId={destCityId}
            setDestCityId={setDestCityId}
            cities={cities}
          />

          {/* Route List */}
          <RouteList
            loading={loading}
            filtered={filtered}
            stopPointsMap={stopPointsMap}
            navigate={navigate}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};
