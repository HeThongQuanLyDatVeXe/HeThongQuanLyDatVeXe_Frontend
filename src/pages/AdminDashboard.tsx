import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/user-service/useAuth';
import { AdminLayout } from '../components/layouts/AdminLayout';
import { userService } from '../services/user-service/userService';
import type { UserResponse } from '../types/user-service/response/UserResponse';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getUsers()
      .then((res) => setUsers(res.data.result ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Tổng người dùng', value: users.length, icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { label: 'Đang hoạt động', value: users.filter((u) => u.status === 'ACTIVE').length, icon: '✅', color: 'bg-green-50 text-green-600' },
    { label: 'Đã xác minh email', value: users.filter((u) => u.isEmailVerified).length, icon: '📧', color: 'bg-amber-50 text-amber-600' },
    { label: 'Bị khóa', value: users.filter((u) => u.status === 'BANNED').length, icon: '🚫', color: 'bg-red-50 text-red-600' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Playfair Display, serif' }}>
          Xin chào, {user?.fullName} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Đây là tổng quan hệ thống DiVeNha.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${color}`}>
                  {icon}
                </div>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Người dùng gần đây</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Họ tên', 'Email', 'Trạng thái', 'Vai trò', 'Ngày tạo'].map((h) => (
                      <th key={h} className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 10).map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold flex-shrink-0">
                            {u.fullName?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-700">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-500">{u.email}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                          u.status === 'BANNED' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.status === 'ACTIVE' ? 'Hoạt động' : u.status === 'BANNED' ? 'Khóa' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-500">
                        {u.roles?.map((r) => r.name).join(', ') || '—'}
                      </td>
                      <td className="py-3 px-2 text-slate-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};