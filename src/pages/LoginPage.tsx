import React from 'react';
import { Link } from 'react-router-dom';
import { useLoginPage } from '../hooks/pages/useLoginPage';
import { Alert } from '../components/common/Alert';
import loginBgImage from '../assets/login1.jpg';

import { FloatingInput } from '../components/common/FloatingInput';
export const LoginPage: React.FC = () => {
  const {
    ROUTES,
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    showPw,
    setShowPw,
    rememberMe,
    setRememberMe,
    handleGoogleLogin,
    handleSubmit,
    handleNavigateRegister
  } = useLoginPage();

  return (
    <div className="font-body text-on-background bg-background-light h-screen w-screen overflow-hidden flex">
      {/* LEFT PANEL (Editorial) */}
      <div className="hidden md:flex w-[40%] relative overflow-hidden flex-col justify-between p-12">
        {/* Background Image */}
        <img
          alt="Atmospheric Vietnamese landscape"
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
          src={loginBgImage}
        />
        {/* Overlays */}
        <div className="absolute inset-0 radial-overlay"></div>
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Logo */}
        <Link to={ROUTES.HOME} className="relative z-10 w-fit">
          <h1 className="font-display italic font-semibold text-[32px] text-primary-hover tracking-tight hover:scale-[1.02] transition-all">
            Đi Về Nhà
          </h1>
        </Link>

        {/* Bottom Quote Card */}
        <div className="relative z-10 glass-card p-8 rounded-2xl shadow-2xl">
          <p className="font-display italic text-2xl text-white leading-relaxed">
            "Đường về nhà là con đường đẹp nhất."
          </p>
          <div className="mt-6 flex gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-hover shadow-[0_0_8px_#c84d04]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (Form) */}
      <div className="w-full md:w-[60%] bg-background-light flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          
          {/* Mobile Logo */}
          <div className="md:hidden mb-8 text-center">
            <Link to={ROUTES.HOME} className="w-fit inline-block">
              <h1 className="font-display italic font-semibold text-[32px] text-primary-hover tracking-tight">
                Đi Về Nhà
              </h1>
            </Link>
          </div>

          {/* Tab Switcher */}
          <div className="relative bg-black/5 p-1 rounded-full flex mb-10 w-fit mx-auto select-none">
            {/* Sliding highlight indicator */}
            <div className="absolute inset-y-1 bg-surface rounded-full transition-all duration-300 ease-out shadow-sm left-[4px] w-[48%]" />
            
            <button
              type="button"
              className="relative z-10 px-8 py-2.5 text-sm font-semibold transition-colors duration-300 text-primary-hover cursor-default"
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={handleNavigateRegister}
              className="relative z-10 px-8 py-2.5 text-sm font-semibold transition-colors duration-300 text-on-surface-variant hover:text-primary-hover"
            >
              Đăng ký
            </button>
          </div>

          {/* Form Content */}
          <div className="transition-all duration-300">
            <header className="mb-8">
              <h2 className="font-display text-3xl font-semibold mb-2">
                Chào mừng trở lại
              </h2>
              <p className="text-on-surface-variant opacity-80">
                Vui lòng điền thông tin để tiếp tục hành trình.
              </p>
            </header>

            {error && <div className="mb-6"><Alert type="error" message={error} /></div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <FloatingInput
                id="email"
                label="Email của bạn"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <FloatingInput
                id="password"
                label="Mật khẩu"
                isPassword
                showPassword={showPw}
                onTogglePassword={() => setShowPw(!showPw)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-outline-variant/60 text-primary focus:ring-primary-hover/20 cursor-pointer"
                  />
                  <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">
                    Ghi nhớ tôi
                  </span>
                </label>
                <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm font-semibold text-primary-hover hover:underline transition-all">
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="shimmer-btn w-full h-[48px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{loading ? 'Đang Đăng Nhập...' : 'Đăng Nhập'}</span>
                {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
              </button>
            </form>

            {/* Divider */}
            <div className="my-10 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background-light px-4 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-3 bg-white border border-outline-variant/30 h-[48px] rounded-lg hover:shadow-sm hover:border-outline-variant transition-all active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335"></path>
                  <path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" fill="#4285F4"></path>
                  <path d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" fill="#FBBC05"></path>
                  <path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853"></path>
                </svg>
                <span className="text-sm font-semibold">Google</span>
              </button>

            </div>

            <p className="mt-12 text-center text-sm text-on-surface-variant">
              Bằng việc tiếp tục, bạn đồng ý với{' '}
              <a className="text-primary-hover font-semibold hover:underline" href="#">
                Điều khoản dịch vụ
              </a>{' '}
              của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};