import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/user-service/useAuth';
import { ROUTES } from '../../constants/routes';
import logo from '../../assets/new_logo.png';
import { List, X, SignOut } from '@phosphor-icons/react';
import { UserSubMenu } from './UserSubMenu';

export const Header: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const isHomepage = location.pathname === '/';

    // Admin pages manage their own layout — suppress the global fixed Header
    if (location.pathname.startsWith('/admin')) return null;

    const hasAdminRole = user?.roles?.some((role: any) => 
        (typeof role === 'string' ? role : role?.name || '').toUpperCase().includes('ADMIN')
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Force solid background if not homepage or mobile menu is open
    const isSolid = !isHomepage || scrolled || menuOpen;

    const handleLogout = async () => {
        await logout();
        navigate(ROUTES.HOME);
    };

    const handleNavClick = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        setMenuOpen(false);
        if (href === ROUTES.ROUTES) {
            navigate(href);
        } else if (!isHomepage) {
            navigate('/' + href);
        } else {
            const targetId = href.replace('#', '');
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const navItems = [
        { label: 'Tuyến đường', href: ROUTES.ROUTES },
        { label: 'Khuyến mãi', href: '#khuyen-mai' },
        { label: 'Hành trình', href: '#hanh-trinh' },
        { label: 'Tiện ích', href: '#tien-ich' }
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
                isSolid 
                    ? 'sticky-nav-scrolled py-3' 
                    : 'bg-transparent py-5'
            }`}
        >
            <div className="max-w-[1200px] mx-auto px-6 md:px-8 flex items-center justify-between">
                {/* Logo */}
                <Link to={ROUTES.HOME} className="flex items-center gap-3 group">
                    <img 
                        src={logo} 
                        alt="Đi Về Nhà Logo" 
                        className="h-10 w-auto group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                        className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
                            isSolid ? 'text-primary' : 'text-white'
                        }`}
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Đi Về Nhà
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={(e) => handleNavClick(e, item.href)}
                            className={`text-sm font-medium transition-colors duration-300 hover:text-primary ${
                                isSolid ? 'text-on-surface-variant' : 'text-white/90'
                            }`}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* Auth Actions (Desktop) */}
                <div className="hidden md:flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            {hasAdminRole && (
                                <Link to={ROUTES.ADMIN_DASHBOARD}>
                                    <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide uppercase transition-all duration-300 shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:shadow-[0_0_18px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 cursor-pointer ${
                                        isSolid 
                                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 hover:bg-amber-500/20' 
                                            : 'bg-white/10 border-amber-400/50 text-amber-300 hover:bg-white/20'
                                    }`}>
                                        <span className="material-symbols-outlined text-[16px] animate-pulse">admin_panel_settings</span>
                                        <span>Trang Quản Lý</span>
                                    </div>
                                </Link>
                            )}
                            
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 cursor-pointer bg-transparent text-left outline-none ${
                                        isSolid 
                                            ? 'border-primary/20 hover:bg-primary/10' 
                                            : 'border-white/20 hover:bg-white/20'
                                    } ${showUserMenu ? (isSolid ? 'bg-primary/10' : 'bg-white/20') : ''}`}
                                >
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                                            {user?.fullName?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <span className={`text-sm font-medium ${isSolid ? 'text-on-surface' : 'text-white'}`}>
                                        {user?.fullName}
                                    </span>
                                    <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${
                                        isSolid ? 'text-on-surface-variant' : 'text-white/70'
                                    } ${showUserMenu ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                
                                {showUserMenu && (
                                    <UserSubMenu 
                                        user={user} 
                                        onLogout={handleLogout} 
                                        onClose={() => setShowUserMenu(false)} 
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                to={ROUTES.LOGIN}
                                className={`text-sm font-medium transition-colors hover:text-primary ${
                                    isSolid ? 'text-on-surface-variant' : 'text-white/90'
                                }`}
                            >
                                Đăng nhập
                            </Link>
                            <Link to={ROUTES.REGISTER}>
                                <button className="shimmer-btn px-6 py-2 bg-primary text-on-primary rounded-full font-semibold text-xs tracking-wider uppercase hover:bg-primary-hover transition-all duration-300 shadow-md cursor-pointer">
                                    Đăng ký
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Trigger */}
                <button
                    className={`md:hidden flex items-center justify-center p-1 rounded-lg transition-colors cursor-pointer ${
                        isSolid ? 'text-on-surface hover:bg-primary/5' : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X size={26} /> : <List size={26} />}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            <div
                className={`md:hidden absolute top-full left-0 w-full bg-white shadow-xl transition-all duration-300 border-t border-slate-100 ${
                    menuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'
                }`}
            >
                <div className="px-6 py-6 flex flex-col gap-5">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={(e) => handleNavClick(e, item.href)}
                            className="text-on-surface hover:text-primary text-base font-semibold transition-colors py-1.5"
                        >
                            {item.label}
                        </a>
                    ))}
                    
                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link 
                                    to={ROUTES.PROFILE} 
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 py-1.5"
                                >
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                                            {user?.fullName?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm font-bold text-on-surface">{user?.fullName}</div>
                                        <div className="text-xs text-on-surface-variant">{user?.email}</div>
                                    </div>
                                </Link>

                                {hasAdminRole && (
                                    <Link 
                                        to={ROUTES.ADMIN_DASHBOARD} 
                                        onClick={() => setMenuOpen(false)}
                                        className="w-full"
                                    >
                                        <button className="w-full py-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 font-bold text-sm rounded-xl hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(245,158,11,0.1)] cursor-pointer">
                                            <span className="material-symbols-outlined text-[20px] animate-pulse">admin_panel_settings</span>
                                            <span>Trang Quản Lý</span>
                                        </button>
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="flex items-center justify-center gap-2 w-full py-3 border border-slate-200 hover:bg-slate-50 text-[#F4600C] font-semibold text-sm rounded-xl transition-all cursor-pointer bg-transparent"
                                >
                                    <SignOut size={18} />
                                    <span>Đăng xuất</span>
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Link to={ROUTES.LOGIN} onClick={() => setMenuOpen(false)}>
                                    <button className="w-full py-3 border border-primary/20 text-primary hover:bg-primary/5 font-semibold text-sm rounded-xl transition-all cursor-pointer">
                                        Đăng nhập
                                    </button>
                                </Link>
                                <Link to={ROUTES.REGISTER} onClick={() => setMenuOpen(false)}>
                                    <button className="w-full py-3 bg-primary text-on-primary hover:bg-primary-hover font-semibold text-sm rounded-xl transition-all cursor-pointer">
                                        Đăng ký
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};