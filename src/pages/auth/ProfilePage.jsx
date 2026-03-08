import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { User, Phone, Mail, Save, Star } from "lucide-react";
import { authApi } from "../../services/api";
import { useAuthStore } from "../../store";
import { normalizeMaybeMojibake } from "../../utils/auth";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit } = useForm({ defaultValues: user || {} });

  const onSubmit = async (data) => {
    setBusy(true);
    try {
      const res = await authApi.updateMe(data);
      updateUser(res.data);
      toast.success("Cập nhật thành công!");
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setBusy(false);
    }
  };

  const displayName =
    normalizeMaybeMojibake(user?.fullName || "") || "Chưa cập nhật";
  const displayEmail = normalizeMaybeMojibake(user?.email || "");

  return (
    <div className="wrap py-10 max-w-3xl">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-6 p-6 flex items-center gap-5"
      >
        <div className="w-18 h-18 relative">
          <div
            className="w-16 h-16 rounded-2xl bg-vermillion-500/15 border-2 border-vermillion-500/30
                          flex items-center justify-center overflow-hidden"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display font-bold text-2xl text-vermillion-400">
                {(displayName || displayEmail || "U")[0].toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-ink-900">
            {displayName}
          </h1>
          <p className="text-sm text-ink-400">{displayEmail}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {user?.loyaltyPoints > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <Star size={11} className="fill-amber-400" />
                {user.loyaltyPoints.toLocaleString()} điểm
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h2 className="font-display font-semibold text-ink-900 mb-5 flex items-center gap-2">
          <User size={16} className="text-vermillion-400" /> Thông tin cá nhân
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Họ và tên</label>
              <div className="relative">
                <User
                  size={14}
                  className="absolute left-3.5 top-3.5 text-ink-600"
                />
                <input
                  {...register("fullName")}
                  className="field pl-10 text-sm"
                  placeholder="Họ và tên"
                />
              </div>
            </div>
            <div>
              <label className="label">Số điện thoại</label>
              <div className="relative">
                <Phone
                  size={14}
                  className="absolute left-3.5 top-3.5 text-ink-600"
                />
                <input
                  {...register("phoneNumber")}
                  className="field pl-10 text-sm"
                  placeholder="0901234567"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">
              Email{" "}
              <span className="text-ink-700 normal-case font-normal">
                (không thể thay đổi)
              </span>
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3.5 top-3.5 text-ink-700"
              />
              <input
                disabled
                value={displayEmail}
                className="field pl-10 text-sm opacity-40 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="label">Địa chỉ đón mặc định</label>
            <input
              {...register("defaultPickupAddress")}
              className="field text-sm"
              placeholder="Ví dụ: 123 Nguyễn Huệ, Q1, TP.HCM"
            />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={busy} className="btn-brand">
              {busy ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={15} /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
