import React from 'react';
import { AdminLayout } from '../components/layouts/AdminLayout';

export const AdminRolesPage: React.FC = () => {
    return (
        <AdminLayout>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h1 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Quản lý vai trò
                </h1>
                <p className="text-slate-500 text-sm">
                    Tính năng đang được hoàn thiện. Bạn có thể tiếp tục dùng Dashboard và Quản lý người dùng.
                </p>
            </div>
        </AdminLayout>
    );
};
