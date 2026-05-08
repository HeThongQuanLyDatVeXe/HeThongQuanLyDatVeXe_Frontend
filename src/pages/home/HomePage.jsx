import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Shield,
  Clock,
  Star,
  Zap,
  Bus,
  ChevronRight,
  TrendingUp,
  Award,
  HeadphonesIcon,
} from "lucide-react";
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
    from: "TP. Hồ Chí Minh",
    to: "Đà Lạt",
    dur: "6h30",
    price: "150.000",
    cnt: "24 chuyến",
  },
  {
    from: "TP. Hồ Chí Minh",
    to: "Nha Trang",
    dur: "8h",
    price: "190.000",
    cnt: "18 chuyến",
  },
  {
    from: "TP. Hồ Chí Minh",
    to: "Vũng Tàu",
    dur: "2h",
    price: "85.000",
    cnt: "32 chuyến",
  },
  {
    from: "Hà Nội",
    to: "Đà Nẵng",
    dur: "14h",
    price: "280.000",
    cnt: "12 chuyến",
  },
  {
    from: "Hà Nội",
    to: "Sapa",
    dur: "5h30",
    price: "170.000",
    cnt: "15 chuyến",
  },
  { from: "Đà Nẵng", to: "Huế", dur: "3h", price: "90.000", cnt: "20 chuyến" },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Bảo mật tuyệt đối",
    desc: "Thanh toán mã hóa SSL, bảo vệ thông tin cá nhân.",
  },
  {
    icon: Zap,
    title: "Đặt vé siêu tốc",
    desc: "Xác nhận tức thì, nhận vé điện tử ngay lập tức.",
  },
  {
    icon: HeadphonesIcon,
    title: "Hỗ trợ 24/7",
    desc: "Đội ngũ tư vấn luôn sẵn sàng mọi lúc mọi nơi.",
  },
  {
    icon: Award,
    title: "Nhà xe uy tín",
    desc: "Hơn 200 nhà xe được kiểm duyệt chất lượng nghiêm ngặt.",
  },
];

const STATS = [
  { val: "2.5M+", label: "Vé đã bán" },
  { val: "200+", label: "Nhà xe" },
  { val: "63", label: "Tỉnh thành" },
  { val: "4.9★", label: "Đánh giá" },
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

/* ─── Components ────────────────────────────────────────────── */
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
      `/search?${new URLSearchParams({ ...form, date: form.date || today })}`,
    );
  };

  const quickRoute = (r) => {
    navigate(
      `/search?${new URLSearchParams({ from: r.from, to: r.to, date: today, passengers: 1 })}`,
    );
  };

  const swap = () => setForm((f) => ({ ...f, from: f.to, to: f.from }));

  return (
    <div className="overflow-x-hidden">
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <div className="relative min-h-[calc(100vh-80px)] flex items-center">
        {/* BG decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-100"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Glow blobs */}
          <div
            className="absolute top-1/3 right-1/4 w-[500px] h-[500px]
                          bg-vermillion-500/8 rounded-full blur-[120px]"
          />
          <div
            className="absolute bottom-0 left-1/3 w-[300px] h-[300px]
                          bg-blue-600/6 rounded-full blur-[80px]"
          />
          {/* Decorative circles */}
          <div
            className="absolute top-20 right-10 w-40 h-40 rounded-full
                          border border-white/[0.04] animate-float"
          />
          <div
            className="absolute bottom-20 left-10 w-24 h-24 rounded-full
                          border border-vermillion-500/10 animate-float"
            style={{ animationDelay: "3s" }}
          />
        </div>

        <div className="wrap relative z-10 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <div>
              {/* Tag */}
              <motion.div
                variants={stagger(0)}
                initial="hidden"
                animate="show"
                className="inline-flex items-center gap-2 badge-brand mb-6"
              >
                <TrendingUp size={12} />
                <span>Nền tảng đặt vé #1 Việt Nam</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={stagger(0.08)}
                initial="hidden"
                animate="show"
                className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] mb-5"
              >
                Về nhà
                <br />
                <span className="brand-text">thật dễ</span>
                <br />
                <span className="font-serif italic font-normal text-ink-400">
                  cùng DiVeNha
                </span>
              </motion.h1>

              <motion.p
                variants={stagger(0.16)}
                initial="hidden"
                animate="show"
                className="text-lg text-ink-400 leading-relaxed mb-10 max-w-md"
              >
                Tìm, so sánh và đặt vé xe khách trong vài giây. Hàng trăm tuyến
                đường, hàng nghìn chuyến mỗi ngày trên cả nước.
              </motion.p>

              {/* Stats row */}
              <motion.div
                variants={stagger(0.24)}
                initial="hidden"
                animate="show"
                className="flex items-center gap-6"
              >
                {STATS.slice(0, 3).map((s) => (
                  <div key={s.label}>
                    <div className="font-display font-bold text-xl text-ink-900">
                      {s.val}
                    </div>
                    <div className="text-xs text-ink-500">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — search card */}
            <motion.div variants={stagger(0.2)} initial="hidden" animate="show">
              <div className="card-glass p-6 lg:p-8">
                <h2 className="font-display font-semibold text-lg text-ink-900 mb-5">
                  Tìm chuyến xe
                </h2>

                <form onSubmit={handleSearch} className="space-y-3">
                  {/* From/To row */}
                  <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                    <div className="relative">
                      <span className="label">Điểm đi</span>
                      <div className="relative">
                        <MapPin
                          size={15}
                          className="absolute left-3 top-3.5 text-vermillion-500/70"
                        />
                        <input
                          value={form.from}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, from: e.target.value }))
                          }
                          placeholder="Hồ Chí Minh..."
                          className="field pl-9 text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={swap}
                      className="mt-5 w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.1]
                                 flex items-center justify-center text-ink-400
                                 hover:bg-vermillion-500/10 hover:text-vermillion-400 hover:border-vermillion-500/30
                                 transition-all duration-200 flex-shrink-0"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M8 3L4 7l4 4M16 21l4-4-4-4M4 7h16M20 17H4" />
                      </svg>
                    </button>

                    <div className="relative">
                      <span className="label">Điểm đến</span>
                      <div className="relative">
                        <MapPin
                          size={15}
                          className="absolute left-3 top-3.5 text-ink-500"
                        />
                        <input
                          value={form.to}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, to: e.target.value }))
                          }
                          placeholder="Đà Lạt..."
                          className="field pl-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date + Passengers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="label">Ngày đi</span>
                      <div className="relative">
                        <Calendar
                          size={15}
                          className="absolute left-3 top-3.5 text-ink-500"
                        />
                        <input
                          type="date"
                          min={today}
                          value={form.date}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, date: e.target.value }))
                          }
                          className="field pl-9 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="label">Hành khách</span>
                      <div className="relative">
                        <Users
                          size={15}
                          className="absolute left-3 top-3.5 text-ink-500"
                        />
                        <select
                          value={form.passengers}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              passengers: e.target.value,
                            }))
                          }
                          className="field pl-9 text-sm appearance-none cursor-pointer"
                        >
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n}>
                              {n} hành khách
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-brand w-full py-3.5 text-base mt-1"
                  >
                    <Search size={18} />
                    Tìm chuyến xe
                  </button>
                </form>

                {/* Quick tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-[11px] text-ink-600 font-display self-center">
                    Tuyến nhanh:
                  </span>
                  {["HCM → Đà Lạt", "HCM → Vũng Tàu", "HN → Sapa"].map((r) => {
                    const [a, b] = r.split(" → ");
                    return (
                      <button
                        key={r}
                        onClick={() =>
                          quickRoute({
                            from: a === "HCM" ? "TP. Hồ Chí Minh" : "Hà Nội",
                            to: b,
                          })
                        }
                        className="text-[11px] font-display px-2.5 py-1 rounded-lg
                                   bg-white/[0.04] border border-white/[0.07]
                                   text-ink-400 hover:text-vermillion-400 hover:border-vermillion-500/25
                                   transition-all duration-150"
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══ HOT ROUTES ════════════════════════════════════════ */}
      <Section className="wrap py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-display uppercase tracking-widest text-vermillion-400 mb-2">
              Phổ biến
            </p>
            <h2 className="font-display text-3xl font-bold text-ink-900">
              Tuyến đường hot
            </h2>
          </div>
          <button
            onClick={() => navigate("/search")}
            className="btn-ghost text-sm flex items-center gap-1 text-ink-400"
          >
            Tất cả tuyến <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HOT_ROUTES.map((r, i) => (
            <motion.button
              key={i}
              variants={stagger(i * 0.06)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              onClick={() => quickRoute(r)}
              className="card-interactive p-5 text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 font-display font-semibold text-ink-900 mb-1">
                    <span>
                      {r.from
                        .replace("TP. Hồ Chí Minh", "HCM")
                        .replace("Đà Nẵng", "ĐN")}
                    </span>
                    <ArrowRight size={14} className="text-vermillion-500" />
                    <span>{r.to}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-500">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {r.dur}
                    </span>
                    <span>· {r.cnt}</span>
                  </div>
                </div>
                <div
                  className="w-8 h-8 rounded-xl bg-vermillion-500/10 border border-vermillion-500/20
                                flex items-center justify-center group-hover:bg-vermillion-500/20
                                transition-colors"
                >
                  <Bus size={14} className="text-vermillion-400" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-ink-500">từ </span>
                  <span className="font-display font-bold text-lg text-vermillion-400">
                    {r.price}đ
                  </span>
                </div>
                <span
                  className="text-xs text-ink-600 group-hover:text-vermillion-400
                                 flex items-center gap-1 transition-colors"
                >
                  Đặt ngay <ArrowRight size={11} />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </Section>

      {/* ══ STATS BAND ════════════════════════════════════════ */}
      <div className="border-y border-white/[0.06] bg-surface-100/50">
        <div className="wrap py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                variants={stagger(i * 0.08)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <div className="font-display font-bold text-4xl brand-text mb-1">
                  {s.val}
                </div>
                <div className="text-sm text-ink-500">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FEATURES ══════════════════════════════════════════ */}
      <Section className="wrap py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-display uppercase tracking-widest text-vermillion-400 mb-3">
            Vì sao chọn chúng tôi
          </p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-ink-900">
            Trải nghiệm đặt vé
            <br />
            <span className="font-serif italic font-normal text-ink-400">
              tốt nhất Việt Nam
            </span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              variants={stagger(i * 0.1)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="card p-6 text-center group hover:border-vermillion-500/25 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-2xl bg-vermillion-500/10 border border-vermillion-500/20
                              flex items-center justify-center mx-auto mb-4
                              group-hover:bg-vermillion-500/15 group-hover:shadow-glow-sm transition-all duration-300"
              >
                <f.icon size={22} className="text-vermillion-400" />
              </div>
              <h3 className="font-display font-semibold text-ink-900 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══ CTA BAND ══════════════════════════════════════════ */}
      <Section className="wrap pb-20">
        <div className="relative card overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-vermillion-600/20 via-transparent to-transparent" />
          <div className="absolute right-0 top-0 w-64 h-64 bg-vermillion-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl lg:text-3xl font-bold text-ink-900 mb-2">
                Sẵn sàng lên đường chưa?
              </h2>
              <p className="text-ink-400">
                Đặt vé ngay hôm nay, nhận ưu đãi 15% cho lần đầu tiên.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => navigate("/register")}
                className="btn-brand-lg"
              >
                Đăng ký miễn phí
              </button>
              <button
                onClick={() => navigate("/search")}
                className="btn-outline"
              >
                Tìm chuyến ngay
              </button>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
