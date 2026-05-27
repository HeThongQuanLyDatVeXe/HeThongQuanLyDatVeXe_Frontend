import React from 'react';
import { Link } from 'react-router-dom';
import loginBgImage from '../assets/login1.jpg';
import { useForgotPasswordPage } from '../hooks/pages/useForgotPasswordPage';

import { FloatingInput } from '../components/common/FloatingInput';

export const ForgotPasswordPage: React.FC = () => {
  const {
    navigate,
    ROUTES,
    step,
    setStep,
    email,
    setEmail,
    otp,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPw,
    setShowPw,
    showConfirmPw,
    setShowConfirmPw,
    loading,
    formError,
    setFormError,
    resendCooldown,
    handleSendOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handleVerifyOtp,
    handleResetPassword,
    handleResend
  } = useForgotPasswordPage();

  return (
    <div className="font-body text-on-background bg-background-light h-screen w-screen overflow-hidden flex">
      {/* LEFT PANEL */}
      <div className="hidden md:flex w-[40%] relative overflow-hidden flex-col justify-between p-12">
        <img
          alt="Atmospheric Vietnamese landscape"
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
          src={loginBgImage}
        />
        <div className="absolute inset-0 radial-overlay"></div>
        <div className="absolute inset-0 bg-black/30"></div>
        
        <Link to={ROUTES.HOME} className="relative z-10 w-fit">
          <h1 className="font-display italic font-semibold text-[32px] text-primary-hover tracking-tight hover:scale-[1.02] transition-all">
            Đi Về Nhà
          </h1>
        </Link>

        <div className="relative z-10 glass-card p-8 rounded-2xl shadow-2xl">
          <p className="font-display italic text-2xl text-white leading-relaxed">
            "Không bao giờ là quá muộn để bắt đầu lại."
          </p>
          <div className="mt-6 flex gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-hover shadow-[0_0_8px_#c84d04]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-[60%] bg-background-light flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          
          <div className="md:hidden mb-8 text-center">
            <Link to={ROUTES.HOME} className="w-fit inline-block">
              <h1 className="font-display italic font-semibold text-[32px] text-primary-hover tracking-tight">
                Đi Về Nhà
              </h1>
            </Link>
          </div>

          <div className="transition-all duration-300">
            {step === 'email' ? (
              <>
                <div className="mb-6">
                  <button 
                    onClick={() => navigate(ROUTES.LOGIN)}
                    className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary-hover transition-colors font-medium mb-4"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Quay lại đăng nhập
                  </button>
                  <h2 className="font-display text-3xl font-semibold mb-2">
                    Quên mật khẩu?
                  </h2>
                  <p className="text-on-surface-variant opacity-80 text-sm">
                    Đừng lo lắng! Vui lòng nhập email của bạn, chúng tôi sẽ gửi mã xác minh (OTP) để thiết lập lại mật khẩu.
                  </p>
                </div>

                {formError && <div className="mb-6"><div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium">{formError}</div></div>}

                <form onSubmit={handleSendOtp} className="space-y-6">
                  <FloatingInput
                    id="email"
                    label="Email của bạn"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="shimmer-btn w-full h-[48px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>{loading ? 'Đang gửi mã...' : 'Gửi mã xác nhận'}</span>
                    {!loading && <span className="material-symbols-outlined text-[20px]">mail</span>}
                  </button>
                </form>
              </>
            ) : step === 'otp' ? (
              <>
                <div className="mb-6">
                  <button 
                    onClick={() => { setStep('email'); setFormError(''); }}
                    className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary-hover transition-colors font-medium mb-4"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Đổi email
                  </button>
                  <h2 className="font-display text-3xl font-semibold mb-2">
                    Xác minh OTP
                  </h2>
                  <p className="text-on-surface-variant opacity-80 text-sm">
                    Mã OTP đã được gửi đến email <span className="font-semibold text-primary">{email}</span>
                  </p>
                </div>

                {formError && <div className="mb-6"><div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium">{formError}</div></div>}

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-on-surface-variant">Nhập mã OTP</label>
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
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="shimmer-btn w-full h-[48px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>{loading ? 'Đang xác minh...' : 'Xác minh OTP'}</span>
                    {!loading && <span className="material-symbols-outlined text-[20px]">check_circle</span>}
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
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="font-display text-3xl font-semibold mb-2">
                    Thiết lập mật khẩu mới
                  </h2>
                  <p className="text-on-surface-variant opacity-80 text-sm">
                    Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                  </p>
                </div>

                {formError && <div className="mb-6"><div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium">{formError}</div></div>}

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <FloatingInput
                    id="newPassword"
                    label="Mật khẩu mới (ít nhất 8 ký tự)"
                    isPassword
                    showPassword={showPw}
                    onTogglePassword={() => setShowPw(!showPw)}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />

                  <FloatingInput
                    id="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    isPassword
                    showPassword={showConfirmPw}
                    onTogglePassword={() => setShowConfirmPw(!showConfirmPw)}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="shimmer-btn w-full h-[48px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>{loading ? 'Đang đổi mật khẩu...' : 'Xác nhận & Đổi mật khẩu'}</span>
                    {!loading && <span className="material-symbols-outlined text-[20px]">lock_reset</span>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
