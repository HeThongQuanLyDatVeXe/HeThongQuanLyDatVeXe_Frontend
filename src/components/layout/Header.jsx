import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store";
import { authApi } from "../../services/api";
import { isAdminByRoles } from "../../utils/auth";
import toast from "react-hot-toast";

export default function Header() {
  const { isAuthenticated, user, logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdown, setDD] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ddRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const click = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDD(false);
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout({ refreshToken });
    } catch {}
    logout();
    navigate("/");
    toast.success("Đã đăng xuất");
    setDD(false);
  };

  const navLinks = [
    { to: "/", label: "Trang Chủ" },
    { to: "/search", label: "Tìm Chuyến" },
    { to: "/about", label: "Về Chúng Tôi" },
    { to: "/news", label: "Tin Tức" },
  ];

  const isHomePage = location.pathname === "/";
  const headerBgClass = (scrolled || !isHomePage) ? "bg-white text-on-surface shadow-md" : "bg-transparent text-white";
  const linkTextClass = (scrolled || !isHomePage) ? "text-on-surface hover:text-[#F4600C]" : "text-white/90 hover:text-[#F4600C]";
  const iconColorClass = (scrolled || !isHomePage) ? "text-on-surface" : "text-white";

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${headerBgClass}`}>
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          {/* Brand Logo */}
          <Link to="/" className="text-2xl font-bold tracking-tighter text-[#F4600C] font-headline-md">
            Đi Về Nhà
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-body-md text-body-md">
            {navLinks.map(l => (
              <Link 
                key={l.to} 
                to={l.to} 
                className={`${linkTextClass} transition-colors duration-300 ${location.pathname === l.to ? "border-b-2 border-[#F4600C] pb-1 text-[#F4600C]" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          
          {/* Trailing Action */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="relative" ref={ddRef}>
                <button
                  onClick={() => setDD(!dropdown)}
                  className={`flex items-center gap-2 font-body-md text-body-md ${linkTextClass} transition-colors duration-300`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>person</span>
                  <span className="truncate max-w-[100px]">
                    {user?.fullName?.split(" ").pop() || user?.email?.split("@")[0] || "Tài khoản"}
                  </span>
                </button>
                <AnimatePresence>
                  {dropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-48 bg-white text-[#261813] rounded-lg shadow-lg py-2 border border-[#e2bfb2]"
                    >
                      <Link to="/profile" onClick={() => setDD(false)} className="block px-4 py-2 hover:bg-[#ffe9e2] font-body-md">Hồ sơ</Link>
                      <Link to="/my-tickets" onClick={() => setDD(false)} className="block px-4 py-2 hover:bg-[#ffe9e2] font-body-md">Vé của tôi</Link>
                      {isAdminByRoles(user?.roles || []) && (
                        <Link to="/admin" onClick={() => setDD(false)} className="block px-4 py-2 hover:bg-[#ffe9e2] font-body-md">Quản trị</Link>
                      )}
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-[#ba1a1a] hover:bg-[#ffdad6] font-body-md">Đăng xuất</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className={`font-body-md text-body-md ${linkTextClass} transition-colors duration-300 flex items-center gap-2`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>person</span>
                Đăng Nhập
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Trigger */}
          <button className={`md:hidden p-2 ${iconColorClass}`} onClick={() => setOpen(!open)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-t-[32px] border-t border-[#E8D5C4] dark:border-stone-800 shadow-[0_-8px_30px_rgba(92,64,51,0.1)]">
        <Link to="/" className="flex flex-col items-center justify-center bg-[#FFF4ED] dark:bg-orange-950/30 text-[#F4600C] rounded-2xl px-5 py-2 active:bg-orange-50 transition-transform duration-200">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-[11px] font-['Noto_Serif'] font-semibold mt-1">Trang Chủ</span>
        </Link>
        <Link to="/search" className="flex flex-col items-center justify-center text-stone-500 px-5 py-2 active:bg-orange-50 transition-transform duration-200">
          <span className="material-symbols-outlined">confirmation_number</span>
          <span className="text-[11px] font-['Noto_Serif'] font-semibold mt-1">Chuyến Đi</span>
        </Link>
        <Link to="/notifications" className="flex flex-col items-center justify-center text-stone-500 px-5 py-2 active:bg-orange-50 transition-transform duration-200">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[11px] font-['Noto_Serif'] font-semibold mt-1">Thông Báo</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center justify-center text-stone-500 px-5 py-2 active:bg-orange-50 transition-transform duration-200">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[11px] font-['Noto_Serif'] font-semibold mt-1">Tài Khoản</span>
        </Link>
      </nav>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-[60px] left-0 w-full bg-white z-40 border-b border-slate-200 shadow-md"
          >
            <div className="flex flex-col py-4 px-4 gap-2">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-body-md text-base transition-colors ${
                    location.pathname === l.to
                      ? "bg-primary-container/10 text-primary"
                      : "text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl font-body-md text-base text-on-surface hover:bg-surface-container"
                >
                  Đăng nhập / Đăng ký
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
