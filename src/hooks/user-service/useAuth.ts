import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import type { AuthContextType } from '../../types/user-service/AuthContextType';

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};