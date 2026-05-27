import React from 'react';
import { Link } from 'react-router-dom';
import loginBgImage from '../assets/login1.jpg';
import { useRegisterPage } from '../hooks/pages/useRegisterPage';

import { FloatingInput } from '../components/common/FloatingInput';

export const RegisterPage: React.FC = () => {
  const {
    step,
    setStep,
    formData,
    formErrors,
    formLoading,
    otp,
    otpLoading,
    otpError,
    setOtpError,
    resendCooldown,
    showPw,
    setShowPw,
    showConfirmPw,
    setShowConfirmPw,
    strength,
    handleFormChange,
    handleSubmitForm,
    handleOtpChange,
    handleOtpKeyDown,
    handleVerify,
    handleResend,
    handleGoogleLogin,
    navigate,
    ROUTES
  } = useRegisterPage();

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

      {/* RIGHT PANEL (Form/OTP) */}
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

          {step === 'form' ? (
            <>
              {/* Tab Switcher */}
              <div className="relative bg-black/5 p-1 rounded-full flex mb-10 w-fit mx-auto select-none">
                {/* Sliding highlight indicator */}
                <div className="absolute inset-y-1 bg-surface rounded-full transition-all duration-300 ease-out shadow-sm left-[50%] w-[48%]" />
                
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="relative z-10 px-8 py-2.5 text-sm font-semibold transition-colors duration-300 text-on-surface-variant hover:text-primary-hover"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  className="relative z-10 px-8 py-2.5 text-sm font-semibold transition-colors duration-300 text-primary-hover cursor-default"
                >
                  Đăng ký
                </button>
              </div>

              {/* Form Content */}
              <div className="transition-all duration-300">
                <header className="mb-8">
                  <h2 className="font-display text-3xl font-semibold mb-2">
                    Bắt đầu hành trình
                  </h2>
                  <p className="text-on-surface-variant opacity-80">
                    Tạo tài khoản để cùng chúng tôi lưu giữ kỷ niệm.
                  </p>
                </header>

                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <FloatingInput
                    id="fullName"
                    label="Họ và tên"
                    type="text"
                    value={formData.fullName}
                    onChange={handleFormChange('fullName')}
                    error={formErrors.fullName}
                    required
                  />

                  <FloatingInput
                    id="email"
                    label="Email của bạn"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange('email')}
                    error={formErrors.email}
                    required
                  />

                  <FloatingInput
                    id="phoneNumber"
                    label="Số điện thoại (tùy chọn)"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleFormChange('phoneNumber')}
                  />

                  <FloatingInput
                    id="password"
                    label="Mật khẩu"
                    isPassword
                    showPassword={showPw}
                    onTogglePassword={() => setShowPw(!showPw)}
                    value={formData.password}
                    onChange={handleFormChange('password')}
                    error={formErrors.password}
                    required
                  />

                  {/* Password Strength Indicator */}
                  {formData.password.length > 0 && (
                    <div className="space-y-2 px-1">
                      <div className="flex gap-1.5 h-1">
                        <div className={`flex-1 rounded-full transition-colors duration-300 ${
                          strength >= 1 ? (strength === 1 ? 'bg-red-500' : strength === 2 ? 'bg-amber-500' : 'bg-green-500') : 'bg-black/5'
                        }`} />
                        <div className={`flex-1 rounded-full transition-colors duration-300 ${
                          strength >= 2 ? (strength === 2 ? 'bg-amber-500' : 'bg-green-500') : 'bg-black/5'
                        }`} />
                        <div className={`flex-1 rounded-full transition-colors duration-300 ${
                          strength >= 3 ? 'bg-green-500' : 'bg-black/5'
                        }`} />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider">
                        <span className="text-on-surface-variant">Độ bảo mật:</span>
                        <span className={`font-bold ${
                          strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-green-500'
                        }`}>
                          {strength === 1 ? 'Yếu' : strength === 2 ? 'Trung bình' : 'Mạnh'}
                        </span>
                      </div>
                    </div>
                  )}

                  <FloatingInput
                    id="confirmPassword"
                    label="Xác nhận mật khẩu"
                    isPassword
                    showPassword={showConfirmPw}
                    onTogglePassword={() => setShowConfirmPw(!showConfirmPw)}
                    value={formData.confirmPassword}
                    onChange={handleFormChange('confirmPassword')}
                    error={formErrors.confirmPassword}
                    required
                  />

                  <p className="text-xs text-on-surface-variant px-1 opacity-80 leading-relaxed">
                    Bằng việc tiếp tục, bạn đồng ý với{' '}
                    <a className="text-primary-hover font-semibold hover:underline" href="#">
                      Điều khoản dịch vụ
                    </a>{' '}
                    của chúng tôi.
                  </p>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="shimmer-btn w-full h-[48px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>{formLoading ? 'Đang Xử Lý...' : 'Tạo Tài Khoản'}</span>
                    {!formLoading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-8 relative">
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
              </div>
            </>
          ) : (
            <div className="transition-all duration-300">
              {/* OTP Icon */}
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse select-none">
                <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
              </div>

              <header className="mb-8">
                <h2 className="font-display text-3xl font-semibold mb-2">
                  Xác minh email
                </h2>
                <p className="text-on-surface-variant opacity-80 leading-relaxed text-sm">
                  Mã OTP 6 chữ số đã được gửi đến hộp thư:<br />
                  <span className="text-primary font-semibold select-all">{formData.email}</span>
                </p>
              </header>

              {otpError && <div className="mb-6"><div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium">{otpError}</div></div>}

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex gap-2.5 justify-between">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      maxLength={1}
                      className="w-12 h-12 md:w-[52px] md:h-[52px] text-center text-lg font-bold border-2 rounded-xl outline-none transition-all
                        border-outline-variant/50 bg-white text-on-background focus:border-primary-hover focus:bg-surface focus:ring-2 focus:ring-primary/20"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="shimmer-btn w-full h-[48px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>{otpLoading ? 'Đang xác minh...' : 'Xác minh'}</span>
                  {!otpLoading && <span className="material-symbols-outlined text-[20px]">verified</span>}
                </button>
              </form>

              <div className="text-center mt-6 select-none">
                <span className="text-on-surface-variant text-sm opacity-80">Chưa nhận được mã? </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-sm font-semibold text-primary-hover hover:underline disabled:text-on-surface-variant/40 disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
                >
                  {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại mã'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setOtpError('');
                }}
                className="mt-8 text-sm text-on-surface-variant hover:text-primary transition-all flex items-center justify-center gap-1 mx-auto font-medium cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Quay lại chỉnh sửa</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};