import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/user-service/useAuth';
import { ROUTES } from '../constants/routes';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Alert } from '../components/common/Alert';
import { ENV } from '../configurations/env';
import { getApiErrorCode } from '../utils/errorUtils';

export const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const handleGoogleLogin = () => {
        if (!ENV.GOOGLE_CLIENT_ID) {
            setError('Thiếu cấu hình Google OAuth. Vui lòng kiểm tra file .env.');
            return;
        }

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', ENV.GOOGLE_CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', ENV.GOOGLE_REDIRECT_URI);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', ENV.GOOGLE_SCOPE);
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');

        window.location.href = authUrl.toString();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate(ROUTES.PROFILE);
        } catch (err: unknown) {
            const code = getApiErrorCode(err);
            if (code === 1006) setError('Email chưa được xác minh. Vui lòng kiểm tra hộp thư.');
            else if (code === 1007) setError('Tài khoản đã bị khóa.');
            else setError('Email hoặc mật khẩu không đúng.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1e2330 0%, #4a3728 100%)' }}>
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 0, transparent 60px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 0, transparent 60px)',
                    }}
                />
                <div className="relative z-10 p-12 flex flex-col justify-between w-full">
                    <Link to={ROUTES.HOME} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">D</span>
                        </div>
                        <span className="text-white font-bold text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>DiVeNha</span>
                    </Link>

                    <div>
                        <h2 className="text-5xl font-black text-white mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Chào mừng<br />
                            <span className="text-amber-400">trở lại</span>
                        </h2>
                        <p className="text-slate-300 text-base leading-relaxed mb-8">
                            Đăng nhập để xem lịch sử đặt vé, theo dõi chuyến đi và nhận ưu đãi độc quyền.
                        </p>
                        <div className="grid grid-cols-3 gap-6">
                            {[['500+', 'Tuyến xe'], ['2M+', 'Khách hàng'], ['98%', 'Hài lòng']].map(([n, l]) => (
                                <div key={l}>
                                    <div className="text-2xl font-bold text-amber-400" style={{ fontFamily: 'Playfair Display, serif' }}>{n}</div>
                                    <div className="text-slate-400 text-xs mt-1">{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8">
                        <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-6">
                            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">D</span>
                            </div>
                            <span className="font-bold text-slate-800" style={{ fontFamily: 'Playfair Display, serif' }}>DiVeNha</span>
                        </Link>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Đăng nhập
                    </h1>
                    <p className="text-slate-500 text-sm mb-8">
                        Chưa có tài khoản?{' '}
                        <Link to={ROUTES.REGISTER} className="text-amber-600 font-medium hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>

                    {error && <Alert type="error" message={error} />}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-5">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="ban@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
                                <a href="#" className="text-xs text-amber-600 hover:underline">Quên mật khẩu?</a>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                                >
                                    {showPw ? 'Ẩn' : 'Hiện'}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
                            Đăng nhập
                        </Button>
                    </form>

                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-slate-400 text-xs">hoặc</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Tiếp tục với Google
                    </button>
                </div>
            </div>
        </div>
    );
};