import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { examApi } from '../api/examApi';
import { isSuperAdminRole } from '../utils/roles';

export const PENDING_RE_EXAMS_CHANGED_EVENT = 'pending-re-exams-changed';

export function notifyPendingReExamsChanged(): void {
  window.dispatchEvent(new Event(PENDING_RE_EXAMS_CHANGED_EVENT));
}

export function usePendingReExamsCount(): number {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isSuperAdminRole(user?.role)) {
      setCount(0);
      return;
    }

    try {
      const [requestsResponse, marksResponse] = await Promise.all([
        examApi.getPendingReExams(),
        examApi.getPendingReExamMarks(),
      ]);
      setCount(requestsResponse.data.length + marksResponse.data.length);
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

    window.addEventListener(PENDING_RE_EXAMS_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(PENDING_RE_EXAMS_CHANGED_EVENT, handleChange);
  }, [refresh]);

  return count;
}
