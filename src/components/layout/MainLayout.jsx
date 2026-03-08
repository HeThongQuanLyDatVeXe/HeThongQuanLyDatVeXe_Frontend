import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store";
import { authApi } from "../../services/api";
import { isAdminByRoles } from "../../utils/auth";
import toast from "react-hot-toast";
import {
  Bus,
  Menu,
  X,
  ChevronDown,
  User,
  Ticket,
  LogOut,
  LayoutDashboard,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  ArrowUpRight,
} from "lucide-react";

/* ── Navbar ──────────────────────────────────────────────────── */
function Navbar() {
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

  const isActive = (p) => location.pathname === p;

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
    { to: "/", label: "Trang chủ" },
    { to: "/search", label: "Tìm vé" },
    ...(isAuthenticated ? [{ to: "/my-tickets", label: "Vé của tôi" }] : []),
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface-50/90 backdrop-blur-xl border-b border-slate-200 py-3"
          : "py-5"
      }`}
    >
      <div className="wrap flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-xl bg-vermillion-500 flex items-center justify-center
                            shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300"
            >
              <Bus size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
                            bg-emerald-400 border-2 border-surface-50"
            />
          </div>
          <div>
            <span className="font-display font-bold text-lg leading-none">
              Di<span className="brand-text">VeNha</span>
            </span>
            <div className="text-[9px] font-mono text-ink-600 tracking-widest uppercase leading-none mt-0.5">
              Bus Tickets
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`relative px-4 py-2 text-sm font-display font-medium rounded-lg
                transition-all duration-200 ${
                  isActive(l.to)
                    ? "text-vermillion-400 bg-vermillion-500/10"
                    : "text-ink-600 hover:text-ink-900 hover:bg-slate-100"
                }`}
            >
              {l.label}
              {isActive(l.to) && (
                <motion.div
                  layoutId="nav-pip"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1
                             rounded-full bg-vermillion-500 mb-1"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={ddRef}>
              <button
                onClick={() => setDD(!dropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl
                           bg-slate-100 border border-slate-200
                           hover:bg-slate-200 transition-all duration-200"
              >
                <div
                  className="w-7 h-7 rounded-lg overflow-hidden bg-vermillion-500/20
                                border border-vermillion-500/30 flex items-center justify-center"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-display font-bold text-vermillion-400">
                      {(user?.fullName || user?.email || "U")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-ink-700 max-w-[100px] truncate">
                  {user?.fullName?.split(" ").pop() ||
                    user?.email?.split("@")[0]}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-ink-400 transition-transform duration-200 ${dropdown ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {dropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 card-glass py-1.5 z-50"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-200 mb-1">
                      <p className="text-[11px] text-ink-500 uppercase tracking-wider font-display">
                        Tài khoản
                      </p>
                      <p className="text-sm font-medium text-ink-800 truncate mt-0.5">
                        {user?.email}
                      </p>
                      {user?.loyaltyPoints > 0 && (
                        <p className="text-xs text-amber-400 mt-0.5">
                          ✦ {user.loyaltyPoints.toLocaleString()} điểm
                        </p>
                      )}
                    </div>

                    {[
                      { icon: User, to: "/profile", label: "Hồ sơ" },
                      { icon: Ticket, to: "/my-tickets", label: "Vé của tôi" },
                      ...(isAdminByRoles(user?.roles || [])
                        ? [
                            {
                              icon: LayoutDashboard,
                              to: "/admin",
                              label: "Quản trị",
                            },
                          ]
                        : []),
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setDD(false)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                                   text-ink-600 hover:text-ink-900 hover:bg-slate-100 transition-colors"
                      >
                        <item.icon size={14} className="text-ink-500" />
                        {item.label}
                      </Link>
                    ))}

                    <div className="border-t border-slate-200 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                                   text-vermillion-400 hover:text-vermillion-300
                                   hover:bg-vermillion-500/5 transition-colors"
                      >
                        <LogOut size={14} />
                        Đăng xuất
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn-brand text-sm py-2.5 px-5">
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="btn-icon md:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 overflow-hidden bg-surface-50/95 backdrop-blur-xl"
          >
            <div className="wrap py-4 space-y-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(l.to)
                      ? "bg-vermillion-500/10 text-vermillion-400"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="btn-outline flex-1 text-sm"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="btn-brand flex-1 text-sm"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ── Footer ──────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-slate-200 mt-24">
      <div className="wrap py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand col */}
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-vermillion-500 flex items-center justify-center">
                <Bus size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg">
                Di<span className="brand-text">VeNha</span>
              </span>
            </Link>
            <p className="text-sm text-ink-500 leading-relaxed mb-5 max-w-xs">
              Nền tảng đặt vé xe khách hàng đầu Việt Nam. Nhanh, tiện lợi, an
              toàn.
            </p>
            <div className="flex gap-2">
              {[Facebook, Youtube, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-100
                             flex items-center justify-center text-ink-500
                             hover:text-vermillion-400 hover:border-vermillion-500/30 transition-all"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Dịch vụ",
              links: [
                "Đặt vé xe khách",
                "Tra cứu vé",
                "Lịch chạy xe",
                "Bến xe & Điểm đón",
              ],
            },
            {
              title: "Hỗ trợ",
              links: [
                "Trung tâm trợ giúp",
                "Chính sách hoàn vé",
                "Điều khoản sử dụng",
                "Chính sách bảo mật",
              ],
            },
          ].map((col) => (
            <div key={col.title} className="md:col-span-3">
              <h4 className="label mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-ink-500 hover:text-ink-900 transition-colors flex items-center gap-1 group"
                    >
                      {l}
                      <ArrowUpRight
                        size={11}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-vermillion-400"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div className="md:col-span-2">
            <h4 className="label mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              {[
                { icon: Phone, text: "1900 6067" },
                { icon: Mail, text: "support@divenha.vn" },
                { icon: MapPin, text: "TP. Hồ Chí Minh" },
              ].map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-2 text-sm text-ink-500"
                >
                  <Icon
                    size={13}
                    className="text-vermillion-500/60 flex-shrink-0"
                  />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider my-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-600">
            © 2026 DiVeNha. Mọi quyền được bảo lưu.
          </p>
          <p className="text-xs text-ink-700 font-mono">
            Spring Boot ✦ React ✦ Keycloak
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ── Layout ──────────────────────────────────────────────────── */
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
