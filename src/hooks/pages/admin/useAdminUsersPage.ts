import { useState, useEffect } from 'react';
import { adminUserService } from '../../../services/user-service/adminUserService';
import type { UserResponse } from '../../../types/user-service/response/UserResponse';
import type { UserStatus } from '../../../types/user-service/enums';

export const useAdminUsersPage = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<UserResponse | null>(null);
  const [editStatus, setEditStatus] = useState<UserStatus>('ACTIVE');
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminUserService.getUsers();
      setUsers(res.data.result ?? []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const handleDataChanged = () => {
      fetchUsers();
    };
    window.addEventListener('admin-data-changed', handleDataChanged);
    return () => window.removeEventListener('admin-data-changed', handleDataChanged);
  }, []);

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (u: UserResponse) => {
    setEditUser(u);
    setEditStatus(u.status);
    setEditMsg(null);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setEditLoading(true);
    setEditMsg(null);
    try {
      await adminUserService.updateUserStatus(editUser.id, { status: editStatus });
      await fetchUsers();
      setEditMsg({ type: 'success', text: 'Cập nhật thành công!' });
      setTimeout(() => setEditUser(null), 800);
    } catch {
      setEditMsg({ type: 'error', text: 'Cập nhật thất bại.' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminUserService.deleteUser(deleteTarget.id);
      await fetchUsers();
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    users,
    loading,
    search,
    setSearch,
    editUser,
    setEditUser,
    editStatus,
    setEditStatus,
    editLoading,
    editMsg,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    filtered,
    openEdit,
    handleSaveEdit,
    handleDelete
  };
};
