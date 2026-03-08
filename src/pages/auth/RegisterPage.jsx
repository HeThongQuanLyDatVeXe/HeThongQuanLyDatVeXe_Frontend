import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import {
  Bus,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { authApi } from "../../services/api";
import { useAuthStore } from "../../store";
import toast from "react-hot-toast";

const schema = yup.object({
  username: yup
    .string()
    .min(3, "Tối thiểu 3 ký tự")
    .max(30)
    .required("Bắt buộc"),
  email: yup.string().email("Email không hợp lệ").required("Bắt buộc"),
  fullName: yup.string().min(2, "Tối thiểu 2 ký tự").required("Bắt buộc"),
  phoneNumber: yup
    .string()
    .matches(/^(0[3|5|7|8|9])+([0-9]{8})$/, "Số điện thoại không hợp lệ")
    .required("Bắt buộc"),
  password: yup
    .string()
    .min(6, "Tối thiểu 6 ký tự")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Cần chữ hoa, chữ thường và số")
    .required("Bắt buộc"),
  confirm: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu không khớp")
    .required("Bắt buộc"),
});

const PERKS = [
  "Tích điểm đổi vé miễn phí",
  "Ưu đãi 15% cho lần đặt đầu tiên",
  "Quản lý vé dễ dàng",
  "Hỗ trợ ưu tiên 24/7",
];

export default function RegisterPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const pwd = watch("password", "");
  const strength = !pwd
    ? 0
    : pwd.length < 6
      ? 1
      : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)
        ? pwd.length >= 10
          ? 3
          : 2
        : 1;

  const onSubmit = async (data) => {
    setBusy(true);
    try {
      const { confirm, ...payload } = data;
      const res = await authApi.register(payload);
      setAuth(res.data);
      toast.success("Chào mừng đến với DiVeNha! 🎉");
      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại",
      );
    } finally {
      setBusy(false);
    }
  };

  const F = ({
    name,
    label,
    placeholder,
    icon: Icon,
    type = "text",
    right,
  }) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Icon
          size={15}
          className="absolute left-3.5 top-3.5 text-ink-600 pointer-events-none"
        />
        <input
          {...register(name)}
          type={type}
          placeholder={placeholder}
          className="field pl-10 pr-10 text-sm"
        />
        {right}
      </div>
      {errors[name] && (
        <p className="text-xs text-vermillion-400 mt-1">
          {errors[name].message}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Right: form ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 order-1 lg:order-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-vermillion-500 flex items-center justify-center shadow-glow-sm">
              <Bus size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl">
              Di<span className="brand-text">VeNha</span>
            </span>
          </Link>

          <div className="mb-7">
            <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">
              Tạo tài khoản
            </h1>
            <p className="text-ink-400 text-sm">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-vermillion-400 hover:text-vermillion-300 font-semibold"
              >
                Đăng nhập
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <F
                name="fullName"
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                icon={User}
              />
              <F
                name="phoneNumber"
                label="Số điện thoại"
                placeholder="0901234567"
                icon={Phone}
              />
            </div>
            <F
              name="username"
              label="Tên đăng nhập"
              placeholder="username"
              icon={User}
            />
            <F
              name="email"
              label="Email"
              placeholder="email@gmail.com"
              icon={Mail}
              type="email"
            />

            <div>
              <label className="label">Mật khẩu</label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-3.5 text-ink-600"
                />
                <input
                  {...register("password")}
                  type={show ? "text" : "password"}
                  placeholder="Tối thiểu 6 ký tự"
                  className="field pl-10 pr-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-3.5 text-ink-500 hover:text-ink-200"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {pwd && (
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        strength >= n
                          ? n === 1
                            ? "bg-vermillion-500"
                            : n === 2
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          : "bg-surface-400"
                      }`}
                    />
                  ))}
                </div>
              )}
              {errors.password && (
                <p className="text-xs text-vermillion-400 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-3.5 text-ink-600"
                />
                <input
                  {...register("confirm")}
                  type={show ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  className="field pl-10 text-sm"
                />
              </div>
              {errors.confirm && (
                <p className="text-xs text-vermillion-400 mt-1">
                  {errors.confirm.message}
                </p>
              )}
            </div>

            <p className="text-xs text-ink-600 pt-1">
              Bằng cách đăng ký, bạn đồng ý với{" "}
              <a href="#" className="text-ink-400 hover:text-vermillion-400">
                Điều khoản
              </a>{" "}
              và{" "}
              <a href="#" className="text-ink-400 hover:text-vermillion-400">
                Chính sách bảo mật
              </a>
              .
            </p>

            <button
              type="submit"
              disabled={busy}
              className="btn-brand w-full py-3.5 text-base"
            >
              {busy ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Tạo tài khoản</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* ── Left: perks ────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[38%] bg-surface-100 border-r border-white/[0.05]
                      flex-col justify-center p-12 order-2 lg:order-1"
      >
        <div className="mb-8">
          <p className="text-xs font-display uppercase tracking-widest text-vermillion-400 mb-4">
            Lợi ích thành viên
          </p>
          <h2 className="font-display text-3xl font-bold text-ink-900 mb-3">
            Gia nhập cộng đồng
            <br />
            <span className="brand-text">2 triệu</span> hành khách
          </h2>
        </div>
        <div className="space-y-4">
          {PERKS.map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30
                              flex items-center justify-center flex-shrink-0"
              >
                <CheckCircle2 size={14} className="text-emerald-400" />
              </div>
              <span className="text-sm text-ink-300">{p}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
