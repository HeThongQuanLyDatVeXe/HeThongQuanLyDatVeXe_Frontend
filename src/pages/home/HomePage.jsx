import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useAuthStore } from "../../store";
import {
  decodeJwtPayload,
  extractRolesFromToken,
  isAdminByRoles,
  normalizeMaybeMojibake,
  resolvePostLoginPath,
} from "../../utils/auth";
import toast from "react-hot-toast";

/* ─── Data ──────────────────────────────────────────────────── */
const HOT_ROUTES = [
  {
    from: "Hà Nội",
    to: "Sapa",
    dur: "6h 30m",
    price: "350.000₫",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9mkDB-JQsxcnk-G6XALy9XSOGhKNhMqqBYEZ4P0k8EGSFaNOj16Mdu0qsxHmE4paI3zfB7urV8i94qlJgxo00fRQ-EbHn7H2gSYb9eYFnPe4VL73AH_zd2eM0K_0J6gOOcNj0V30cQ1gPl5kW0dd85qeC1pvtyzbZQPUZKjo1wOCPglvSl4j2s7D2ugFbJFlDFCF2ndrD0bWt_g0gQnKgTHMLXSDVoeRKdJAY-T6OdDJfx9owo7ktJPVaQSAyTR1OFE3t8NATrpQ"
  },
  {
    from: "TP.HCM",
    to: "Đà Lạt",
    dur: "8h 00m",
    price: "280.000₫",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBThZIyUHgqyTr-LpNWJbMWkxdpXA6N7nNdncIOLWE8Jqd1tWfYcwiAlPq4usXsO4mcuSjY0Uca010C7j5wsqicMMmQ2EbqPSai5ugS2rE0UPmC00OXG_YuZRcZxL77axeEqbt7ljWwCVAPh0TLpSq1EA1zBLt_en4JZLUPKVrxeC07UqNR7ZB_hTd2gPJaGMOu42-uKPbsX45o1ctWMCI8DzXE57pMOwA1zWKOmmIUtOSPjqAn5nTi6DvSwitBZ6fgMxSjvwwonnw"
  },
  {
    from: "Đà Nẵng",
    to: "Nha Trang",
    dur: "10h 30m",
    price: "400.000₫",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA03VHiWyhwxKVXrBli5BUWp01PbV5ED5kRbZmZ6XMgAmuCT56d3awbOMcQKfJUYBl3EgjMZnN11PogBQ3mxE5zZK3CfXvxM9F2ln0YpFEkr4rpeuXDXxJNtlE9jJYsA1bYZYtUfHT6zEn6HWnxmyTKEJ8O5j4Bcogu52CZWB_c8am9tWNsjnllo_Tj26ehZUl4UZVlUszWJUgrWGeA1YfKDXebwMYwK-tGzEZ6BwCTvmvHG1IadyiieAEujrf4cSMAt8JETiDjt1A"
  }
];

const STATS = [
  { val: "500+", label: "Tuyến đường" },
  { val: "2M+", label: "Khách hàng" },
  { val: "98%", label: "Đúng giờ" },
  { val: "24/7", label: "Hỗ trợ" },
];

/* ─── Animation variants ────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};
const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
  },
});

function Section({ children, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const handledCodeRef = useRef(null);
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    passengers: "1",
  });
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) return;
    if (handledCodeRef.current === code) return;
    handledCodeRef.current = code;

    let active = true;

    (async () => {
      try {
        const KC_URL = "http://localhost:9098";
        const KC_REALM = "micro-services";
        const CLIENT_ID = "frontend-client";
        const REDIRECT = window.location.origin;

        const tokenRes = await fetch(
          `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              client_id: CLIENT_ID,
              code,
              redirect_uri: REDIRECT,
            }),
          },
        );

        const token = await tokenRes.json();
        if (!tokenRes.ok || !token.access_token)
          throw new Error("token_exchange_failed");

        const jwtPayload = decodeJwtPayload(token.access_token) || {};
        const tokenRoles = extractRolesFromToken(token.access_token, CLIENT_ID);
        const tokenUser = {
          fullName: normalizeMaybeMojibake(
            jwtPayload?.name ||
            [jwtPayload?.given_name, jwtPayload?.family_name]
              .filter(Boolean)
              .join(" ") ||
            jwtPayload?.preferred_username ||
            "",
          ),
          email: jwtPayload?.email || "",
          avatarUrl: jwtPayload?.picture || "",
          roles: tokenRoles,
        };

        // Always create a logged-in state first to avoid null profile in UI.
        setAuth({
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          user: tokenUser,
        });

        // Call backend sync endpoint and use DB user as source of truth.
        let syncedUser = null;
        try {
          const USER_BASE = import.meta.env.VITE_USER_URL;
          const syncRes = await fetch(`${USER_BASE}/api/v1/auth/google/sync`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token.access_token}`,
              "Content-Type": "application/json",
            },
          });

          const syncPayload = await syncRes.json();
          if (!syncRes.ok) throw new Error("google_sync_failed");

          syncedUser =
            syncPayload?.user ||
            syncPayload?.data?.user ||
            syncPayload?.data ||
            syncPayload ||
            null;
        } catch {
          // Keep token-based fallback if backend sync is unavailable.
        }

        if (!active) return;

        // Prefer backend DB profile from googleSync. Fallback to JWT when sync fails.
        const backendUser =
          (syncedUser && Object.keys(syncedUser).length && syncedUser) ||
          tokenUser;
        const mergedRoles =
          (Array.isArray(backendUser?.roles) && backendUser.roles.length
            ? backendUser.roles
            : null) || tokenRoles;

        setAuth({
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          user: {
            ...backendUser,
            fullName:
              normalizeMaybeMojibake(backendUser?.fullName) ||
              backendUser?.name ||
              tokenUser?.fullName ||
              "Chưa cập nhật",
            email: backendUser?.email || tokenUser?.email || "",
            avatarUrl:
              backendUser?.avatarUrl ||
              backendUser?.picture ||
              tokenUser?.avatarUrl ||
              "",
            roles: mergedRoles,
          },
        });

        const rolePath = isAdminByRoles(mergedRoles)
          ? "/admin"
          : resolvePostLoginPath(token.access_token, CLIENT_ID);

        toast.success("Đăng nhập Google thành công!");
        navigate(rolePath, { replace: true });
      } catch {
        if (!active) return;
        toast.error("Đăng nhập Google thất bại");
        navigate("/login", { replace: true });
      }
    })();

    return () => {
      active = false;
    };
  }, [code, navigate, setAuth]);

  const today = new Date().toISOString().split("T")[0];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.from || !form.to) return;
    navigate(
      `/search?${new URLSearchParams({ ...form, date: form.date || today })}`
    );
  };

  const quickRoute = (r) => {
    navigate(
      `/search?${new URLSearchParams({ from: r.from, to: r.to, date: today, passengers: 1 })}`
    );
  };

  const swap = () => setForm((f) => ({ ...f, from: f.to, to: f.from }));

  return (
    <div className="overflow-x-hidden bg-background font-body-md text-on-background selection:bg-primary-container selection:text-on-primary-container">
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://res.cloudinary.com/dtxmo5yo1/video/upload/v1778238353/vietnam4k-60fps_rdmtsd.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/50 to-transparent">
        </div>
        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-6 mt-[-10vh]">
          <motion.h1 variants={stagger(0.2)} initial="hidden" animate="show" className="text-[56px] md:text-[72px] text-white italic drop-shadow-lg font-bold" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Về nhà thôi.
          </motion.h1>
          <motion.p variants={stagger(0.4)} initial="hidden" animate="show" className="font-body-lg text-xl text-white/90 max-w-2xl drop-shadow-md">
            Đặt vé xe khách nhanh chóng — đi hàng trăm tuyến khắp Việt Nam.
          </motion.p>
        </div>

        {/* Search Widget (Floating) */}
        <div className="absolute bottom-[-110px] md:bottom-[-90px] left-1/2 transform -translate-x-1/2 w-full max-w-[1200px] px-4 md:px-6 z-20">
          <motion.div variants={stagger(0.2)} initial="hidden" animate="show">
            <form onSubmit={handleSearch}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[24px] p-6 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex flex-col gap-6 relative overflow-hidden">
              {/* Tabs */}
              <div className="flex items-center gap-6 border-b border-white/20 pb-4">
                <button type="button" className="font-label-caps text-label-caps text-white border-b-2 border-white pb-1 font-bold">Một chiều</button>
                <button type="button" className="font-label-caps text-label-caps text-white/70 hover:text-white transition-colors pb-1">Khứ hồi</button>
              </div>
              {/* Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* From */}
                <div className="md:col-span-4 flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-white/90 font-medium uppercase tracking-wider">Điểm đi</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/80" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    <input
                      value={form.from}
                      onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-white/20 rounded-xl border border-white/30 focus:border-white focus:ring-2 focus:ring-white/50 font-body-md text-white placeholder:text-white/60 transition-all outline-none shadow-inner"
                      placeholder="Hà Nội" type="text" />
                  </div>
                </div>
                {/* Swap */}
                <div className="md:col-span-1 flex justify-center pb-2 md:pb-3">
                  <button type="button" onClick={swap}
                    className="h-12 w-12 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-colors shadow-sm group border border-white/30">
                    <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-300">swap_horiz</span>
                  </button>
                </div>
                {/* To */}
                <div className="md:col-span-4 flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-white/90 font-medium uppercase tracking-wider">Điểm đến</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/80" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    <input
                      value={form.to}
                      onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-white/20 rounded-xl border border-white/30 focus:border-white focus:ring-2 focus:ring-white/50 font-body-md text-white placeholder:text-white/60 transition-all outline-none shadow-inner"
                      placeholder="Sapa" type="text" />
                  </div>
                </div>
                {/* Date */}
                <div className="md:col-span-3 flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-white/90 font-medium uppercase tracking-wider">Ngày đi</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/80">calendar_today</span>
                    <input
                      type="date"
                      min={today}
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-white/20 rounded-xl border border-white/30 focus:border-white focus:ring-2 focus:ring-white/50 font-body-md text-white transition-all outline-none shadow-inner appearance-none color-scheme-dark" style={{ colorScheme: "dark" }} />
                  </div>
                </div>
              </div>
              {/* Row 2 Actions */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-4 text-white bg-white/20 px-5 py-3.5 rounded-xl border border-white/30 w-full md:w-auto hover:border-white/60 transition-colors shadow-inner">
                  <span className="material-symbols-outlined text-white/80">person</span>
                  <select
                    value={form.passengers}
                    onChange={(e) => setForm((f) => ({ ...f, passengers: e.target.value }))}
                    className="bg-transparent border-none outline-none font-body-md text-white cursor-pointer p-0 focus:ring-0 w-full md:w-auto [&>option]:text-black">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} Hành khách</option>
                    ))}
                  </select>
                </div>
                <button type="submit"
                  className="w-full md:w-auto px-10 py-4 bg-[#F4600C] text-white rounded-xl font-label-caps text-base tracking-widest uppercase hover:bg-[#C44A00] hover:shadow-[0_8px_20px_rgba(244,96,12,0.4)] transition-all shadow-md flex items-center justify-center gap-2 group">
                  Tìm chuyến xe
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Spacer for floating card */}
      <div className="h-[140px] md:h-[160px] w-full bg-background"></div>

      {/* ══ TRUST BAR ════════════════════════════════════════ */}
      <Section className="py-16 bg-[#fee3d9] border-y border-[#e2bfb2]">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 text-center md:divide-x divide-outline-variant/60">
          {STATS.map((s, i) => (
            <div key={i} className="flex flex-col gap-3 px-4 hover:-translate-y-1 transition-transform duration-300">
              <span className="font-headline-lg text-[48px] text-primary drop-shadow-sm">{s.val}</span>
              <span className="font-body-md text-on-surface-variant tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ══ POPULAR ROUTES ════════════════════════════════════════ */}
      <Section className="py-32 bg-background">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col gap-14">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-headline-md text-4xl text-on-surface mb-3">Tuyến phổ biến</h2>
              <p className="font-body-md text-lg text-on-surface-variant">Những hành trình được yêu thích nhất</p>
            </div>
            <button className="hidden md:flex items-center gap-2 font-label-caps text-primary hover:text-primary-container transition-colors group">
              Xem tất cả <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOT_ROUTES.map((route, i) => (
              <div key={i} onClick={() => quickRoute(route)}
                className="bg-[#ffe9e2] rounded-2xl border border-[#e2bfb2] overflow-hidden hover:shadow-[0_12px_30px_rgba(92,64,51,0.2)] transition-all duration-300 group cursor-pointer flex flex-col">
                <div className="h-48 bg-[#f8ddd3] relative overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[15s] group-hover:scale-110"
                    style={{ backgroundImage: `url('${route.img}')` }}>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <span className="absolute bottom-5 left-5 font-label-caps text-xs text-white bg-[#a53c00]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#a53c00] shadow-sm tracking-wider">
                    Phổ biến
                  </span>
                </div>
                <div className="p-8 flex flex-col gap-5 bg-[#ffe9e2]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-headline-md text-[22px] text-on-surface font-semibold">{route.from}</span>
                      <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                      <span className="font-headline-md text-[22px] text-on-surface font-semibold">{route.to}</span>
                    </div>
                  </div>

                  <div className="w-full border-t-[2px] border-dashed border-outline-variant my-3 relative">
                    <div className="absolute -left-10 top-[-9px] w-4 h-4 rounded-full bg-background border border-outline-variant"></div>
                    <div className="absolute -right-10 top-[-9px] w-4 h-4 rounded-full bg-background border border-outline-variant"></div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-[#5a4137] bg-[#fff8f6] px-3 py-1.5 rounded-lg border border-[#e2bfb2]/30">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      <span className="font-body-md text-sm font-medium">{route.dur}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-label-sm text-[12px] text-on-surface-variant mb-0.5 uppercase tracking-wider">Từ</span>
                      <span className="font-headline-md text-[24px] text-primary">{route.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
      <Section className="py-32 bg-[#f8ddd3] border-y border-[#e2bfb2] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
          <h2 className="font-headline-md text-[40px] text-on-surface mb-20">Cách thức đặt vé</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 relative">
            <div className="hidden md:block absolute top-[48px] left-[20%] right-[20%] h-0 border-t-[2px] border-dashed border-[#a13b00]"></div>

            {[
              { step: 1, title: "Tìm Chuyến", desc: "Nhập điểm đi, điểm đến và thời gian để tìm các chuyến xe phù hợp." },
              { step: 2, title: "Chọn Chỗ", desc: "Lựa chọn chỗ ngồi yêu thích và xem chi tiết tiện ích trên xe." },
              { step: 3, title: "Thanh Toán", desc: "Thanh toán an toàn qua nhiều cổng và nhận vé điện tử ngay lập tức." }
            ].map(item => (
              <div key={item.step} className="flex flex-col items-center gap-8 relative group">
                <div className="w-24 h-24 rounded-full bg-[#fff] border-[4px] border-[#fee3d9] flex items-center justify-center shadow-lg relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <span className="font-headline-lg text-[40px] text-primary">{item.step}</span>
                </div>
                <div className="flex flex-col gap-3 items-center">
                  <h3 className="font-label-caps text-xl tracking-widest text-on-surface">{item.title}</h3>
                  <p className="font-body-md text-on-surface-variant max-w-[260px] leading-relaxed text-[15px]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════ */}
      <Section className="py-32 bg-[#fff]">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="font-headline-md text-[40px] text-on-surface text-center mb-16">Khách hàng nói gì về chúng tôi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: "Trải nghiệm tuyệt vời. Xe chạy êm, đón khách đúng giờ. Tôi luôn chọn Đi Về Nhà mỗi khi về quê ăn Tết. Cảm giác rất an tâm và thoải mái.", name: "Minh Anh", route: "Tuyến HN - HP", initial: "M" },
              { quote: "Ứng dụng dễ dùng, tìm vé nhanh. Tôi thích nhất là phong cách thiết kế ấm cúng, không giống các app đặt vé khô khan khác.", name: "Tuấn Kiệt", route: "Tuyến SG - ĐL", initial: "T" },
              { quote: "Hỗ trợ khách hàng rất nhiệt tình. Tôi lỡ chuyến và được hỗ trợ đổi vé sang chuyến sau rất nhanh chóng mà không mất nhiều phí.", name: "Hoàng Yến", route: "Tuyến ĐN - NT", initial: "H", stars: 4 }
            ].map((review, i) => (
              <div key={i} className="bg-[#fff1ec] p-10 rounded-2xl border border-[#e2bfb2] shadow-[0_4px_20px_rgba(92,64,51,0.1)] flex flex-col gap-8 relative hover:-translate-y-2 transition-transform duration-500">
                <span className="material-symbols-outlined absolute top-8 right-8 text-primary/20 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                <div className="flex text-secondary-container">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`material-symbols-outlined text-xl ${star > (review.stars || 5) ? 'text-outline-variant' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="font-body-md text-lg text-on-surface italic relative z-10 leading-relaxed text-[#261813]">"{review.quote}"</p>
                <div className="flex items-center gap-5 mt-auto pt-6 border-t border-outline-variant/60">
                  <div className="w-12 h-12 rounded-full bg-[#f8ddd3] flex items-center justify-center font-label-caps text-xl text-[#a13b00] font-bold">
                    {review.initial}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-on-surface font-bold text-base">{review.name}</span>
                    <span className="font-body-md text-sm text-on-surface-variant mt-0.5">{review.route}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
