import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/user-service/useAuth';
import { userService } from '../services/user-service/userService';
import { authService } from '../services/user-service/authService';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { Alert } from '../components/common/Alert';
import type { Gender } from '../types/user-service/enums';
import { getApiErrorCode } from '../utils/errorUtils';
import { ROUTES } from '../constants/routes';

// ─── Types ───────────────────────────────────────────────────────────────────

type SidebarSection = 'info' | 'history' | 'promos' | 'password';

interface SidebarItem {
  key: SidebarSection;
  label: string;
  icon: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'info',     label: 'Thông tin cá nhân',  icon: 'person' },
  { key: 'history',  label: 'Lịch sử đặt vé',    icon: 'confirmation_number' },
  { key: 'promos',   label: 'Ưu đãi của tôi',    icon: 'loyalty' },
  { key: 'password', label: 'Đổi mật khẩu',       icon: 'lock' },
];

// ─── Shared input style ───────────────────────────────────────────────────────

const INPUT_BASE =
  'w-full rounded-lg p-3 text-sm border transition-all outline-none focus:border-l-4';

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-container-low)',
  borderColor:     'var(--color-outline-variant)',
  color:           'var(--color-on-surface)',
};

const inputDisabledStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-container)',
  borderColor:     'var(--color-outline-variant)',
  color:           'var(--color-on-surface)',
  opacity:         0.65,
  cursor:          'not-allowed',
};

// ─── Label component ──────────────────────────────────────────────────────────

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label
    className="block text-xs font-bold uppercase tracking-widest mb-1"
    style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-on-surface-variant)' }}
  >
    {children}
  </label>
);

// ─── Component ───────────────────────────────────────────────────────────────

export const ProfilePage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<SidebarSection>('info');

  // ── Info form state ──
  const [infoData, setInfoData] = useState({
    fullName:    user?.fullName    ?? '',
    phoneNumber: user?.phoneNumber ?? '',
    dateOfBirth: user?.dateOfBirth ?? '',
    gender:      (user?.gender     ?? '') as Gender | '',
    avatarUrl:   user?.avatarUrl   ?? '',
  });
  const [infoLoading, setInfoLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [infoMsg,     setInfoMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Password form state ──
  const [pwData, setPwData] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg,     setPwMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Handlers ──

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setInfoMsg(null);
    try {
      const res = await userService.uploadAvatar(file);
      setInfoData((p) => ({ ...p, avatarUrl: res.data.result ?? '' }));
      // Cập nhật AuthContext ngay lập tức để Header và các component khác hiển thị ảnh mới
      await refreshUser();
      setInfoMsg({ type: 'success', text: 'Tải ảnh lên thành công!' });
    } catch {
      setInfoMsg({ type: 'error', text: 'Lỗi tải ảnh lên. Vui lòng thử lại.' });
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoMsg(null);
    try {
      await userService.updateProfile({
        fullName:    infoData.fullName,
        phoneNumber: infoData.phoneNumber || undefined,
        dateOfBirth: infoData.dateOfBirth || undefined,
        gender:      infoData.gender      || undefined,
        avatarUrl:   infoData.avatarUrl   || undefined,
      });
      await refreshUser();
      setInfoMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch {
      setInfoMsg({ type: 'error', text: 'Cập nhật thất bại. Vui lòng thử lại.' });
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePwSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirm) {
      setPwMsg({ type: 'error', text: 'Mật khẩu mới không khớp.' });
      return;
    }
    if (pwData.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 8 ký tự.' });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await userService.changePassword({ oldPassword: pwData.oldPassword, newPassword: pwData.newPassword });
      setPwMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPwData({ oldPassword: '', newPassword: '', confirm: '' });
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      if (code === 1015) setPwMsg({ type: 'error', text: 'Tài khoản này đăng nhập qua Google, chưa có mật khẩu.' });
      else setPwMsg({ type: 'error', text: 'Mật khẩu hiện tại không đúng.' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  // ── Avatar / initials ──
  const avatarInitial = user?.fullName?.[0]?.toUpperCase() ?? '?';
  const isAdmin = user?.roles?.some((r) => r.name.toLowerCase().includes('admin'));

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <Header />

      <main
        className="max-w-[1200px] mx-auto px-6 pt-28 pb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-start">

          {/* ── Sidebar ── */}
          <aside className="flex flex-col gap-2">
            {SIDEBAR_ITEMS.map(({ key, label, icon }) => {
              const isActive = activeSection === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className="flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-medium transition-all text-left"
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--color-primary-container)',
                          color:           'var(--color-on-primary-container)',
                        }
                      : {
                          color: 'var(--color-on-surface-variant)',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        'var(--color-surface-container-high)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}

            {/* Divider */}
            <div
              className="h-px my-1"
              style={{ backgroundColor: 'var(--color-outline-variant)', opacity: 0.4 }}
            />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-medium transition-all text-left"
              style={{ color: 'var(--color-error)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#ba1a1a15';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span>Đăng xuất</span>
            </button>
          </aside>

          {/* ── Main Panel ── */}
          <section className="space-y-6">
            {/* Profile header card */}
            <div
              className="rounded-xl p-8 relative overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                border:          '1px solid var(--color-outline-variant)',
                boxShadow:       '0 8px 20px rgba(92,64,51,0.08)',
              }}
            >
              {/* Decorative circle */}
              <div
                className="absolute top-0 right-0 w-56 h-56 rounded-full -translate-y-1/2 translate-x-1/2"
                style={{ backgroundColor: 'rgba(161,59,0,0.05)' }}
              />

              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                {/* Avatar */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 overflow-hidden"
                  style={{
                    backgroundColor: 'var(--color-secondary-container)',
                    color:           'var(--color-on-secondary-container)',
                    fontFamily:      'Playfair Display, serif',
                  }}
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    avatarInitial
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1
                    className="text-2xl font-semibold mb-1"
                    style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-surface)' }}
                  >
                    {user?.fullName ?? '—'}
                  </h1>
                  <p className="text-sm mb-3" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {user?.email}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {/* Active status */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Hoạt động
                    </span>

                    {/* Email verified */}
                    {user?.isEmailVerified && (
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                        ✓ Email đã xác minh
                      </span>
                    )}

                    {/* Roles */}
                    {user?.roles?.map((r) => (
                      <span
                        key={r.id}
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: 'var(--color-secondary-fixed)',
                          color:           'var(--color-on-secondary-fixed)',
                        }}
                      >
                        {r.name}
                      </span>
                    ))}

                    {/* Admin badge prominence */}
                    {isAdmin && (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{ backgroundColor: '#F4600C', color: '#ffffff' }}
                      >
                        ⚡ Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Content Card ── */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                border:          '1px solid var(--color-outline-variant)',
                boxShadow:       '0 8px 20px rgba(92,64,51,0.08)',
              }}
            >
              {/* Tab strip */}
              <div
                className="flex"
                style={{ borderBottom: '1px solid var(--color-outline-variant)' }}
              >
                {([
                  { key: 'info',     label: 'Thông tin cá nhân' },
                  { key: 'password', label: 'Đổi mật khẩu' },
                ] as { key: SidebarSection; label: string }[]).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className="px-8 py-4 text-sm font-medium transition-all"
                    style={
                      activeSection === key
                        ? {
                            color:        'var(--color-primary)',
                            fontWeight:   700,
                            borderBottom: '2px solid var(--color-primary)',
                          }
                        : { color: 'var(--color-on-surface-variant)' }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {/* ── Info Tab ── */}
                {activeSection === 'info' && (
                  <>
                    <h2
                      className="text-2xl font-semibold mb-6"
                      style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-surface)' }}
                    >
                      Thông tin cá nhân
                    </h2>

                    {infoMsg && (
                      <div className="mb-5">
                        <Alert type={infoMsg.type} message={infoMsg.text} />
                      </div>
                    )}

                    <form onSubmit={handleInfoSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div>
                        <FieldLabel>Họ và tên</FieldLabel>
                        <input
                          type="text"
                          className={INPUT_BASE}
                          style={inputStyle}
                          placeholder="Nhập họ và tên"
                          value={infoData.fullName}
                          onChange={(e) => setInfoData((p) => ({ ...p, fullName: e.target.value }))}
                          onFocus={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '4px';
                            (e.currentTarget as HTMLElement).style.borderLeftColor = '#F4600C';
                          }}
                          onBlur={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '1px';
                          }}
                          required
                        />
                      </div>

                      {/* Email (read-only) */}
                      <div>
                        <FieldLabel>Email</FieldLabel>
                        <input
                          type="email"
                          className={INPUT_BASE}
                          style={inputDisabledStyle}
                          value={user?.email ?? ''}
                          readOnly
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <FieldLabel>Số điện thoại</FieldLabel>
                        <input
                          type="tel"
                          className={INPUT_BASE}
                          style={inputStyle}
                          placeholder="0xxx xxx xxx"
                          value={infoData.phoneNumber}
                          onChange={(e) => setInfoData((p) => ({ ...p, phoneNumber: e.target.value }))}
                          onFocus={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '4px';
                            (e.currentTarget as HTMLElement).style.borderLeftColor = '#F4600C';
                          }}
                          onBlur={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '1px';
                          }}
                        />
                      </div>

                      {/* Date of birth */}
                      <div>
                        <FieldLabel>Ngày sinh</FieldLabel>
                        <div className="relative">
                          <input
                            type="date"
                            className={INPUT_BASE}
                            style={inputStyle}
                            value={infoData.dateOfBirth}
                            onChange={(e) => setInfoData((p) => ({ ...p, dateOfBirth: e.target.value }))}
                            onFocus={(e) => {
                              (e.currentTarget as HTMLElement).style.borderLeftWidth = '4px';
                              (e.currentTarget as HTMLElement).style.borderLeftColor = '#F4600C';
                            }}
                            onBlur={(e) => {
                              (e.currentTarget as HTMLElement).style.borderLeftWidth = '1px';
                            }}
                          />
                          <span
                            className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none"
                            style={{ color: 'var(--color-outline)' }}
                          >
                            calendar_month
                          </span>
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <FieldLabel>Giới tính</FieldLabel>
                        <select
                          className={INPUT_BASE + ' appearance-none'}
                          style={inputStyle}
                          value={infoData.gender}
                          onChange={(e) => setInfoData((p) => ({ ...p, gender: e.target.value as Gender }))}
                          onFocus={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '4px';
                            (e.currentTarget as HTMLElement).style.borderLeftColor = '#F4600C';
                          }}
                          onBlur={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '1px';
                          }}
                        >
                          <option value="">Không chọn</option>
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      </div>

                      {/* Avatar Upload */}
                      <div>
                        <FieldLabel>Ảnh đại diện (Avatar)</FieldLabel>
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            id="avatar-upload"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="cursor-pointer px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                            style={{
                              backgroundColor: 'var(--color-secondary-container)',
                              color: 'var(--color-on-secondary-container)',
                              border: '1px solid var(--color-outline-variant)'
                            }}
                          >
                            {avatarUploading ? 'Đang tải...' : 'Chọn file ảnh'}
                          </label>
                          
                          {/* Preview selected image if any */}
                          {infoData.avatarUrl && (
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                              <img src={infoData.avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="md:col-span-2 flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={infoLoading}
                          className="px-10 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: 'var(--color-primary)',
                            color:           'var(--color-on-primary)',
                            boxShadow:       '0 8px 20px rgba(92,64,51,0.15)',
                          }}
                        >
                          {infoLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {/* ── Password Tab ── */}
                {activeSection === 'password' && (
                  <>
                    <h2
                      className="text-2xl font-semibold mb-6"
                      style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-surface)' }}
                    >
                      Đổi mật khẩu
                    </h2>

                    {!user?.hasPassword && (
                      <div className="mb-5">
                        <Alert type="info" message="Tài khoản của bạn đăng nhập qua Google. Vui lòng thiết lập mật khẩu lần đầu." />
                      </div>
                    )}

                    {pwMsg && (
                      <div className="mb-5">
                        <Alert type={pwMsg.type} message={pwMsg.text} />
                      </div>
                    )}

                    <form onSubmit={handlePwSave} className="flex flex-col gap-5 max-w-md">
                      {user?.hasPassword && (
                        <div>
                          <FieldLabel>Mật khẩu hiện tại</FieldLabel>
                          <input
                            type="password"
                            className={INPUT_BASE}
                            style={inputStyle}
                            placeholder="••••••••"
                            value={pwData.oldPassword}
                            onChange={(e) => setPwData((p) => ({ ...p, oldPassword: e.target.value }))}
                            onFocus={(e) => {
                              (e.currentTarget as HTMLElement).style.borderLeftWidth = '4px';
                              (e.currentTarget as HTMLElement).style.borderLeftColor = '#F4600C';
                            }}
                            onBlur={(e) => {
                              (e.currentTarget as HTMLElement).style.borderLeftWidth = '1px';
                            }}
                            required
                          />
                        </div>
                      )}

                      <div>
                        <FieldLabel>Mật khẩu mới</FieldLabel>
                        <input
                          type="password"
                          className={INPUT_BASE}
                          style={inputStyle}
                          placeholder="Ít nhất 8 ký tự"
                          value={pwData.newPassword}
                          onChange={(e) => setPwData((p) => ({ ...p, newPassword: e.target.value }))}
                          onFocus={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '4px';
                            (e.currentTarget as HTMLElement).style.borderLeftColor = '#F4600C';
                          }}
                          onBlur={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '1px';
                          }}
                          required
                        />
                      </div>

                      <div>
                        <FieldLabel>Xác nhận mật khẩu mới</FieldLabel>
                        <input
                          type="password"
                          className={INPUT_BASE}
                          style={inputStyle}
                          placeholder="Nhập lại mật khẩu mới"
                          value={pwData.confirm}
                          onChange={(e) => setPwData((p) => ({ ...p, confirm: e.target.value }))}
                          onFocus={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '4px';
                            (e.currentTarget as HTMLElement).style.borderLeftColor = '#F4600C';
                          }}
                          onBlur={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '1px';
                          }}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={pwLoading}
                        className="px-10 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed self-start"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color:           'var(--color-on-primary)',
                          boxShadow:       '0 8px 20px rgba(92,64,51,0.15)',
                        }}
                      >
                        {pwLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                      </button>
                    </form>
                  </>
                )}

                {/* ── Booking History placeholder ── */}
                {activeSection === 'history' && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span
                      className="material-symbols-outlined text-6xl mb-4"
                      style={{ color: 'var(--color-outline-variant)' }}
                    >
                      confirmation_number
                    </span>
                    <h2
                      className="text-xl font-semibold mb-2"
                      style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-surface)' }}
                    >
                      Lịch sử đặt vé
                    </h2>
                    <p style={{ color: 'var(--color-on-surface-variant)' }}>
                      Chưa có vé nào được đặt.
                    </p>
                  </div>
                )}

                {/* ── Promos placeholder ── */}
                {activeSection === 'promos' && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span
                      className="material-symbols-outlined text-6xl mb-4"
                      style={{ color: 'var(--color-outline-variant)' }}
                    >
                      loyalty
                    </span>
                    <h2
                      className="text-xl font-semibold mb-2"
                      style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-surface)' }}
                    >
                      Ưu đãi của tôi
                    </h2>
                    <p style={{ color: 'var(--color-on-surface-variant)' }}>
                      Bạn chưa có ưu đãi nào.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Brand illustration ── */}
            <div className="relative h-44 rounded-xl overflow-hidden group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGehyfz8kfI4n9EBOrG7CjKgY4heord2xR4obMC_MRE_4gPhwMTUPpmNjhomkj2XZQgvnWjvI9N0lqIWEJwtdnXD95-MRPZcO_lZYeMolH7dOKyILQZ_jFcxY44qkj4qu-wuO_YJVXdBir2D7S6h0hCQMJFHjmDOhmbiiZAsmyOlecxOev1Bv7nw7ygaLJHCJvL0x4pjkAd_M25mTSu3OolbAisiCh0ZJ9NX5mqLpKNbVN8DHG05nV4Iu7vydho2CTRhuCaIh5yiM"
                alt="Vietnamese countryside at golden hour"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 flex items-end p-8"
                style={{ background: 'linear-gradient(to top, rgba(161,59,0,0.75) 0%, transparent 100%)' }}
              >
                <p
                  className="text-white italic text-lg font-semibold"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  "Hành trình trở về là hành trình tuyệt vời nhất."
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};