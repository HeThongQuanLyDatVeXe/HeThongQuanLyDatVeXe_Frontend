import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authService } from '../services/user-service/authService';
import { userService } from '../services/user-service/userService';
import { cookieUtils } from '../utils/cookieUtils';
import type { AuthContextType } from '../types/user-service/AuthContextType';
import type { UserResponse } from '../types/user-service/response/UserResponse';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = cookieUtils.getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await userService.getMyInfo();
      setUser(res.data.result ?? null);
    } catch {
      setUser(null);
      cookieUtils.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
  const res = await authService.login({ email, password });
  const { accessToken, refreshToken } = res.data.result!;
  
  console.log('Token nhận được:', accessToken);
  cookieUtils.setTokens(accessToken, refreshToken);
  console.log('Token sau khi set:', cookieUtils.getAccessToken()); 
  
  await refreshUser();
};

  const loginWithGoogleCode = async (code: string) => {
    const res = await authService.googleLogin(code);
    const { accessToken, refreshToken } = res.data.result!;
    cookieUtils.setTokens(accessToken, refreshToken);
    await refreshUser();
  };

  const logout = async () => {
    const accessToken = cookieUtils.getAccessToken();
    if (accessToken) {
      try {
        await authService.logout({ accessToken });
      } catch { /* silent */ }
    }
    cookieUtils.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogleCode,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};