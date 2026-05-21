import React, { useEffect, useState } from 'react';
import { adminUserService } from '../services/user-service/adminUserService';
import { AdminLayout } from '../components/layouts/AdminLayout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Alert } from '../components/common/Alert';
import type { UserResponse } from '../types/user-service/response/UserResponse';
import type { UserStatus } from '../types/user-service/enums';

export const AdminUsersPage: React.FC = () => {
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchUsers(); }, []);

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

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Playfair Display, serif' }}>
            Quản lý người dùng
          </h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} người dùng</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
        <Input
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Người dùng', 'Trạng thái', 'Vai trò', 'Email', 'Ngày tạo', ''].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold flex-shrink-0">
                          {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" /> : u.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">{u.fullName}</p>
                          <p className="text-xs text-slate-400">{u.phoneNumber || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                          u.status === 'BANNED' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {u.status === 'ACTIVE' ? 'Hoạt động' : u.status === 'BANNED' ? 'Khóa' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {u.roles?.map((r) => r.name).join(', ') || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(u)} className="text-xs text-amber-600 hover:underline font-medium">Đổi trạng thái</button>
                        <button onClick={() => setDeleteTarget(u)} className="text-xs text-red-500 hover:underline font-medium">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400">Không tìm thấy người dùng nào.</div>
            )}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Chỉnh sửa trạng thái">
        {editMsg && <div className="mb-4"><Alert type={editMsg.type} message={editMsg.text} /></div>}
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">Thay đổi trạng thái cho người dùng <strong>{editUser?.fullName}</strong>:</p>
          <select 
            value={editStatus} 
            onChange={(e) => setEditStatus(e.target.value as UserStatus)}
            className="w-full h-[48px] bg-transparent border border-outline-variant/60 rounded-lg px-4 py-3 outline-none focus:border-primary-hover"
          >
            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
            <option value="INACTIVE">Chưa kích hoạt (INACTIVE)</option>
            <option value="BANNED">Khóa (BANNED)</option>
          </select>
          <div className="flex gap-3 mt-2">
            <Button variant="ghost" onClick={() => setEditUser(null)} className="flex-1">Hủy</Button>
            <Button loading={editLoading} onClick={handleSaveEdit} className="flex-1">Lưu</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Xác nhận xóa">
        <p className="text-slate-600 text-sm mb-5">
          Bạn có chắc muốn xóa người dùng <strong>{deleteTarget?.fullName}</strong>?
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="flex-1">Hủy</Button>
          <Button variant="danger" loading={deleteLoading} onClick={handleDelete} className="flex-1">Xóa</Button>
        </div>
      </Modal>
    </AdminLayout>
  );
};