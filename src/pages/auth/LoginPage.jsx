/* ─── LoginPage ─────────────────────────────────────────────── */
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { Bus, Eye, EyeOff, ArrowRight, Lock, User } from "lucide-react";
import { authApi } from "../../services/api";
import { useAuthStore } from "../../store";
import {
  extractRolesFromToken,
  isAdminByRoles,
  normalizeMaybeMojibake,
  resolvePostLoginPath,
} from "../../utils/auth";
import toast from "react-hot-toast";

const loginSchema = yup.object({
  username: yup.string().required("Vui lòng nhập tên đăng nhập"),
  password: yup.string().required("Vui lòng nhập mật khẩu"),
});

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [gBusy, setGBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setBusy(true);
    try {
      const res = await authApi.login(data);

      // Set token first so /me can authenticate and return canonical profile.
      useAuthStore.setState({ accessToken: res.data?.accessToken });
      const meRes = await authApi.me();
      const mePayload = meRes.data;
      const meUser =
        mePayload?.user ||
        mePayload?.data?.user ||
        mePayload?.data ||
        mePayload ||
        {};
      const loginPayload = res.data || {};
      const loginUser =
        loginPayload?.user ||
        loginPayload?.data?.user ||
        loginPayload?.data ||
        {};

      const keycloakClientId =
        import.meta.env.VITE_KEYCLOAK_CLIENT || "micro-services-api";
      const tokenRoles = extractRolesFromToken(
        res.data?.accessToken,
        keycloakClientId,
      );
      const mergedRoles =
        (Array.isArray(meUser?.roles) && meUser.roles.length
          ? meUser.roles
          : null) ||
        (Array.isArray(loginUser?.roles) && loginUser.roles.length
          ? loginUser.roles
          : null) ||
        tokenRoles;
      const fallbackPath = resolvePostLoginPath(
        res.data?.accessToken,
        keycloakClientId,
      );
      const rolePath = isAdminByRoles(mergedRoles) ? "/admin" : fallbackPath;

      const mergedUser = {
        ...loginUser,
        ...meUser,
        fullName: normalizeMaybeMojibake(
          meUser?.fullName || loginUser?.fullName || loginUser?.name || "",
        ),
        email: meUser?.email || loginUser?.email || "",
        avatarUrl: meUser?.avatarUrl || loginUser?.avatarUrl || "",
        roles: mergedRoles,
      };

      setAuth({
        accessToken: res.data?.accessToken,
        refreshToken: res.data?.refreshToken,
        user: mergedUser,
      });

      toast.success(`Chào mừng trở lại! 👋`);
      const nextPath =
        typeof from === "string" && from.trim() ? from : rolePath;

      navigate(nextPath, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Tên đăng nhập hoặc mật khẩu không đúng";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setGBusy(true);
    try {
      const loginWithGoogle = () => {
        const redirectUri = window.location.origin;
        window.location.href =
          "http://localhost:9098/realms/micro-services/protocol/openid-connect/auth" +
          "?client_id=frontend-client" +
          "&response_type=code" +
          `&scope=${encodeURIComponent("openid email profile")}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}`;
      };
      loginWithGoogle();
    } catch {
      toast.error("Không thể kết nối Google");
      setGBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Left panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-surface-50 border-r border-white/[0.05]">
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-80 h-80 bg-vermillion-500/15 rounded-full blur-[100px]"
        />

        <div className="relative z-10 flex flex-col p-12 justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-vermillion-500 flex items-center justify-center shadow-glow-md">
              <Bus size={22} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl">
              Di<span className="brand-text">VeNha</span>
            </span>
          </Link>

          {/* Mid content */}
          <div>
            <h2 className="font-display text-4xl font-bold text-ink-900 leading-tight mb-5">
              Mỗi chuyến đi là
              <br />
              <span className="brand-text">một kỷ niệm</span>
            </h2>
            <p className="text-ink-400 leading-relaxed mb-8 max-w-sm">
              Đăng nhập để theo dõi vé, nhận ưu đãi độc quyền và tích điểm đổi
              thưởng hấp dẫn.
            </p>
            <div className="space-y-3">
              {[
                "✦ Đặt vé trong 60 giây",
                "✦ Hoàn tiền 100% nếu huỷ trước 24h",
                "✦ Tích điểm đổi vé miễn phí",
              ].map((t) => (
                <p key={t} className="text-sm text-ink-400 font-display">
                  {t}
                </p>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <p className="font-serif italic text-ink-600 text-sm">
            "Về nhà — hành trình ngắn nhất luôn bắt đầu từ một cú click."
          </p>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-vermillion-500 flex items-center justify-center">
              <Bus size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl">
              Di<span className="brand-text">VeNha</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">
              Đăng nhập
            </h1>
            <p className="text-ink-400 text-sm">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-vermillion-400 hover:text-vermillion-300 font-semibold"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={gBusy}
            className="btn-outline w-full mb-5 py-3.5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {gBusy ? "Đang chuyển hướng..." : "Tiếp tục với Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 divider" />
            <span className="text-xs text-ink-600 font-mono px-2">
              hoặc đăng nhập bằng tài khoản
            </span>
            <div className="flex-1 divider" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Tên đăng nhập</label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-3.5 text-ink-600"
                />
                <input
                  {...register("username")}
                  placeholder="username của bạn"
                  className="field pl-10"
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-vermillion-400 mt-1.5">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Mật khẩu</label>
                <a
                  href="#"
                  className="text-xs text-ink-500 hover:text-vermillion-400 transition-colors"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-3.5 text-ink-600"
                />
                <input
                  {...register("password")}
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  className="field pl-10 pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-3.5 text-ink-500 hover:text-ink-200 transition-colors"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-vermillion-400 mt-1.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-brand w-full py-3.5 text-base mt-2"
            >
              {busy ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
