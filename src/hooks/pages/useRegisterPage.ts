import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/user-service/authService';
import { ROUTES } from '../../constants/routes';
import { useToast } from '../../contexts/ToastContext';
import { ENV } from '../../configurations/env';
import { getApiErrorCode } from '../../utils/errorUtils';

type Step = 'form' | 'otp';

export const useRegisterPage = () => {
  const navigate = useNavigate();
  const { success, error: showError, warning } = useToast();
  const [step, setStep] = useState<Step>('form');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    setFormErrors((p) => ({ ...p, [field]: '' }));
  };

  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return 0;
    if (pw.length < 8) return 1;
    const hasVariety = /[A-Z]/.test(pw) && /[0-9]/.test(pw);
    if (pw.length >= 8 && hasVariety) return 3;
    return 2;
  };

  const strength = getPasswordStrength(formData.password);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Email không hợp lệ';
    if (formData.password.length < 8) errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Mật khẩu không khớp';
    if (formData.phoneNumber && !formData.phoneNumber.match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/)) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 0)';
    }
    return errors;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      warning('Vui lòng kiểm tra lại thông tin nhập vào');
      return;
    }
    setFormLoading(true);
    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber || undefined,
      });
      setStep('otp');
      startResendCooldown();
      success('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.');
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      if (code === 1002) showError('Email này đã được sử dụng.');
      else if (code === 1003) showError('Số điện thoại này đã được sử dụng.');
      else if (code === 1004) showError('Mật khẩu không hợp lệ.');
      else if (code === 1008) showError('Định dạng email không hợp lệ.');
      else if (code === 1009) showError('Định dạng số điện thoại không hợp lệ.');
      else showError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setFormLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((p) => p - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

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
    if (code.length !== 6) {
      setOtpError('Vui lòng nhập đủ 6 chữ số');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      await authService.verifyOtp({ email: formData.email, otpCode: code, purpose: 'EMAIL_VERIFY' });
      success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate(ROUTES.LOGIN);
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
    } catch {
      setOtpError('Không thể gửi lại. Vui lòng thử lại sau.');
    }
  };

  const handleGoogleLogin = () => {
    if (!ENV.GOOGLE_CLIENT_ID) {
      showError('Thiếu cấu hình Google OAuth. Vui lòng kiểm tra file .env.');
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

  return {
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
  };
};
