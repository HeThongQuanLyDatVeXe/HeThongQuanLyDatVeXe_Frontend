import React from 'react';
import { Alert } from '../components/common/Alert';
import { useAdminLoginPage } from '../hooks/pages/useAdminLoginPage';

export const AdminLoginPage: React.FC = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit
  } = useAdminLoginPage();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, var(--color-on-primary-fixed) 0%, #1a0b05 40%, var(--color-on-primary-fixed-variant) 100%)' }}
    >
      {/* Decorative radial glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, var(--color-primary-container) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, var(--color-secondary-container) 0%, transparent 70%)' }}
      />

      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl"
            style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)', boxShadow: '0 8px 32px rgba(161, 59, 0, 0.4)' }}
          >
            <span className="text-white font-black text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>D</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
            Đi Về Nhà
          </h1>
          <p className="text-sm font-medium tracking-widest uppercase" style={{ color: 'var(--color-inverse-primary)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.2em' }}>
            Cổng quản trị
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255, 248, 246, 0.06)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 181, 151, 0.12)',
          }}
        >
          {error && <div className="mb-5"><Alert type="error" message={error} /></div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary-fixed-dim)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.1em' }}>Email</label>
              <input
                type="email"
                placeholder="admin@divenha.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all font-body"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 181, 151, 0.15)',
                  color: '#fff',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary-container)'; e.target.style.boxShadow = '0 0 0 3px rgba(201, 76, 0, 0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 181, 151, 0.15)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary-fixed-dim)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.1em' }}>Mật khẩu</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all font-body"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 181, 151, 0.15)',
                  color: '#fff',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary-container)'; e.target.style.boxShadow = '0 0 0 3px rgba(201, 76, 0, 0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 181, 151, 0.15)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-on-primary text-sm font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-[0.98] flex items-center justify-center gap-2 shimmer-btn"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)',
                boxShadow: '0 4px 20px rgba(161, 59, 0, 0.4)',
              }}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        {/* Ticket divider */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-px flex-1" style={{ background: 'rgba(255, 181, 151, 0.12)' }} />
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255, 181, 151, 0.3)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.15em' }}>
            DiVeNha © 2025
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(255, 181, 151, 0.12)' }} />
        </div>
      </div>
    </div>
  );
};