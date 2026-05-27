import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/user-service/useAuth';
import { adminUserService } from '../../../services/user-service/adminUserService';
import type { UserResponse } from '../../../types/user-service/response/UserResponse';

export type Period = 'today' | 'week' | 'month';

export const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hôm nay',
  week:  'Tuần',
  month: 'Tháng',
};

export const useAdminDashboardPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('today');

  useEffect(() => {
    adminUserService
      .getUsers()
      .then((res) => setUsers(res.data.result ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return {
    user,
    users,
    loading,
    period,
    setPeriod
  };
};
