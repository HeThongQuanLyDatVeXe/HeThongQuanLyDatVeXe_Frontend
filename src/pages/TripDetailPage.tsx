import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { ROUTES } from '../constants/routes';
import { publicTripService } from '../services/trip-service/publicTripService';
import type { TripResponse } from '../types/trip-service/Trip';
import { Bus, CheckCircle, MapPin } from '@phosphor-icons/react';

export const TripDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [passengers, setPassengers] = useState(1);

    const [trip, setTrip] = useState<TripResponse | null>(null);
    const [loading, setLoading] = useState(true);

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

    // ── Helper functions ─────────────────────────────────────────────────
    const formatTime = (isoStr: string | undefined) => {
        if (!isoStr) return '--:--';
        return new Date(isoStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoStr: string | undefined) => {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return `${dayNames[d.getDay()]}, ${d.toLocaleDateString('vi-VN')}`;
    };

    const isNextDay = (dep: string | undefined, arr: string | undefined) => {
        if (!dep || !arr) return false;
        return new Date(arr).getDate() !== new Date(dep).getDate();
    };

    // ── Derived data from trip (100% from API) ──────────────────────────
    const from = trip?.route?.originCityName || 'Đang tải...';
    const to = trip?.route?.destinationCityName || 'Đang tải...';
    const routeName = trip?.route?.name || `${from} - ${to}`;
    const durationMin = trip?.route?.durationMinutes || 0;
    const durationStr = durationMin > 0
        ? `${Math.floor(durationMin / 60)} giờ ${durationMin % 60 > 0 ? `${durationMin % 60} phút` : ''}`
        : 'Đang cập nhật';
    const distanceKm = trip?.route?.distanceKm || 0;

    const vehicleType = trip?.vehicle?.vehicleTypeName || 'Đang cập nhật';
    const vehicleBrand = trip?.vehicle?.brand || '';
    const vehicleModel = trip?.vehicle?.model || '';
    const vehicleFullName = [vehicleBrand, vehicleModel].filter(Boolean).join(' ') || vehicleType;
    const licensePlate = trip?.vehicle?.licensePlate || 'Đang cập nhật';
    const totalSeats = trip?.vehicle?.totalSeats || trip?.totalSeats || 0;
    const availableSeats = trip?.availableSeats ?? 0;

    const basePrice = trip?.prices?.[0]?.basePrice || 0;
    const finalPrice = trip?.prices?.[0]?.finalPrice || basePrice;
    const seatType = trip?.prices?.[0]?.seatType || '';
    const currency = trip?.prices?.[0]?.currency || 'VND';

    const tripStatus = trip?.status || 'SCHEDULED';
    const tripCode = trip?.tripCode || '';

    const handleSelectSeat = () => {
        if (!trip) return;
        navigate(`/tuyen-duong/${trip.id}/chon-ghe`, {
            state: {
                passengers,
                currentTrip: {
                    id: trip.id,
                    from,
                    to,
                    routeName,
                    duration: durationStr,
                    price: finalPrice,
                    vehicleType,
                    vehicleFullName,
                    licensePlate,
                    totalSeats,
                    availableSeats,
                    departureDatetime: trip.departureDatetime,
                    arrivalDatetime: trip.arrivalDatetime,
                    tripCode,
                    seatType,
                    currency,
                }
            }
        });
    };

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
                            <div className="w-full lg:w-[65%] space-y-md">
                                {/* Hero Trip Header */}
                                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_8px_20px_rgba(92,64,51,0.03)] p-md text-left">
                                    {/* Trip Code & Status */}
                                    <div className="flex justify-between items-start border-b border-outline-variant pb-sm mb-sm">
                                        <div className="flex items-center space-x-md">
                                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <Bus size={28} className="text-primary" />
                                            </div>
                                            <div>
                                                <h1 className="typo-headline-md text-headline-md text-on-surface">{routeName}</h1>
                                                <div className="flex items-center space-x-2 mt-xs flex-wrap">
                                                    {tripCode && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant border border-outline-variant text-xs font-mono">
                                                            #{tripCode}
                                                        </span>
                                                    )}
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        tripStatus === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                        tripStatus === 'BOARDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                        tripStatus === 'ON_ROUTE' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                        tripStatus === 'COMPLETED' ? 'bg-slate-50 text-slate-600 border border-slate-200' :
                                                        tripStatus === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                        'bg-surface-container-low text-on-surface-variant border border-outline-variant'
                                                    }`}>
                                                        {tripStatus === 'SCHEDULED' ? 'Đã lên lịch' :
                                                         tripStatus === 'BOARDING' ? 'Đang lên xe' :
                                                         tripStatus === 'ON_ROUTE' ? 'Đang chạy' :
                                                         tripStatus === 'COMPLETED' ? 'Hoàn thành' :
                                                         tripStatus === 'CANCELLED' ? 'Đã hủy' :
                                                         tripStatus === 'DELAYED' ? 'Trễ giờ' : tripStatus}
                                                    </span>
                                                    <span className="text-outline-variant">•</span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-low text-secondary border border-outline-variant text-xs">
                                                        <CheckCircle size={14} className="mr-1" /> Còn {availableSeats}/{totalSeats} ghế
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Display */}
                                    <div className="flex items-center justify-between py-sm">
                                        <div className="text-center w-1/4">
                                            <div className="typo-label-caps text-xs text-on-surface-variant mb-xs">KHỞI HÀNH</div>
                                            <div className="typo-display-hero text-3xl font-bold text-on-surface">{formatTime(trip.departureDatetime)}</div>
                                            <div className="typo-body-md text-sm text-on-surface-variant mt-1">Bến xe {from}</div>
                                        </div>

                                        <div className="w-2/4 flex flex-col items-center justify-center px-md">
                                            <div className="typo-label-sm text-sm text-on-surface-variant mb-2">~{durationStr}</div>
                                            <div className="w-full relative flex items-center">
                                                <div className="h-0.5 w-full border-t-2 border-dashed border-outline-variant relative"></div>
                                                <Bus size={24} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary bg-surface-container-lowest px-1" />
                                            </div>
                                            {distanceKm > 0 && (
                                                <div className="typo-label-sm text-xs text-primary mt-2 uppercase tracking-wider">{distanceKm} km</div>
                                            )}
                                        </div>

                                        <div className="text-center w-1/4">
                                            <div className="typo-label-caps text-xs text-on-surface-variant mb-xs">ĐẾN NƠI</div>
                                            <div className="typo-display-hero text-3xl font-bold text-on-surface">{formatTime(trip.arrivalDatetime)}</div>
                                            {isNextDay(trip.departureDatetime, trip.arrivalDatetime) && (
                                                <div className="typo-label-sm text-xs text-on-surface-variant mt-xs">+1 ngày</div>
                                            )}
                                            <div className="typo-body-md text-sm text-on-surface-variant mt-1">Bến xe {to}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-sm flex items-center space-x-md text-left">
                                        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                                            <Bus size={24} />
                                        </div>
                                        <div>
                                            <div className="typo-label-sm text-xs text-on-surface-variant">Loại xe</div>
                                            <div className="typo-body-lg text-base font-semibold text-on-surface">{vehicleType}</div>
                                            {vehicleBrand && (
                                                <div className="typo-label-sm text-xs text-on-surface-variant">{vehicleFullName}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-sm flex items-center space-x-md text-left">
                                        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <div className="typo-label-sm text-xs text-on-surface-variant">Biển số xe</div>
                                            <div className="mt-1 inline-block border-2 border-on-surface rounded bg-surface-container-lowest px-2 py-0.5">
                                                <span className="typo-body-lg text-sm font-bold text-on-surface tracking-widest">{licensePlate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-sm flex items-center space-x-md text-left">
                                        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                                            <span className="material-symbols-outlined text-primary">airline_seat_recline_extra</span>
                                        </div>
                                        <div>
                                            <div className="typo-label-sm text-xs text-on-surface-variant">Số ghế</div>
                                            <div className="typo-body-lg text-base font-semibold text-on-surface">{totalSeats} chỗ</div>
                                            <div className="typo-label-sm text-xs text-secondary">Còn trống: {availableSeats} ghế</div>
                                        </div>
                                    </div>

                                    {seatType && (
                                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-sm flex items-center space-x-md text-left">
                                            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                                                <span className="material-symbols-outlined text-primary">chair</span>
                                            </div>
                                            <div>
                                                <div className="typo-label-sm text-xs text-on-surface-variant">Loại ghế</div>
                                                <div className="typo-body-lg text-base font-semibold text-on-surface">{seatType}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Itinerary */}
                                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_8px_20px_rgba(92,64,51,0.03)] p-md text-left">
                                    <h2 className="typo-headline-md text-xl font-bold text-on-surface mb-md">Lộ trình chi tiết</h2>
                                    <div className="relative ml-4 border-l-2 border-outline-variant space-y-lg pb-4">
                                        {/* Departure */}
                                        <div className="relative pl-sm">
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-surface-container-lowest"></div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-semibold text-on-surface text-base">Bến xe {from}</div>
                                                    <div className="typo-label-sm text-xs text-on-surface-variant mt-xs">{from}</div>
                                                </div>
                                                <div className="text-sm font-semibold text-primary">{formatTime(trip.departureDatetime)}</div>
                                            </div>
                                        </div>
                                        {/* Arrival */}
                                        <div className="relative pl-sm">
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-surface-container-lowest"></div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-semibold text-on-surface text-base">Bến xe {to}</div>
                                                    <div className="typo-label-sm text-xs text-on-surface-variant mt-xs">{to}</div>
                                                </div>
                                                <div className="text-sm font-semibold text-primary">{formatTime(trip.arrivalDatetime)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Breakdown (if multiple price tiers) */}
                                {trip.prices && trip.prices.length > 0 && (
                                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_8px_20px_rgba(92,64,51,0.03)] p-md text-left">
                                        <h2 className="typo-headline-md text-xl font-bold text-on-surface mb-md">Bảng giá</h2>
                                        <div className="space-y-3">
                                            {trip.prices.map((p, idx) => (
                                                <div key={p.id || idx} className="flex justify-between items-center py-2 border-b border-outline-variant last:border-b-0">
                                                    <div>
                                                        <span className="font-semibold text-on-surface">{p.seatType || 'Ghế tiêu chuẩn'}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        {p.basePrice !== p.finalPrice ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-on-surface-variant line-through">{Number(p.basePrice).toLocaleString()}đ</span>
                                                                <span className="font-bold text-primary">{Number(p.finalPrice).toLocaleString()}đ</span>
                                                            </div>
                                                        ) : (
                                                            <span className="font-bold text-primary">{Number(p.finalPrice).toLocaleString()}đ</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {trip.notes && (
                                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md text-left">
                                        <h2 className="typo-headline-md text-lg font-bold text-on-surface mb-sm">Ghi chú</h2>
                                        <p className="text-sm text-on-surface-variant leading-relaxed">{trip.notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column (35% Sticky) */}
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
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};
