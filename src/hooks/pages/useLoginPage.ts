import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/user-service/useAuth';
import { ROUTES } from '../../constants/routes';
import { ENV } from '../../configurations/env';
import { getApiErrorCode } from '../../utils/errorUtils';

export const useLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
      // Optional: Save rememberMe state in localStorage if backend/cookies require it.
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('remember_me');
      }
      navigate(ROUTES.PROFILE);
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      if (code === 1006) setError('Email chưa được xác minh. Vui lòng kiểm tra hộp thư.');
      else if (code === 10013) setError('Tài khoản đã bị khóa.');
      else setError('Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateRegister = () => {
    navigate(ROUTES.REGISTER);
  };

  return {
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
  };
};
