import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { authService } from '../services/user-service/authService';
import { getApiErrorCode } from '../utils/errorUtils';
import loginBgImage from '../assets/login1.jpg';
import { useToast } from '../contexts/ToastContext';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  error,
  className = '',
  id,
  isPassword,
  showPassword,
  onTogglePassword,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="floating-label-group relative">
        <input
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : props.type}
          className={`
            w-full h-[48px] bg-transparent border rounded-lg px-4 py-3 
            transition-all duration-200 outline-none fancy-input
            ${isPassword ? 'pr-12' : ''}
            ${error ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/60 focus:border-primary-hover'}
            ${className}
          `}
          placeholder=" "
          {...props}
        />
        <label 
          htmlFor={id}
          className={`
            text-sm absolute left-4 top-3 transition-all duration-200 pointer-events-none
            ${error ? 'text-red-500' : 'text-on-surface-variant/80'}
          `}
        >
          {label}
        </label>
        {isPassword && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary-hover focus:outline-none select-none flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
      {error && <span className="text-[11px] text-red-500 font-medium px-2">{error}</span>}
    </div>
  );
};

type Step = 'email' | 'otp' | 'reset_password';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timeoutId = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timeoutId);
  }, [resendCooldown]);

  const startResendCooldown = () => setResendCooldown(60);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    
    try {
      await authService.forgotPassword({ email });
      setStep('otp');
      startResendCooldown();
      success('Đã gửi mã xác minh (OTP) đến email của bạn.');
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      if (code === 1005) setFormError('Email này chưa được đăng ký trong hệ thống.');
      else if (code === 1006) setFormError('Email chưa được xác minh. Vui lòng đăng ký lại.');
      else setFormError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setFormError('');

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    
    if (code.length !== 6) {
      setFormError('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }

    setLoading(true);
    setFormError('');

    try {
      await authService.verifyOtp({ email, otpCode: code, purpose: 'RESET_PASSWORD' });
      setStep('reset_password');
      success('Xác minh thành công, vui lòng nhập mật khẩu mới.');
    } catch (err: unknown) {
      const apiCode = getApiErrorCode(err);
      if (apiCode === 10020) setFormError('Không tìm thấy mã OTP hoặc mã đã được sử dụng.');
      else if (apiCode === 10021) setFormError('Mã OTP đã hết hạn. Vui lòng gửi lại.');
      else if (apiCode === 10022) setFormError('Mã OTP không đúng. Vui lòng kiểm tra lại.');
      else if (apiCode === 10024) setFormError('Đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới.');
      else setFormError('Xác minh thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    
    if (newPassword.length < 8) {
      setFormError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setFormError('');
    
    try {
      await authService.resetPassword({
        email,
        otpCode: code,
        newPassword
      });
      success('Đổi mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.');
      navigate(ROUTES.LOGIN);
    } catch (err: unknown) {
      const code2 = getApiErrorCode(err);
      if (code2 === 10021) setFormError('Mã OTP đã hết hạn. Vui lòng gửi lại.');
      else if (code2 === 10022) setFormError('Mã OTP không đúng. Vui lòng kiểm tra lại.');
      else if (code2 === 10024) setFormError('Đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới.');
      else setFormError('Đổi mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authService.forgotPassword({ email });
      startResendCooldown();
      success('Đã gửi lại mã OTP. Vui lòng kiểm tra email.');
    } catch (err) {
      showError('Gửi lại thất bại. Vui lòng thử lại sau.');
    }
  };

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
