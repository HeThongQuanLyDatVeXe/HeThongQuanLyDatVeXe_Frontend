import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { Button } from '../components/common/Button';
import { ROUTES } from '../constants/routes';

const POPULAR_ROUTES = [
    { from: 'Hà Nội', to: 'TP. Hồ Chí Minh', price: '450.000đ', duration: '36h' },
    { from: 'TP. Hồ Chí Minh', to: 'Đà Lạt', price: '180.000đ', duration: '7h' },
    { from: 'Hà Nội', to: 'Đà Nẵng', price: '280.000đ', duration: '14h' },
    { from: 'TP. Hồ Chí Minh', to: 'Vũng Tàu', price: '90.000đ', duration: '2h' },
    { from: 'Hà Nội', to: 'Sapa', price: '220.000đ', duration: '6h' },
    { from: 'TP. Hồ Chí Minh', to: 'Cần Thơ', price: '120.000đ', duration: '3h' },
];

const FEATURES = [
    {
        icon: '🎫',
        title: 'Đặt vé nhanh chóng',
        desc: 'Chỉ mất 2 phút để hoàn thành đặt vé. Nhận xác nhận tức thì qua email.',
    },
    {
        icon: '🔒',
        title: 'Thanh toán an toàn',
        desc: 'Hỗ trợ nhiều hình thức thanh toán. Bảo mật tuyệt đối mọi giao dịch.',
    },
    {
        icon: '📍',
        title: 'Theo dõi chuyến đi',
        desc: 'Cập nhật thời gian thực vị trí xe. Không bao giờ lỡ chuyến đi của bạn.',
    },
    {
        icon: '💸',
        title: 'Giá tốt nhất',
        desc: 'Cam kết giá vé cạnh tranh. Nhiều ưu đãi hấp dẫn dành cho khách hàng thân thiết.',
    },
];

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');

    return (
        <div className="min-h-screen">
            <Header />

            {/* Hero */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        background: 'linear-gradient(135deg, #1e2330 0%, #2d3748 40%, #4a3728 100%)',
                    }}
                />
                {/* Decorative circles */}
                <div className="absolute top-20 right-10 w-80 h-80 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #e8820c, transparent)' }} />
                <div className="absolute bottom-10 left-20 w-60 h-60 rounded-full opacity-5"
                    style={{ background: 'radial-gradient(circle, #e8820c, transparent)' }} />
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 0, transparent 50%), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
                        backgroundSize: '60px 60px',
                    }}
                />

                <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16 w-full">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-amber-300 text-xs font-medium">Nền tảng đặt vé xe hàng đầu Việt Nam</span>
                        </div>

                        <h1
                            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Hành trình
                            <br />
                            <span className="text-amber-400">dễ dàng</span>
                            <br />
                            hơn bao giờ
                        </h1>

                        <p className="text-slate-300 text-lg mb-10 leading-relaxed">
                            Đặt vé xe khách online nhanh chóng — hơn 500 tuyến đường,
                            hàng nghìn chuyến xe mỗi ngày, giá tốt nhất thị trường.
                        </p>
                    </div>

                    {/* Search box */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-3xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-white/70 text-xs font-medium uppercase tracking-wide">Điểm đi</label>
                                <input
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    placeholder="Hà Nội, TPHCM..."
                                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 text-sm outline-none focus:border-amber-400 transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-white/70 text-xs font-medium uppercase tracking-wide">Điểm đến</label>
                                <input
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    placeholder="Đà Nẵng, Đà Lạt..."
                                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 text-sm outline-none focus:border-amber-400 transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-white/70 text-xs font-medium uppercase tracking-wide">Ngày đi</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-amber-400 transition-colors"
                                />
                            </div>
                        </div>
                        <Button size="lg" className="w-full !rounded-xl">
                            🔍 Tìm chuyến xe
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 mt-10">
                        {[['500+', 'Tuyến xe'], ['2M+', 'Lượt đặt vé'], ['98%', 'Hài lòng']].map(([num, label]) => (
                            <div key={label}>
                                <div className="text-2xl font-bold text-amber-400" style={{ fontFamily: 'Playfair Display, serif' }}>{num}</div>
                                <div className="text-slate-400 text-xs mt-0.5">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular routes */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-2">Phổ biến nhất</p>
                            <h2 className="text-4xl font-bold text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Tuyến đường nổi bật
                            </h2>
                        </div>
                        <a href="#" className="text-amber-500 text-sm font-medium hover:underline">Xem tất cả →</a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {POPULAR_ROUTES.map(({ from, to, price, duration }) => (
                            <div
                                key={`${from}-${to}`}
                                className="group bg-slate-50 hover:bg-amber-50 rounded-2xl p-5 border border-slate-100 hover:border-amber-200 transition-all duration-200 cursor-pointer"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-800 text-sm">{from}</p>
                                        <p className="text-slate-400 text-xs mt-0.5">Điểm đi</p>
                                    </div>
                                    <div className="text-amber-400 text-lg">→</div>
                                    <div className="flex-1 text-right">
                                        <p className="font-semibold text-slate-800 text-sm">{to}</p>
                                        <p className="text-slate-400 text-xs mt-0.5">Điểm đến</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                                    <span className="text-xs text-slate-500">⏱ {duration}</span>
                                    <span className="text-amber-600 font-bold text-sm">từ {price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-slate-900">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">Tại sao chọn chúng tôi</p>
                        <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Trải nghiệm đặt vé<br />
                            <span className="text-amber-400">không giống ai</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map(({ icon, title, desc }) => (
                            <div
                                key={title}
                                className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-amber-500/50 transition-all duration-200 group"
                            >
                                <div className="text-4xl mb-4">{icon}</div>
                                <h3 className="text-white font-semibold text-base mb-2 group-hover:text-amber-400 transition-colors">
                                    {title}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-amber-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)',
                        backgroundSize: '20px 20px',
                    }}
                />
                <div className="relative max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-black text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Bắt đầu hành trình của bạn
                    </h2>
                    <p className="text-amber-100 text-lg mb-8">
                        Đăng ký miễn phí và nhận ngay ưu đãi 20% cho chuyến đầu tiên.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Button
                            size="lg"
                            variant="secondary"
                            onClick={() => navigate(ROUTES.REGISTER)}
                            className="!rounded-full"
                        >
                            Đăng ký ngay
                        </Button>
                        <Button
                            size="lg"
                            variant="ghost"
                            onClick={() => navigate(ROUTES.LOGIN)}
                            className="!rounded-full !text-white !border-white/40 hover:!bg-white/10"
                        >
                            Đã có tài khoản
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};