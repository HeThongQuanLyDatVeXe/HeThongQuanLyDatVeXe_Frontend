import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/user-service/useAuth';
import { userService } from '../../services/user-service/userService';
import type { Gender } from '../../types/user-service/enums';
import { getApiErrorCode } from '../../utils/errorUtils';
import { ROUTES } from '../../constants/routes';

export type SidebarSection = 'info' | 'history' | 'promos' | 'password' | 'delete_account';

export interface SidebarItem {
  key: SidebarSection;
  label: string;
  icon: string;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'info',     label: 'Thông tin cá nhân',  icon: 'person' },
  { key: 'history',  label: 'Lịch sử đặt vé',    icon: 'confirmation_number' },
  { key: 'promos',   label: 'Ưu đãi của tôi',    icon: 'loyalty' },
  { key: 'password', label: 'Đổi mật khẩu',       icon: 'lock' },
  { key: 'delete_account', label: 'Xóa tài khoản', icon: 'person_remove' },
];

export const useProfilePage = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<SidebarSection>('info');

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

  const [pwData, setPwData] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg,     setPwMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setInfoMsg(null);
    try {
      const res = await userService.uploadAvatar(file);
      if (res.data.code && res.data.code !== 1000) {
        throw new Error(res.data.message || 'Lỗi từ server');
      }
      setInfoData((p) => ({ ...p, avatarUrl: res.data.result ?? '' }));
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
      setPwMsg({ type: 'success', text: user?.hasPassword ? 'Đổi mật khẩu thành công!' : 'Tạo mật khẩu thành công!' });
      setPwData({ oldPassword: '', newPassword: '', confirm: '' });
      await refreshUser();
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

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteMsg(null);
    try {
      await userService.deleteAccount();
      await logout();
      navigate(ROUTES.HOME);
    } catch {
      setDeleteMsg({ type: 'error', text: 'Xóa tài khoản thất bại. Vui lòng thử lại sau.' });
      setDeleteLoading(false);
    }
  };

  const avatarInitial = user?.fullName?.[0]?.toUpperCase() ?? '?';
  const isAdmin = user?.roles?.some((r) => r.name.toLowerCase().includes('admin'));

  return {
    user,
    activeSection,
    setActiveSection,
    infoData,
    setInfoData,
    infoLoading,
    avatarUploading,
    infoMsg,
    pwData,
    setPwData,
    pwLoading,
    pwMsg,
    deleteLoading,
    deleteMsg,
    showConfirmDelete,
    setShowConfirmDelete,
    handleAvatarUpload,
    handleInfoSave,
    handlePwSave,
    handleLogout,
    handleDeleteAccount,
    avatarInitial,
    isAdmin
  };
};
