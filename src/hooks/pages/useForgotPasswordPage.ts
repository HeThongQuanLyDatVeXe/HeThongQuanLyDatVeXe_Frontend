import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { authService } from '../../services/user-service/authService';
import { getApiErrorCode } from '../../utils/errorUtils';
import { useToast } from '../../contexts/ToastContext';

export type Step = 'email' | 'otp' | 'reset_password';

export const useForgotPasswordPage = () => {
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

  return {
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
  };
};
