import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/user-service/authService';
import { ROUTES } from '../constants/routes';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Alert } from '../components/common/Alert';
import { getApiErrorCode } from '../utils/errorUtils';

type Step = 'form' | 'otp';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');

  // Form state
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', fullName: '', phoneNumber: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    setFormErrors((p) => ({ ...p, [field]: '' }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Email không hợp lệ';
    if (formData.password.length < 8) errors.password = 'Mật khẩu ít nhất 8 ký tự';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Mật khẩu không khớp';
    return errors;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormLoading(true);
    setFormError('');
    try {
      await authService.initiateRegistration({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber || undefined,
      });
      setStep('otp');
      startResendCooldown();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      if (code === 1002) setFormError('Email này đã được đăng ký.');
      else setFormError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setFormLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((p) => {
        if (p <= 1) { clearInterval(interval); return 0; }
        return p - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setOtpError('Vui lòng nhập đủ 6 chữ số'); return; }
    setOtpLoading(true);
    setOtpError('');
    try {
      await authService.verifyAndCreateUser({ email: formData.email, otpCode: code });
      navigate(ROUTES.LOGIN + '?registered=1');
    } catch (err: unknown) {
      const code2 = getApiErrorCode(err);
      if (code2 === 1011) setOtpError('Mã OTP đã hết hạn. Vui lòng gửi lại.');
      else if (code2 === 1012) setOtpError('Mã OTP không đúng. Vui lòng kiểm tra lại.');
      else if (code2 === 1013) setOtpError('Đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới.');
      else setOtpError('Xác minh thất bại. Vui lòng thử lại.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authService.resendOtp({ email: formData.email });
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      startResendCooldown();
    } catch { setOtpError('Không thể gửi lại. Vui lòng thử lại sau.'); }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Left */}
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
              Tạo tài khoản<br />
              <span className="text-amber-400">miễn phí</span>
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Đăng ký ngay để đặt vé nhanh hơn, theo dõi chuyến đi và nhận nhiều ưu đãi hấp dẫn.
            </p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          {step === 'form' ? (
            <>
              <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Đăng ký
              </h1>
              <p className="text-slate-500 text-sm mb-8">
                Đã có tài khoản?{' '}
                <Link to={ROUTES.LOGIN} className="text-amber-600 font-medium hover:underline">Đăng nhập</Link>
              </p>

              {formError && <div className="mb-4"><Alert type="error" message={formError} /></div>}

              <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
                <Input
                  label="Họ và tên"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleFormChange('fullName')}
                  error={formErrors.fullName}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="ban@email.com"
                  value={formData.email}
                  onChange={handleFormChange('email')}
                  error={formErrors.email}
                  required
                />
                <Input
                  label="Số điện thoại (tùy chọn)"
                  type="tel"
                  placeholder="0901234567"
                  value={formData.phoneNumber}
                  onChange={handleFormChange('phoneNumber')}
                />
                <Input
                  label="Mật khẩu"
                  type="password"
                  placeholder="Ít nhất 8 ký tự"
                  value={formData.password}
                  onChange={handleFormChange('password')}
                  error={formErrors.password}
                  required
                />
                <Input
                  label="Xác nhận mật khẩu"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleFormChange('confirmPassword')}
                  error={formErrors.confirmPassword}
                  required
                />
                <p className="text-xs text-slate-400">
                  Bằng cách đăng ký, bạn đồng ý với{' '}
                  <a href="#" className="text-amber-600 hover:underline">Điều khoản sử dụng</a> và{' '}
                  <a href="#" className="text-amber-600 hover:underline">Chính sách bảo mật</a>.
                </p>
                <Button type="submit" size="lg" loading={formLoading} className="w-full mt-1">
                  Tiếp tục →
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl mb-6">✉️</div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Xác minh email
              </h1>
              <p className="text-slate-500 text-sm mb-8">
                Mã OTP 6 chữ số đã được gửi đến<br />
                <span className="text-slate-700 font-medium">{formData.email}</span>
              </p>

              {otpError && <div className="mb-4"><Alert type="error" message={otpError} /></div>}

              <form onSubmit={handleVerify}>
                <div className="flex gap-2 mb-6">
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
                      className="flex-1 h-12 text-center text-lg font-bold border-2 rounded-xl outline-none transition-all
                        border-slate-200 bg-white text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    />
                  ))}
                </div>

                <Button type="submit" size="lg" loading={otpLoading} className="w-full mb-4">
                  Xác minh
                </Button>
              </form>

              <div className="text-center">
                <span className="text-slate-500 text-sm">Chưa nhận được mã? </span>
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-sm font-medium text-amber-600 hover:underline disabled:text-slate-400 disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại'}
                </button>
              </div>

              <button
                onClick={() => setStep('form')}
                className="mt-4 text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto"
              >
                ← Quay lại
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};