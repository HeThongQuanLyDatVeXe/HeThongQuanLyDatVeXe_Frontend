import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { routeService } from '../services/route-service/routeService';
import { priceService } from '../services/price-service/priceService';
import type { RouteResponse, CityResponse } from '../types/route-service/response';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { useToast } from '../contexts/ToastContext';
import { 
  MapPin, 
  ArrowsLeftRight, 
  CalendarBlank, 
  User, 
  MagnifyingGlass, 
  CaretDown, 
  RoadHorizon, 
  Users, 
  Star, 
  Timer, 
  Headset, 
  ArrowRight,
  ShieldCheck,
  Lightning,
  WifiHigh,
  ArrowsClockwise,
  Quotes
} from '@phosphor-icons/react';

// Smooth animate-on-scroll counter component
const AnimatedCounter: React.FC<{ target: number; suffix?: string }> = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTimestamp: number | null = null;
          const duration = 1500; // 1.5 seconds

          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out quad formula
            const easeProgress = progress * (2 - progress);
            setCount(Math.floor(easeProgress * target));
            
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(target);
            }
          };

          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={elementRef} className="font-headline-lg text-primary select-none font-bold">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

// Premium Promotions Countdown Timer Component
const CountdownTimer: React.FC = () => {
  const [targetTime] = useState(() => {
    const saved = localStorage.getItem('divenha_promo_countdown');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (parsed > Date.now()) return parsed;
    }
    const newTarget = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    localStorage.setItem('divenha_promo_countdown', newTarget.toString());
    return newTarget;
  });

  const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const distance = targetTime - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <div className="flex gap-4 md:gap-6" id="countdown">
      <div className="flex flex-col items-center">
        <span className="text-4xl md:text-6xl font-serif text-primary font-bold">
          {timeLeft.days.toString().padStart(2, '0')}
        </span>
        <span className="text-[10px] md:text-xs text-white/50 font-label-caps uppercase tracking-wider mt-1">Ngày</span>
      </div>
      <div className="text-3xl md:text-5xl text-white/20 select-none">:</div>
      <div className="flex flex-col items-center">
        <span className="text-4xl md:text-6xl font-serif text-primary font-bold">
          {timeLeft.hours.toString().padStart(2, '0')}
        </span>
        <span className="text-[10px] md:text-xs text-white/50 font-label-caps uppercase tracking-wider mt-1">Giờ</span>
      </div>
      <div className="text-3xl md:text-5xl text-white/20 select-none">:</div>
      <div className="flex flex-col items-center">
        <span className="text-4xl md:text-6xl font-serif text-primary font-bold">
          {timeLeft.minutes.toString().padStart(2, '0')}
        </span>
        <span className="text-[10px] md:text-xs text-white/50 font-label-caps uppercase tracking-wider mt-1">Phút</span>
      </div>
      <div className="text-3xl md:text-5xl text-white/20 select-none">:</div>
      <div className="flex flex-col items-center">
        <span className="text-4xl md:text-6xl font-serif text-primary font-bold">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-[10px] md:text-xs text-white/50 font-label-caps uppercase tracking-wider mt-1">Giây</span>
      </div>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { error: showError } = useToast();

  // Search overlay states
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [fromCityId, setFromCityId] = useState('');
  const [toCityId, setToCityId] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [showPassengerMenu, setShowPassengerMenu] = useState(false);
  const passengerMenuRef = useRef<HTMLDivElement>(null);
  const [cities, setCities] = useState<CityResponse[]>([]);

  // Load cities for search dropdowns
  useEffect(() => {
    routeService.getCities()
      .then(res => {
        const payload = res.data.result || res.data.data;
        const list = (payload as any)?.content || (Array.isArray(payload) ? payload : []);
        setCities(list);
      })
      .catch(() => {});
  }, []);

  // Close passenger menu on clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (passengerMenuRef.current && !passengerMenuRef.current.contains(e.target as Node)) {
        setShowPassengerMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSwapCities = () => {
    const temp = fromCityId;
    setFromCityId(toCityId);
    setToCityId(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCityId || !toCityId) {
      showError('Vui lòng chọn điểm đi và điểm đến');
      return;
    }
    const params = new URLSearchParams();
    params.set('originCityId', fromCityId);
    params.set('destCityId', toCityId);
    if (date) params.set('date', date);
    if (passengers > 1) params.set('passengers', passengers.toString());
    if (tripType === 'round-trip') params.set('roundTrip', 'true');
    
    navigate(`${ROUTES.ROUTES}?${params.toString()}`);
  };

  const [popularRoutes, setPopularRoutes] = useState<RouteResponse[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    const fetchPopularRoutes = async () => {
      try {
        setLoadingPopular(true);
        const res = await routeService.getPopularRoutes();
        const payload = res.data.result || res.data.data;
        const content = (payload as any)?.content || (Array.isArray(payload) ? payload : []);
        if (content && content.length > 0) {
          // Take top 5 for the landing page
          const topRoutes = content.slice(0, 5);
          
          // Enhance with price service
          const enhancedRoutes = await Promise.all(
            topRoutes.map(async (route: any) => {
              try {
                const priceRes = await priceService.getPricingByRoute(route.id);
                const pricePayload = priceRes.data.result || priceRes.data.data;
                const tiers = pricePayload?.priceTiers;
                if (tiers && tiers.length > 0) {
                  const lowestPrice = Math.min(...tiers.map((t: any) => t.minPrice || t.basePrice));
                  route.basePrice = lowestPrice;
                }
              } catch (e) {
                // Keep fallback
              }
              return route;
            })
          );
          
          setPopularRoutes(enhancedRoutes);
        }
      } catch (error) {
        console.error('Failed to fetch popular routes', error);
      } finally {
        setLoadingPopular(false);
      }
    };
    fetchPopularRoutes();
  }, []);

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
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover select-none pointer-events-none"
            src="https://res.cloudinary.com/dtxmo5yo1/video/upload/v1778238353/vietnam4k-60fps_rdmtsd.mp4"
          />
          {/* Overlay Dark Gradation for high contrast */}
          <div className="absolute inset-0 hero-gradient-overlay" />
        </div>

        {/* Hero Title Container */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
          <h1 
            className="font-display-hero text-6xl md:text-[5.5rem] text-surface-container-lowest italic drop-shadow-2xl font-bold"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Về nhà thôi.
          </h1>
          <p className="font-body text-surface-container-low max-w-2xl drop-shadow-md text-lg md:text-xl font-medium tracking-wide leading-relaxed">
            Kết nối mọi nẻo đường, mang hơi ấm gia đình đến gần hơn.
          </p>
        </div>

        {/* Animated Scroll indicator */}
        <button 
          onClick={handleScrollToSearch}
          className="absolute bottom-36 md:bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors animate-bounce-slow z-20 cursor-pointer"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ letterSpacing: '0.15em' }}>
            Cuộn để khám phá
          </span>
          <CaretDown size={20} />
        </button>

        {/* Frosted Ticket Search Overlay - Positioned overlapping the fold */}
        <div 
          id="search-panel" 
          className="absolute bottom-[-130px] md:bottom-[-90px] left-1/2 transform -translate-x-1/2 w-full max-w-[1200px] px-6 z-30"
        >
          <form 
            onSubmit={handleSearch} 
            className="glass-effect rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 flex flex-col gap-6"
          >
            {/* Trip Type Tabs */}
            <div className="flex items-center gap-6 border-b border-white/10 pb-4">
              <button
                type="button"
                onClick={() => setTripType('one-way')}
                className={`font-semibold text-xs uppercase tracking-wider pb-1 transition-all duration-300 border-b-2 cursor-pointer ${
                  tripType === 'one-way' 
                    ? 'text-white border-primary scale-105 font-bold' 
                    : 'text-white/60 hover:text-white border-transparent'
                }`}
              >
                Một chiều
              </button>
              <button
                type="button"
                onClick={() => setTripType('round-trip')}
                className={`font-semibold text-xs uppercase tracking-wider pb-1 transition-all duration-300 border-b-2 cursor-pointer ${
                  tripType === 'round-trip' 
                    ? 'text-white border-primary scale-105 font-bold' 
                    : 'text-white/60 hover:text-white border-transparent'
                }`}
              >
                Khứ hồi
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              {/* Điểm đi */}
              <div className="lg:col-span-4 flex flex-col gap-2">
                <label className="font-semibold text-xs text-white/70 uppercase tracking-wider">Điểm đi</label>
                <div className="relative">
                  <MapPin size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none z-10" />
                  <select
                    required
                    value={fromCityId}
                    onChange={(e) => setFromCityId(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 rounded-2xl border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-md transition-all duration-300 appearance-none cursor-pointer [&>option]:text-on-background [&>option]:bg-surface"
                  >
                    <option value="">Chọn điểm đi</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="lg:col-span-1 flex justify-center pb-2 lg:pb-3">
                <button
                  type="button"
                  onClick={handleSwapCities}
                  className="h-11 w-11 rounded-full bg-primary hover:bg-primary-hover text-on-primary flex items-center justify-center hover:rotate-180 transition-all duration-500 shadow-lg cursor-pointer"
                  title="Đổi chiều"
                >
                  <ArrowsLeftRight size={20} weight="bold" />
                </button>
              </div>

              {/* Điểm đến */}
              <div className="lg:col-span-4 flex flex-col gap-2">
                <label className="font-semibold text-xs text-white/70 uppercase tracking-wider">Điểm đến</label>
                <div className="relative">
                  <MapPin size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none z-10" />
                  <select
                    required
                    value={toCityId}
                    onChange={(e) => setToCityId(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 rounded-2xl border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-md transition-all duration-300 appearance-none cursor-pointer [&>option]:text-on-background [&>option]:bg-surface"
                  >
                    <option value="">Chọn điểm đến</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Ngày đi */}
              <div className="lg:col-span-3 flex flex-col gap-2">
                <label className="font-semibold text-xs text-white/70 uppercase tracking-wider">Ngày đi</label>
                <div className="relative">
                  <CalendarBlank size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 rounded-2xl border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-white/30 backdrop-blur-md transition-all duration-300 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
              {/* Passenger Selector */}
              <div className="relative w-full md:w-auto" ref={passengerMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowPassengerMenu(!showPassengerMenu)}
                  className="flex items-center gap-4 text-white bg-white/5 hover:bg-white/10 px-6 py-3.5 rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 w-full md:w-auto justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-primary" />
                    <span className="font-medium text-sm">{passengers} Hành khách</span>
                  </div>
                  <CaretDown size={16} className={`text-white/60 transition-transform duration-300 ${showPassengerMenu ? 'rotate-180' : ''}`} />
                </button>

                {showPassengerMenu && (
                  <div className="absolute top-[110%] left-0 w-48 bg-white text-on-background rounded-2xl shadow-xl p-4 border border-slate-100 flex flex-col gap-3 z-50">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Hành khách</span>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        disabled={passengers <= 1}
                        onClick={() => setPassengers(passengers - 1)}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm select-none">{passengers}</span>
                      <button
                        type="button"
                        disabled={passengers >= 5}
                        onClick={() => setPassengers(passengers + 1)}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="shimmer-btn w-full md:w-auto px-10 py-4 bg-primary text-on-primary font-bold text-sm tracking-widest rounded-full uppercase hover:bg-primary-hover transition-all duration-300 shadow-[0_8px_25px_rgba(161,59,0,0.3)] flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Tìm chuyến xe</span>
                <MagnifyingGlass size={18} weight="bold" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Spacer to push down sections below the absolute search overlay */}
      <div className="h-[160px] md:h-[120px] bg-background" />

      {/* Trust Bar (Stats Section) */}
      <section className="py-16 bg-surface-container-low border-y border-outline-variant/30 select-none">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 text-center">
          {/* Stat 1 */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-2">
              <RoadHorizon size={28} />
            </div>
            <AnimatedCounter target={500} suffix="+" />
            <span className="text-sm font-medium text-on-surface-variant">Tuyến đường</span>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-2">
              <Users size={28} />
            </div>
            <AnimatedCounter target={2000000} suffix="+" />
            <span className="text-sm font-medium text-on-surface-variant">Khách hàng</span>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-2">
              <Star size={28} />
            </div>
            <span className="font-headline-lg text-primary font-bold">4.9★</span>
            <span className="text-sm font-medium text-on-surface-variant">Đánh giá</span>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-2">
              <Timer size={28} />
            </div>
            <AnimatedCounter target={98} suffix="%" />
            <span className="text-sm font-medium text-on-surface-variant">Đúng giờ</span>
          </div>

          {/* Stat 5 */}
          <div className="flex flex-col items-center gap-2 group col-span-2 lg:col-span-1">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-2">
              <Headset size={28} />
            </div>
            <span className="font-headline-lg text-primary font-bold">24/7</span>
            <span className="text-sm font-medium text-on-surface-variant">Hỗ trợ tận tâm</span>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section id="tuyen-duong" className="py-24 bg-background scroll-mt-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <div>
              <h2 className="font-headline-md text-3xl md:text-4xl text-on-surface font-bold">
                Tuyến phổ biến
              </h2>
              <div className="w-20 h-1 bg-primary mt-4 rounded-full"></div>
            </div>
            <button 
              onClick={() => navigate(ROUTES.ROUTES)}
              className="text-primary font-label-caps text-xs tracking-wider uppercase flex items-center gap-2 hover:gap-3.5 transition-all duration-300 group font-bold bg-transparent border-none cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>

          {loadingPopular ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {popularRoutes.map((route, i) => {
                const fromName = route.originCityName || 'Không xác định';
                const toName = route.destinationCityName || 'Không xác định';
                const title = route.name || 'Hành trình kết nối'; 
                const priceNum = (route as any).basePrice;
                const price = priceNum ? `${priceNum.toLocaleString()}₫` : null;
                const distanceKm = route.distanceKm;
                const durationMin = route.durationMinutes;
                const durationStr = durationMin ? `${Math.floor(durationMin / 60)}h${durationMin % 60 > 0 ? `${durationMin % 60}p` : ''}` : null;

                const handleRouteClick = () => {
                  navigate(`/tuyen-duong/${route.id}/chuyen-xe`);
                };

                return (
                  <div key={route.id || i} className="group cursor-pointer flex flex-col" onClick={handleRouteClick}>
                    {/* Route card */}
                    <div className="relative h-64 rounded-2xl overflow-hidden shadow-md mb-4 bg-[#1A1410] flex flex-col items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_#F4600C22_0%,_transparent_70%)] pointer-events-none" />
                      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
                        <span className="material-symbols-outlined text-primary text-4xl mb-3">directions_bus</span>
                        <p className="font-label-caps text-[10px] text-white/60 uppercase tracking-wider" style={{ letterSpacing: '0.05em' }}>
                          {fromName} → {toName}
                        </p>
                        <p className="font-headline-md text-base md:text-lg font-bold text-white leading-tight mt-2">{title}</p>
                        <div className="flex gap-3 mt-3 text-white/50 text-xs">
                          {distanceKm ? <span>{distanceKm} km</span> : null}
                          {distanceKm && durationStr ? <span>•</span> : null}
                          {durationStr ? <span>~{durationStr}</span> : null}
                        </div>
                      </div>
                      
                      {price && (
                        <div className="absolute top-4 right-4 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          Từ {price}
                        </div>
                      )}
                    </div>

                    {/* Animated Order Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRouteClick(); }}
                      className="w-full py-3 border border-primary/20 hover:border-primary text-primary rounded-xl font-semibold text-xs tracking-wider uppercase hover:bg-primary hover:text-on-primary transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 shadow-sm cursor-pointer"
                    >
                      Tìm chuyến
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Promotions Banner Section */}
      <section id="khuyen-mai" className="py-24 bg-[#1A1410] relative overflow-hidden scroll-mt-20 select-none">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 skew-x-[-20deg] translate-x-1/2 pointer-events-none z-0" />
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Promo copy */}
          <div className="flex flex-col gap-6 max-w-xl text-left">
            <span className="font-semibold text-xs tracking-widest bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full w-fit uppercase font-body" style={{ letterSpacing: '0.15em' }}>
              Khuyến mãi cực hot
            </span>
            <h2 
              className="font-headline-lg text-4xl md:text-5xl text-white italic font-bold leading-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Ưu đãi hè rực rỡ 2026
            </h2>
            <p className="text-white/70 text-base md:text-lg leading-relaxed">
              Giảm ngay 20% cho tất cả các tuyến đường miền Trung. Đặt vé ngay hôm nay để nhận ưu đãi có một không hai!
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <button 
                onClick={() => alert('Mã code: HE2026 đã được lưu!')}
                className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all duration-300 cursor-pointer"
              >
                Lấy mã ngay
              </button>
              <button 
                onClick={() => alert('Thông tin khuyến mãi: Áp dụng từ 01/06 đến 31/08/2026.')}
                className="px-8 py-3.5 border border-white/20 hover:border-white text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                Xem chi tiết
              </button>
            </div>
          </div>

          {/* Countdown Clock Card */}
          <div className="flex flex-col items-center gap-6 bg-white/5 border border-white/10 p-8 md:p-10 rounded-[2rem] backdrop-blur-md">
            <p className="text-white font-semibold text-xs tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
              KẾT THÚC SAU
            </p>
            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="hanh-trinh" className="py-24 bg-surface relative overflow-hidden scroll-mt-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 text-center">
          <h2 className="font-headline-md text-3xl md:text-4xl text-on-surface font-bold mb-16 md:mb-20">
            Hành trình 3 bước đơn giản
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10 lg:gap-20">
            {/* Step 1 */}
            <div className="flex flex-col items-center relative group">
              <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300 mb-8 relative z-10">
                <MagnifyingGlass size={38} weight="bold" />
              </div>
              <h3 className="font-headline-md text-lg md:text-xl font-bold mb-4">Tìm chuyến xe</h3>
              <p className="text-on-surface-variant max-w-xs text-sm leading-relaxed">
                Chọn điểm xuất phát, điểm đến và thời gian mong muốn của bạn.
              </p>
              {/* Dashed Connector */}
              <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 border-t-2 border-dashed border-primary/20 -z-0" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center relative group">
              <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300 mb-8 relative z-10">
                <ArmchairConnectorIcon />
              </div>
              <h3 className="font-headline-md text-lg md:text-xl font-bold mb-4">Chọn chỗ ngồi</h3>
              <p className="text-on-surface-variant max-w-xs text-sm leading-relaxed">
                Lựa chọn vị trí yêu thích trên sơ đồ xe trực quan và minh bạch.
              </p>
              {/* Dashed Connector */}
              <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 border-t-2 border-dashed border-primary/20 -z-0" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300 mb-8 relative z-10">
                <CalendarBlank size={38} weight="bold" />
              </div>
              <h3 className="font-headline-md text-lg md:text-xl font-bold mb-4">Thanh toán &amp; Nhận vé</h3>
              <p className="text-on-surface-variant max-w-xs text-sm leading-relaxed">
                Thanh toán linh hoạt và nhận vé điện tử qua Email/SMS tức thì.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="tien-ich" className="py-24 bg-surface-container-low scroll-mt-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-headline-md text-3xl md:text-4xl text-on-surface font-bold mb-4">
              Tại sao chọn Đi Về Nhà?
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Chúng tôi không chỉ bán vé xe, chúng tôi trao đi sự an tâm và niềm hạnh phúc khi trở về nhà.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/30 flex flex-col gap-5 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                <ShieldCheck size={28} />
              </div>
              <h4 className="font-headline-md text-lg font-bold">An toàn tuyệt đối</h4>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                Đội ngũ tài xế kinh nghiệm và quy trình bảo trì xe định kỳ khắt khe.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/30 flex flex-col gap-5 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                <Lightning size={28} />
              </div>
              <h4 className="font-headline-md text-lg font-bold">Tốc độ &amp; Đúng giờ</h4>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                Cam kết khởi hành và đến nơi đúng khung giờ đã đặt trước.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/30 flex flex-col gap-5 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                <WifiHigh size={28} />
              </div>
              <h4 className="font-headline-md text-lg font-bold">Tiện nghi cao cấp</h4>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                Wifi miễn phí, nước uống, khăn lạnh và ghế massage hiện đại.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-surface-container p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/30 flex flex-col gap-5 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                <ArrowsClockwise size={28} />
              </div>
              <h4 className="font-headline-md text-lg font-bold">Linh hoạt đổi trả</h4>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                Hỗ trợ đổi trả vé nhanh chóng trong 24h trước giờ khởi hành.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-24 bg-gradient-to-br from-surface-container-high to-surface-container-lowest overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">
          {/* Copy Column */}
          <div className="flex flex-col gap-6 md:gap-8 order-2 lg:order-1 text-left">
            <h2 className="font-headline-md text-4xl md:text-5xl leading-tight font-bold">
              Mang cả hành trình <br />
              <span className="text-primary italic">trong túi áo của bạn</span>
            </h2>
            <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
              Tải ngay ứng dụng Đi Về Nhà để nhận thông báo hành trình thời gian thực, tích điểm đổi quà và hưởng ưu đãi độc quyền hàng tuần.
            </p>
            <div className="flex flex-wrap gap-4 select-none">
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                className="flex items-center gap-3 bg-on-background hover:bg-black text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300 shadow-md"
              >
                <img 
                  alt="App Store" 
                  className="h-6 w-auto" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJBK_c19NiQ1wJWLMBsGnZkaVm8I9bNScrRP2-uxfmDlX1BzunARSNggHfHg129l7QTNqCcerESc-gtSHrAMWf6R641JjZtKrxav6OzgiHWoe6I-Jnkd_F0zP37dwbiLDImN2krsJ-_qasleJABbY0wHhlm-K18bo9gI3Whi0HpMSlD2Pi9LijPMzMvtAQPSiITTIS8SvIV7xfm9Se4POF-_45i73-MWDho2sg2xxBl396gPWTt2z-bnn1oR_V7O4fF7Oc1DIHaZE"
                />
              </a>
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                className="flex items-center gap-3 bg-on-background hover:bg-black text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300 shadow-md"
              >
                <img 
                  alt="Google Play" 
                  className="h-6 w-auto" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDB0dgsHawF062I8Ig_Jimit8E3htCDlyad5DLi9A9ggKfN-HC447lvVVp57ZkXwnNMSvNEVpAIJJOvdKp3mcYwGOcZX8SPO7rdhTaLvdsagd65gPvvPNra58w9VVm7SXe9CAptz6m26X7KhP0QGBGHAYggENPB5mL6XDnZ_uyruLeK-6NqIQJGTmudEsUNZmydyebKJUrd8vdHrMdw8A_-k6EAvyD1uRiwWKbgso-O--WVtYWufGFcfcnlmu0ljdPPKy7WfQB-LHU"
                />
              </a>
            </div>
            {/* Profiles stack */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex -space-x-3 select-none">
                <img alt="User avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2Q7cW-WysQlaOA_eyYOJpod869r-qKILsQeBidB1Nrzs16cHW7PiGWkYn96gBUvk97mxo3nKU3yeAwB4UP7AOuA5wtxnTgBctxMu4-qOs3gGXN2Vh1Zhpe9xHcu0VDYxPqZFH1AqJXSwK8AzmgHUmjJgi-ASkiR5zcGoj-jS-M6u5OD-ssSULentFfNTBqvBB8owoha0Akoa6jWSoMALSvzXjDE0gzDNuYF8i8QSGgsbjkuQxZp81m80Qfuhqx39NINQ9tsUrpzg" />
                <img alt="User avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMtNzWQBIuzZHUUKlliQXszthF1jZsAu_iDCzxYnw8zolYQWW8WVWs7NOmehjzyGaj5dy_G756slaRoV013NEHjMGjT0sFxUc5Oo44Agla7FMnlCP66NV3EiPi6ha8JS2ajc48X2rnGX1ILt8Rbif_-2rQeHVJEqsjqdsWj9xZqYax35doIcHpZRTSydSvlF5yex5Omw3_7_7ssHxf4BrAcasX6F6VE1EywUQJqTvo_y_0CO4cb1Ocy9g4-2oEDzJspImgMprarmQ" />
                <img alt="User avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_FrWEekITSVSBaguKmGKdob76ZX2YTcWxSx8qQ3TOfUjy0MvyIQ1suBirJH99aMJSNUi6hUWwdmOKJmmtU3T6i55Cxrl108ErVZNbUZXUPZfhovTB-yEhvrPiHGuAYxmxoZBpsmhRKrZr5rPI8qmnx2cUY5Nruq-h7KN7oQVon5yuYVD0eimS7L1yJEO61mTS2HJ_MxWa2cp6WKZXWELXuqBli4jdOq_aqCczUNmV57VENgplXhuTKtaPxE0kXsOvXf41cJT0ZK0" />
              </div>
              <p className="text-sm text-on-surface-variant font-bold">Hơn 50,000+ người đã tải xuống</p>
            </div>
          </div>

          {/* Smartphone Mockup */}
          <div className="relative order-1 lg:order-2 flex justify-center">
            <div className="w-72 h-[580px] bg-on-background rounded-[3rem] border-[8px] border-on-surface-variant shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-on-background rounded-b-2xl z-20" />
              <img 
                alt="App Screenshot" 
                className="w-full h-full object-cover select-none pointer-events-none" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7DEGQ7m8X8faMrCOLkBJZEPLlVkposJjQufDnC7HdwCPH7YT7e28ggMR0osX-lFmTS68ddPXPcEiBsaAF-jqhxPg6Zg6nup40EvAWvtHcgfQuKU9Tr-pahWB1VM_m31MAOHjPV3OeUV_VNLezvmfv7-qc-bnAikRnRh8JojaZqS8pDRPgUlTqMCIv9pqEJtFmVtRTg8xeiIGWB1Fjfcv3mk4TFkSTlgiSKPrgDHOtx5BsSRnYCzaCXrk5SOsT06BR9zTkMLtgJOg" 
              />
            </div>
            {/* Glow Ambient behind phone */}
            <div className="absolute -z-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Testimonials (Customer Reviews) Section */}
      <section className="py-24 bg-background">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <h2 
            className="font-headline-md text-3xl md:text-4xl text-center mb-16 italic font-bold"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Khách hàng nói về chúng tôi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((test, index) => (
              <div 
                key={index}
                className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 flex flex-col gap-6 relative shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
              >
                {/* Quotes symbol */}
                <Quotes 
                  size={54} 
                  weight="fill" 
                  className="absolute top-6 right-6 text-primary/5 group-hover:text-primary/10 transition-colors duration-300 pointer-events-none" 
                />

                {/* Rating stars */}
                <div className="flex text-secondary-container gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      weight={i < test.stars ? 'fill' : 'regular'} 
                      className={i < test.stars ? 'text-amber-500' : 'text-slate-200'}
                    />
                  ))}
                </div>

                {/* Feedback */}
                <p className="text-on-surface italic text-sm leading-relaxed">
                  "{test.content}"
                </p>

                {/* Author Info */}
                <div className="mt-auto flex items-center gap-4 border-t border-slate-50 pt-4">
                  <img 
                    alt={test.author} 
                    src={test.avatar} 
                    className="w-12 h-12 rounded-full object-cover select-none pointer-events-none"
                  />
                  <div>
                    <h5 className="font-bold text-sm text-on-surface">{test.author}</h5>
                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">{test.route}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-24 bg-[#1A1410] relative select-none">
        <div className="max-w-[900px] mx-auto px-6 md:px-8 text-center newsletter-glow bg-white/5 border border-white/10 rounded-[3rem] py-16 backdrop-blur-md">
          <h2 className="font-headline-md text-white text-3xl md:text-4xl font-bold mb-4">
            Đừng bỏ lỡ ưu đãi nào
          </h2>
          <p className="text-white/60 mb-10 max-w-lg mx-auto text-sm leading-relaxed">
            Đăng ký nhận bản tin để cập nhật những chuyến xe sớm nhất và các mã giảm giá bí mật chỉ dành riêng cho bạn.
          </p>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              alert('Đăng ký nhận bản tin thành công!');
              (e.target as HTMLFormElement).reset();
            }}
            className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Địa chỉ email của bạn..."
              className="flex-1 px-8 py-4 bg-white/5 border border-white/10 focus:border-primary rounded-full text-white focus:outline-none placeholder:text-white/30 text-sm transition-all duration-300"
            />
            <button
              type="submit"
              className="shimmer-btn px-10 py-4 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300 whitespace-nowrap cursor-pointer shadow-md"
            >
              Đăng ký ngay
            </button>
          </form>
          <p className="text-white/20 text-[10px] uppercase tracking-wider mt-6 font-semibold">
            Chúng tôi cam kết bảo mật thông tin và không spam.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Specialized SVG replacement for Material event_seat icon
const ArmchairConnectorIcon: React.FC = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 256 256" 
      className="w-[38px] h-[38px]" 
      fill="currentColor"
    >
      <path d="M208,80H48a16,16,0,0,0-16,16v80a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm0,96H48V96H208v80ZM88,112a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,112Zm0,32a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,142Z" />
    </svg>
  );
};