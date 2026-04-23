import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/user-service/useAuth';
import { ROUTES } from '../../constants/routes';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate(ROUTES.HOME);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to={ROUTES.HOME} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">D</span>
                    </div>
                    <span
                        className="text-xl font-bold"
                        style={{ fontFamily: 'Playfair Display, serif', color: scrolled ? '#0f0e0c' : '#fff' }}
                    >
                        DivEnha
                    </span>
                </Link>

                {/* Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {['Tuyến xe', 'Lịch trình', 'Khuyến mãi', 'Hỗ trợ'].map((item) => (
                        <a
                            key={item}
                            href="#"
                            className={`text-sm font-medium transition-colors hover:text-amber-500 ${scrolled ? 'text-slate-600' : 'text-white/80'
                                }`}
                        >
                            {item}
                        </a>
                    ))}
                </nav>

                {/* Auth */}
                <div className="hidden md:flex items-center gap-3">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link to={ROUTES.PROFILE}>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all">
                                    <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-white">
                                        {user?.fullName?.[0]?.toUpperCase()}
                                    </div>
                                    <span className={`text-sm font-medium ${scrolled ? 'text-slate-700' : 'text-white'}`}>
                                        {user?.fullName}
                                    </span>
                                </div>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className={`text-sm font-medium hover:text-amber-500 transition-colors ${scrolled ? 'text-slate-500' : 'text-white/70'
                                    }`}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link
                                to={ROUTES.LOGIN}
                                className={`text-sm font-medium transition-colors hover:text-amber-500 ${scrolled ? 'text-slate-600' : 'text-white/80'
                                    }`}
                            >
                                Đăng nhập
                            </Link>
                            <Button
                                size="sm"
                                onClick={() => navigate(ROUTES.REGISTER)}
                                className="!rounded-full"
                            >
                                Đăng ký
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    className="md:hidden"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <svg className={`w-6 h-6 ${scrolled ? 'text-slate-700' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-white shadow-lg px-6 py-4 flex flex-col gap-4">
                    {['Tuyến xe', 'Lịch trình', 'Khuyến mãi', 'Hỗ trợ'].map((item) => (
                        <a key={item} href="#" className="text-slate-700 text-sm font-medium">{item}</a>
                    ))}
                    <div className="flex gap-3 pt-2 border-t border-slate-100">
                        <Link to={ROUTES.LOGIN} className="text-sm font-medium text-slate-600">Đăng nhập</Link>
                        <Link to={ROUTES.REGISTER} className="text-sm font-medium text-amber-500">Đăng ký</Link>
                    </div>
                </div>
            )}
        </header>
    );
};