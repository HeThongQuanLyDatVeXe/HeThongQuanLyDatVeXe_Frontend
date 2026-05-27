import React from 'react';
import { useGoogleCallbackPage } from '../hooks/pages/useGoogleCallbackPage';

export const GoogleCallbackPage: React.FC = () => {
    const {
        error,
        handleNavigateLogin
    } = useGoogleCallbackPage();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h1 className="text-xl font-bold text-slate-800 mb-2">Đang xử lý đăng nhập Google</h1>
                {!error && <p className="text-sm text-slate-500">Vui lòng đợi trong giây lát...</p>}
                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                        {error}
                        <br />
                        <button
                            type="button"
                            onClick={handleNavigateLogin}
                            className="mt-3 text-red-700 hover:text-red-800 underline font-semibold"
                        >
                            Quay lại trang đăng nhập
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};