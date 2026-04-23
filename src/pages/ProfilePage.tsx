import React, { useState } from 'react';
import { useAuth } from '../hooks/user-service/useAuth';
import { userService } from '../services/user-service/userService';
import { authService } from '../services/user-service/authService';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import type { Gender } from '../types/user-service/enums';
import { getApiErrorCode } from '../utils/errorUtils';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<'info' | 'password'>('info');

  // Info form
  const [infoData, setInfoData] = useState({
    fullName: user?.fullName ?? '',
    phoneNumber: user?.phoneNumber ?? '',
    dateOfBirth: user?.dateOfBirth ?? '',
    gender: (user?.gender ?? '') as Gender | '',
    avatarUrl: user?.avatarUrl ?? '',
  });
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password form
  const [pwData, setPwData] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoMsg(null);
    try {
      await userService.updateMyInfo({
        fullName: infoData.fullName,
        phoneNumber: infoData.phoneNumber || undefined,
        dateOfBirth: infoData.dateOfBirth || undefined,
        gender: infoData.gender || undefined,
        avatarUrl: infoData.avatarUrl || undefined,
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
      await authService.changePassword({ oldPassword: pwData.oldPassword, newPassword: pwData.newPassword });
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

  const statusLabel: Record<string, string> = {
    ACTIVE: 'Hoạt động',
    BANNED: 'Đã khóa',
    INACTIVE: 'Không hoạt động',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        {/* Profile header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : user?.fullName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              {user?.fullName}
            </h1>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {statusLabel[user?.status ?? 'ACTIVE']}
              </span>
              {user?.isEmailVerified && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">✓ Email đã xác minh</span>
              )}
              {user?.roles?.map((r) => (
                <span key={r.id} className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">{r.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100 mb-6 w-fit">
          {(['info', 'password'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              {t === 'info' ? 'Thông tin cá nhân' : 'Đổi mật khẩu'}
            </button>
          ))}
        </div>

        {/* Info tab */}
        {tab === 'info' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">Thông tin cá nhân</h2>
            {infoMsg && <div className="mb-4"><Alert type={infoMsg.type} message={infoMsg.text} /></div>}
            <form onSubmit={handleInfoSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Họ và tên"
                value={infoData.fullName}
                onChange={(e) => setInfoData((p) => ({ ...p, fullName: e.target.value }))}
                required
              />
              <Input
                label="Email"
                value={user?.email ?? ''}
                disabled
                className="opacity-60"
              />
              <Input
                label="Số điện thoại"
                value={infoData.phoneNumber}
                onChange={(e) => setInfoData((p) => ({ ...p, phoneNumber: e.target.value }))}
                placeholder="0901234567"
              />
              <Input
                label="Ngày sinh"
                type="date"
                value={infoData.dateOfBirth}
                onChange={(e) => setInfoData((p) => ({ ...p, dateOfBirth: e.target.value }))}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Giới tính</label>
                <select
                  value={infoData.gender}
                  onChange={(e) => setInfoData((p) => ({ ...p, gender: e.target.value as Gender }))}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="">Không chọn</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <Input
                label="Avatar URL"
                value={infoData.avatarUrl}
                onChange={(e) => setInfoData((p) => ({ ...p, avatarUrl: e.target.value }))}
                placeholder="https://..."
              />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" loading={infoLoading}>Lưu thay đổi</Button>
              </div>
            </form>
          </div>
        )}

        {/* Password tab */}
        {tab === 'password' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 max-w-md">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">Đổi mật khẩu</h2>
            {!user?.hasPassword && (
              <div className="mb-4">
                <Alert type="info" message="Tài khoản của bạn đăng nhập qua Google. Vui lòng thiết lập mật khẩu lần đầu." />
              </div>
            )}
            {pwMsg && <div className="mb-4"><Alert type={pwMsg.type} message={pwMsg.text} /></div>}
            <form onSubmit={handlePwSave} className="flex flex-col gap-4">
              {user?.hasPassword && (
                <Input
                  label="Mật khẩu hiện tại"
                  type="password"
                  placeholder="••••••••"
                  value={pwData.oldPassword}
                  onChange={(e) => setPwData((p) => ({ ...p, oldPassword: e.target.value }))}
                  required
                />
              )}
              <Input
                label="Mật khẩu mới"
                type="password"
                placeholder="Ít nhất 8 ký tự"
                value={pwData.newPassword}
                onChange={(e) => setPwData((p) => ({ ...p, newPassword: e.target.value }))}
                required
              />
              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={pwData.confirm}
                onChange={(e) => setPwData((p) => ({ ...p, confirm: e.target.value }))}
                required
              />
              <Button type="submit" loading={pwLoading}>Đổi mật khẩu</Button>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};