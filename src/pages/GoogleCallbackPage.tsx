import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/user-service/useAuth';
import { ROUTES } from '../constants/routes';
import { Alert } from '../components/common/Alert';

export const GoogleCallbackPage: React.FC = () => {
    const { loginWithGoogleCode } = useAuth();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const oauthError = params.get('error');
    const code = params.get('code');
    const immediateError = oauthError
        ? 'Đăng nhập Google bị hủy hoặc thất bại.'
        : !code
            ? 'Thiếu mã xác thực Google.'
            : '';
    const [error, setError] = useState(immediateError);

    useEffect(() => {
        if (!code || oauthError) {
            return;
        }

        loginWithGoogleCode(code)
            .then(() => {
                navigate(ROUTES.PROFILE, { replace: true });
            })
            .catch(() => {
                setError('Không thể đăng nhập với Google. Vui lòng thử lại.');
            });
    }, [code, loginWithGoogleCode, navigate, oauthError]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h1 className="text-xl font-bold text-slate-800 mb-2">Đang xử lý đăng nhập Google</h1>
                {!error && <p className="text-sm text-slate-500">Vui lòng đợi trong giây lát...</p>}
                {error && (
                    <div className="mt-4">
                        <Alert type="error" message={error} />
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
                            className="mt-4 text-sm text-amber-600 hover:underline"
                        >
                            Quay lại trang đăng nhập
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
