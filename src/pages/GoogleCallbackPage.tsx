import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/user-service/useAuth';
import { ROUTES } from '../constants/routes';
import { Alert } from '../components/common/Alert';
import { cookieUtils } from '../utils/cookieUtils';

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 1000;
const PROCESSED_CODE_KEY = 'google_oauth_processed_code';

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
        if (!code || oauthError) return;
        const storedCode = window.sessionStorage.getItem(PROCESSED_CODE_KEY);
        if (storedCode === code && cookieUtils.getAccessToken()) {
            navigate(ROUTES.PROFILE, { replace: true });
            return;
        }
        console.log('✅ CALLING API - code:', code);
        console.trace();

        let isActive = true;
        let timeoutId: number | undefined;

        const tryLogin = async (attempt: number) => {
            try {
                await loginWithGoogleCode(code);
                window.sessionStorage.setItem(PROCESSED_CODE_KEY, code);
                navigate(ROUTES.PROFILE, { replace: true });
            } catch (err: unknown) {
                const status = (err as { response?: { status?: number } })?.response?.status;
                if (status === 503 && attempt < MAX_RETRIES) {
                    const delay = BASE_RETRY_DELAY_MS * (attempt + 1);
                    timeoutId = window.setTimeout(() => tryLogin(attempt + 1), delay);
                    return;
                }
                if (status === 400) {
                    if (isActive) {
                        setError('Mã xác thực đã hết hạn hoặc đã được dùng. Vui lòng đăng nhập lại.');
                    }
                    return;
                }
                if (isActive) {
                    setError('Không thể đăng nhập với Google. Vui lòng thử lại.');
                }
            }
        };

        void tryLogin(0);

        return () => {
            isActive = false;
            if (timeoutId) window.clearTimeout(timeoutId);
        };
    }, [code, oauthError, loginWithGoogleCode, navigate]);

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