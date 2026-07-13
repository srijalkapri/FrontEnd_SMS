import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { isSuperAdminRole } from '../utils/roles';

export const PENDING_USERS_CHANGED_EVENT = 'pending-users-changed';

export function notifyPendingUsersChanged(): void {
  window.dispatchEvent(new Event(PENDING_USERS_CHANGED_EVENT));
}

export function usePendingUsersCount(): number {
  const { user } = useAuth();
  const location = useLocation();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isSuperAdminRole(user?.role)) {
      setCount(0);
      return;
    }

    try {
      const response = await authApi.getPendingUsers();
      setCount(response.data.length);
    } catch {
      setCount(0);
    }
  }, [user?.role]);

  useEffect(() => {
    void refresh();
  }, [refresh, location.pathname]);

  useEffect(() => {
    function handleChange() {
      void refresh();
    }

    window.addEventListener(PENDING_USERS_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(PENDING_USERS_CHANGED_EVENT, handleChange);
  }, [refresh]);

  return count;
}
