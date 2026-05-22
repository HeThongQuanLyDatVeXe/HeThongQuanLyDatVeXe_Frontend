import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { ROUTES } from '../constants/routes';
import { publicTripService } from '../services/trip-service/publicTripService';
import type { TripResponse } from '../types/trip-service/Trip';
import { Bus, CheckCircle, Star, ForkKnife, Bed, Drop, Usb, MapPin } from '@phosphor-icons/react';

export const TripDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [passengers, setPassengers] = useState(1);

    const [trip, setTrip] = useState<TripResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Smooth back to top and fetch data on page load
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const fetchTripDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const res = await publicTripService.getTripById(id);
                const payload = res.data.result || res.data.data;
                if (payload) {
                    setTrip(payload);
                }
            } catch (error) {
                console.error("Failed to fetch trip details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTripDetails();
    }, [id]);

    // Fallback default details if the route is not found
    const defaultRoute = {
        id: 'default',
        from: 'Hà Nội',
        to: 'TP. Hồ Chí Minh',
        title: 'Hành trình di sản xuyên Việt',
        description: 'Tận hưởng chuyến đi xuyên suốt chiều dài đất nước với dịch vụ đẳng cấp và an toàn nhất.',
        duration: '32 tiếng di chuyển',
        price: 850000,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLxBiWfyIkOSff-4i5wxLaMK78pe9kfMPrqzOxUs_dFG0QyUINzEGrSJ0lk6tAzMo2kyxDgqPPJ7cy9B__dPyYiWiOt6J4oTHkXfBo6DdVV_xbZr4PK9pzldNHl8PKSvTiw9rIRhqI1SyHtr05HZrw8leVJZoLNH9QvAr3EIE5NB6o3zgiaWdcgHxKEDBbUX-QqiUwUNLZB_q7xr924DOp_JeOkPwUPDCd63RkMnX1xccukSZo29QIA_-JZr1LV1zW2MyOCE5TBdQ',
        vehicleType: 'Giường nằm cao cấp' as const,
        operator: 'Phương Trang Lines',
        rating: '4.8 (1.2k đánh giá)',
        onTimeRate: '98%',
        licensePlate: '29B-123.45',
        driverName: 'Nguyễn Văn A',
        driverAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCZxf62S9I9m2-P4u-TNZuGrLkl8WUlgQizhvlL1guwYbL-ZJ1BqFajUfg8BJqJiG5appsQ3DMgzZdrC1sA7ldjzmioHyvW9XUZfYKgMzeVE_1CeVKI31dBA_X-mgJIVEhhsWhtWE3w-hEBZ3TS744HASHOugiXk3y2uUO5juOOaMpmvNFSnciC3Ak2vqpTpWckSLvkeQPiGgA4La5pzCKLbXpQ1TQV26Nj5Zgp9_HfnP2au8DwPNmaJBUoe8tXlhn9vsIPunX4w8'
    };

    const currentTrip = trip 
        ? {
            id: trip.id,
            from: trip.route?.originCityName || 'Không xác định',
            to: trip.route?.destinationCityName || 'Không xác định',
            title: trip.route?.name || 'Hành trình kết nối',
            description: trip.route?.description || 'Tận hưởng chuyến đi xuyên suốt với dịch vụ đẳng cấp và an toàn nhất.',
            duration: trip.route?.durationMinutes ? `${Math.floor(trip.route.durationMinutes / 60)} giờ ${trip.route.durationMinutes % 60} phút` : 'N/A',
            price: trip.prices?.[0]?.basePrice || 450000,
            image: 'https://placehold.co/400x300/F4600C/FFFFFF/png?text=' + encodeURIComponent(trip.route?.destinationCityName || 'Route'),
            vehicleType: trip.vehicle?.name || 'Giường nằm cao cấp',
            operator: 'Đi Về Nhà Lines',
            rating: '4.8 (1.2k đánh giá)',
            onTimeRate: '98%',
            licensePlate: trip.vehicle?.licensePlate || '29B-123.45',
            driverName: 'Nguyễn Văn A', // Driver info not directly in trip, mock for now
            driverAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCZxf62S9I9m2-P4u-TNZuGrLkl8WUlgQizhvlL1guwYbL-ZJ1BqFajUfg8BJqJiG5appsQ3DMgzZdrC1sA7ldjzmioHyvW9XUZfYKgMzeVE_1CeVKI31dBA_X-mgJIVEhhsWhtWE3w-hEBZ3TS744HASHOugiXk3y2uUO5juOOaMpmvNFSnciC3Ak2vqpTpWckSLvkeQPiGgA4La5pzCKLbXpQ1TQV26Nj5Zgp9_HfnP2au8DwPNmaJBUoe8tXlhn9vsIPunX4w8'
          }
        : defaultRoute;

    // Detailed stops itinerary matching the route dynamically or static fallback
    const itinerary = [
        {
            name: currentTrip.from === 'Hà Nội' ? 'Bến xe Mỹ Đình' : `Bến xe ${currentTrip.from}`,
            time: '06:30',
            location: currentTrip.from,
            details: 'Khởi hành chuyến đi',
            type: 'major'
        },
        {
            name: currentTrip.from === 'Hà Nội' ? 'Bến xe Yên Nghĩa (Hà Đông)' : `Điểm đón Quốc Lộ`,
            time: '07:15',
            location: 'Đón khách dọc đường',
            details: 'Đón khách',
            type: 'minor'
        },
        {
            name: 'Trạm dừng nghỉ Ninh Bình',
            time: '09:30',
            location: 'Nghỉ giải lao 30 phút',
            details: 'Nghỉ giải lao',
            type: 'rest',
            icon: <ForkKnife size={14} className="mr-1" />
        },
        {
            name: 'Quán cơm Gà Đèo Ngang',
            time: '12:30',
            location: 'Nghỉ ăn trưa 45 phút',
            details: 'Ăn trưa',
            type: 'rest',
            icon: <ForkKnife size={14} className="mr-1" />
        },
        {
            name: currentTrip.to === 'TP. Hồ Chí Minh' ? 'Bến xe Miền Đông mới' : `Bến xe ${currentTrip.to}`,
            time: '22:30',
            location: currentTrip.to,
            details: 'Điểm kết thúc hành trình',
            type: 'major'
        }
    ];

    const handleSelectSeat = () => {
        navigate(`/tuyen-duong/${currentTrip.id}/chon-ghe`, {
            state: { passengers, currentTrip }
        });
    };

    return (
        <div className="min-h-screen bg-background text-on-background font-body select-none">
            <Header />

            {/* Grain Overlay matching design */}
            <div className="grain-overlay" />

            <main className="flex-grow container mx-auto max-w-container-max px-gutter py-lg pt-28">
                {loading ? (
                    <div className="flex justify-center items-center py-20 min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Breadcrumb */}
                        <div className="mb-md flex items-center space-x-2 text-on-surface-variant font-label-sm text-sm">
                    <span className="cursor-pointer hover:text-primary" onClick={() => navigate(ROUTES.HOME)}>Trang chủ</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span className="cursor-pointer hover:text-primary" onClick={() => navigate(ROUTES.ROUTES)}>Tuyến đường</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span className="text-on-surface font-semibold">{currentTrip.from} - {currentTrip.to}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-lg">
                    {/* Left Column (65%) */}
                    <div className="w-full lg:w-[65%] space-y-md">
                        {/* Hero Trip Header */}
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_8px_20px_rgba(92,64,51,0.03)] p-md text-left">
                            <div className="flex justify-between items-start border-b border-outline-variant pb-sm mb-sm">
                                <div className="flex items-center space-x-md">
                                    <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant">
                                        <img 
                                            alt="Bus Operator Logo" 
                                            className="w-full h-full object-cover" 
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN3TuJQYd6WUUeFrBuoJyMsXUr2RY-rc0_GaPHYxibEIYPgMbOWHSo1mhQUse81AAtyPtWw-17HaB7FVemC9AZ3fqOby4ZA3R7PLXEdcM-0DVgJ1Wj1GdMAhEZz4yhdHjYebL-f1rOTpPY7wqT-xWHnGAFRtvnRXVgAwnCoHh_Aa1lVKnqCgkr69tc3tMV-OemgvefQmsywo0WowvYeFEBbQzWY8mlMQpGg_o6fZw_p2SYkUhnH_1aL7E7ywyUB6C6XX24YIxM7PE" 
                                        />
                                    </div>
                                    <div>
                                        <h1 className="typo-headline-md text-headline-md text-on-surface">{currentTrip.operator}</h1>
                                        <div className="flex items-center space-x-2 mt-xs">
                                            <div className="flex items-center text-secondary-container">
                                                <Star size={16} weight="fill" className="text-amber-500" />
                                                <span className="typo-label-sm text-sm text-on-surface ml-1">{currentTrip.rating}</span>
                                            </div>
                                            <span className="text-outline-variant">•</span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-low text-primary border border-outline-variant text-xs">
                                                <CheckCircle size={14} className="mr-1" /> Đúng giờ {currentTrip.onTimeRate}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-sm">
                                {/* Departure */}
                                <div className="text-center w-1/4">
                                    <div className="typo-label-caps text-xs text-on-surface-variant mb-xs">KHỞI HÀNH</div>
                                    <div className="typo-display-hero text-3xl font-bold text-on-surface">06:30</div>
                                    <div className="typo-body-md text-sm text-on-surface-variant mt-1">{currentTrip.from === 'Hà Nội' ? 'Bến xe Mỹ Đình' : `Bến xe ${currentTrip.from}`}</div>
                                </div>

                                {/* Journey Path */}
                                <div className="w-2/4 flex flex-col items-center justify-center px-md">
                                    <div className="typo-label-sm text-sm text-on-surface-variant mb-2">~{currentTrip.duration}</div>
                                    <div className="w-full relative flex items-center">
                                        <div className="h-0.5 w-full border-t-2 border-dashed border-outline-variant relative"></div>
                                        <Bus size={24} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary bg-surface-container-lowest px-1" />
                                    </div>
                                    <div className="typo-label-sm text-xs text-primary mt-2 uppercase tracking-wider">Chuyến đi dài</div>
                                </div>

                                {/* Arrival */}
                                <div className="text-center w-1/4">
                                    <div className="typo-label-caps text-xs text-on-surface-variant mb-xs">ĐẾN NƠI</div>
                                    <div className="typo-display-hero text-3xl font-bold text-on-surface">22:30</div>
                                    <div className="typo-label-sm text-xs text-on-surface-variant mt-xs">+1 ngày</div>
                                    <div className="typo-body-md text-sm text-on-surface-variant mt-1">{currentTrip.to === 'TP. Hồ Chí Minh' ? 'Bến xe Miền Đông' : `Bến xe ${currentTrip.to}`}</div>
                                </div>
                            </div>
                        </div>

                        {/* Bus Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                            {/* Type */}
                            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-sm flex items-center space-x-md text-left">
                                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                                    <Bus size={24} />
                                </div>
                                <div>
                                    <div className="typo-label-sm text-xs text-on-surface-variant">Loại xe</div>
                                    <div className="typo-body-lg text-base font-semibold text-on-surface">{currentTrip.vehicleType}</div>
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-sm flex items-center space-x-md text-left">
                                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <div className="typo-label-sm text-xs text-on-surface-variant">Tiện ích</div>
                                    <div className="flex space-x-2 mt-1 text-on-surface">
                                        <div title="Sạc USB"><Usb size={18} className="text-on-surface-variant" /></div>
                                        <div title="Chăn"><Bed size={18} className="text-on-surface-variant" /></div>
                                        <div title="Nước uống"><Drop size={18} className="text-on-surface-variant" /></div>
                                    </div>
                                </div>
                            </div>

                            {/* Plate */}
                            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-sm flex items-center space-x-md text-left">
                                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <div className="typo-label-sm text-xs text-on-surface-variant">Biển số xe</div>
                                    <div className="mt-1 inline-block border-2 border-on-surface rounded bg-surface-container-lowest px-2 py-0.5">
                                        <span className="typo-body-lg text-sm font-bold text-on-surface tracking-widest">{currentTrip.licensePlate}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Driver */}
                            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-sm flex items-center space-x-md text-left">
                                <div className="w-12 h-12 rounded-full bg-surface-container-high overflow-hidden shrink-0">
                                    <img alt="Driver" className="w-full h-full object-cover" src={currentTrip.driverAvatar} />
                                </div>
                                <div>
                                    <div className="typo-label-sm text-xs text-on-surface-variant">Tài xế</div>
                                    <div className="typo-body-lg text-base font-semibold text-on-surface">{currentTrip.driverName}</div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Itinerary */}
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_8px_20px_rgba(92,64,51,0.03)] p-md text-left">
                            <h2 className="typo-headline-md text-xl font-bold text-on-surface mb-md">Lộ trình chi tiết</h2>
                            <div className="relative ml-4 border-l-2 border-outline-variant space-y-lg pb-4">
                                {itinerary.map((stop, index) => (
                                    <div key={index} className="relative pl-sm">
                                        {stop.type === 'major' ? (
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-surface-container-lowest"></div>
                                        ) : stop.type === 'rest' ? (
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-secondary-container border-4 border-surface-container-lowest"></div>
                                        ) : (
                                            <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-outline-variant border-2 border-surface-container-lowest"></div>
                                        )}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className={`font-semibold text-on-surface ${stop.type === 'major' ? 'text-base' : 'text-sm'}`}>{stop.name}</div>
                                                <div className="typo-label-sm text-xs text-on-surface-variant mt-xs flex items-center">
                                                    {stop.icon}
                                                    {stop.location}
                                                </div>
                                            </div>
                                            <div className="text-sm font-semibold text-primary">{stop.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (35% Sticky) */}
                    <div className="w-full lg:w-[35%] relative">
                        <div className="sticky top-28 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_8px_20px_rgba(92,64,51,0.03)] p-md flex flex-col text-left">
                            <h3 className="typo-headline-md text-lg font-bold text-on-surface mb-md">Tóm tắt chuyến đi</h3>
                            
                            <div className="space-y-sm mb-md flex-grow">
                                <div className="flex justify-between items-center border-b border-outline-variant pb-xs">
                                    <span className="typo-label-sm text-xs text-on-surface-variant">Tuyến đường</span>
                                    <span className="typo-body-md text-sm text-on-surface font-semibold">{currentTrip.from} - {currentTrip.to}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-outline-variant pb-xs mt-2">
                                    <span className="typo-label-sm text-xs text-on-surface-variant">Ngày đi</span>
                                    <span className="typo-body-md text-sm text-on-surface font-semibold">Thứ 6, 24/11/2026</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-outline-variant pb-xs mt-2">
                                    <span className="typo-label-sm text-xs text-on-surface-variant">Loại xe</span>
                                    <span className="typo-body-md text-sm text-on-surface">{currentTrip.vehicleType}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-outline-variant pb-xs mt-2">
                                    <span className="typo-label-sm text-xs text-on-surface-variant">Hành khách</span>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            disabled={passengers <= 1}
                                            onClick={() => setPassengers(passengers - 1)}
                                            className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"
                                        >
                                            -
                                        </button>
                                        <span className="typo-body-md text-sm text-on-surface w-4 text-center font-bold">{passengers}</span>
                                        <button 
                                            disabled={passengers >= 5}
                                            onClick={() => setPassengers(passengers + 1)}
                                            className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center pt-xs mt-6">
                                    <span className="typo-body-lg text-sm text-on-surface font-medium">Tổng tạm tính</span>
                                    <span className="typo-headline-md text-xl font-bold text-primary">{(currentTrip.price * passengers).toLocaleString()}đ</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleSelectSeat}
                                className="w-full bg-primary text-on-primary font-body-lg text-sm font-semibold py-3.5 rounded-xl hover:bg-primary-hover transition-all duration-300 shadow-[0_8px_25px_rgba(161,59,0,0.2)] flex items-center justify-center mt-sm uppercase tracking-wider"
                            >
                                Chọn ghế
                                <span className="material-symbols-outlined ml-2 text-sm font-bold">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};
