import { useCallback, useEffect, useState } from 'react';
import { examApi } from '../api/examApi';
import { useAuth } from '../context/AuthContext';
import { isSuperAdminRole } from '../utils/roles';

export const PENDING_RESULT_APPROVALS_CHANGED_EVENT = 'pending-result-approvals-changed';

export function notifyPendingResultApprovalsChanged(): void {
  window.dispatchEvent(new Event(PENDING_RESULT_APPROVALS_CHANGED_EVENT));
}

export function usePendingResultApprovalsCount(): number {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isSuperAdminRole(user?.role)) {
      setCount(0);
      return;
    }

    try {
      const response = await examApi.getPendingResultApprovals();
      setCount(response.data.length);
    } catch {
      setCount(0);
    }
  }, [user?.role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function handleChange() {
      void refresh();
    }

    window.addEventListener(PENDING_RESULT_APPROVALS_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(PENDING_RESULT_APPROVALS_CHANGED_EVENT, handleChange);
  }, [refresh]);

  return count;
}
