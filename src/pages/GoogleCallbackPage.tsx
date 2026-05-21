import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/user-service/useAuth';
import { ROUTES } from '../constants/routes';
import { getApiErrorCode } from '../utils/errorUtils';
import { useToast } from '../contexts/ToastContext';
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
    const { error: showError, success } = useToast();
    const immediateError = oauthError
        ? 'Đăng nhập Google bị hủy hoặc thất bại.'
        : !code
            ? 'Thiếu mã xác thực Google.'
            : '';
    const [error, setError] = useState(immediateError);

    useEffect(() => {
        if (immediateError) {
            showError(immediateError);
        }
    }, [immediateError, showError]);

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
                success('Đăng nhập Google thành công!');
                navigate(ROUTES.PROFILE, { replace: true });
            } catch (err: any) {
                console.error('Google login error:', err);
                const status = err?.response?.status;
                const apiCode = getApiErrorCode(err);
                const message = err?.response?.data?.message || 'Không thể đăng nhập với Google. Vui lòng thử lại.';

                if (status === 503 && attempt < MAX_RETRIES) {
                    const delay = BASE_RETRY_DELAY_MS * (attempt + 1);
                    timeoutId = window.setTimeout(() => tryLogin(attempt + 1), delay);
                    return;
                }
                
                if (isActive) {
                    if (apiCode === 1002) {
                        setError('Email này đã được đăng ký bằng phương thức khác.');
                        showError('Email này đã được đăng ký bằng phương thức khác (Vd: Mật khẩu).');
                    } else if (status === 400) {
                        setError('Mã xác thực đã hết hạn hoặc đã được dùng.');
                        showError('Mã xác thực đã hết hạn hoặc đã được dùng.');
                    } else {
                        setError(message);
                        showError(message);
                    }
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
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                        {error}
                        <br />
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
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