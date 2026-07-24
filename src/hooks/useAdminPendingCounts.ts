import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api/authApi';
import { examApi } from '../api/examApi';
import { useAuth } from '../context/AuthContext';
import type { PendingUser } from '../types/auth';
import type { AdminPendingExamResult } from '../types/examResult';
import type { ReExamRequest } from '../types/reExam';
import { isSuperAdminRole } from '../utils/roles';

export const ADMIN_PENDING_CHANGED_EVENT = 'admin-pending-changed';

export type AdminPendingSnapshot = {
  pendingUsers?: number;
  pendingResultApprovals?: number;
  pendingReExams?: number;
};

type ReExamPendingData = {
  requests: ReExamRequest[];
  marks: ReExamRequest[];
};

type AdminPendingCountsContextValue = {
  pendingUsers: number;
  pendingResultApprovals: number;
  pendingReExams: number;
  loadPendingUsers: (force?: boolean) => Promise<PendingUser[]>;
  loadPendingResultApprovals: (force?: boolean) => Promise<AdminPendingExamResult[]>;
  loadPendingReExams: (force?: boolean) => Promise<ReExamPendingData>;
  refreshAll: () => Promise<void>;
};

const AdminPendingCountsContext = createContext<AdminPendingCountsContextValue | null>(null);

let refreshAllInFlight: Promise<void> | null = null;

export function notifyAdminPendingChanged(snapshot?: AdminPendingSnapshot): void {
  window.dispatchEvent(new CustomEvent(ADMIN_PENDING_CHANGED_EVENT, { detail: snapshot ?? null }));
}

export function AdminPendingCountsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState(0);
  const [pendingResultApprovals, setPendingResultApprovals] = useState(0);
  const [pendingReExams, setPendingReExams] = useState(0);

  const pendingUsersCache = useRef<PendingUser[] | null>(null);
  const resultApprovalsCache = useRef<AdminPendingExamResult[] | null>(null);
  const reExamCache = useRef<ReExamPendingData | null>(null);

  const clearCaches = useCallback(() => {
    pendingUsersCache.current = null;
    resultApprovalsCache.current = null;
    reExamCache.current = null;
  }, []);

  const applySnapshot = useCallback((snapshot: AdminPendingSnapshot) => {
    if (snapshot.pendingUsers !== undefined) {
      setPendingUsers(snapshot.pendingUsers);
    }
    if (snapshot.pendingResultApprovals !== undefined) {
      setPendingResultApprovals(snapshot.pendingResultApprovals);
    }
    if (snapshot.pendingReExams !== undefined) {
      setPendingReExams(snapshot.pendingReExams);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    if (!isSuperAdminRole(user?.role)) {
      setPendingUsers(0);
      setPendingResultApprovals(0);
      setPendingReExams(0);
      clearCaches();
      return;
    }

    if (refreshAllInFlight) {
      await refreshAllInFlight;
      return;
    }

    refreshAllInFlight = (async () => {
      try {
        const [usersResponse, resultsResponse, reExamRequestsResponse, reExamMarksResponse] =
          await Promise.all([
            authApi.getPendingUsers(),
            examApi.getPendingResultApprovals(),
            examApi.getPendingReExams(),
            examApi.getPendingReExamMarks(),
          ]);

        pendingUsersCache.current = usersResponse.data;
        resultApprovalsCache.current = resultsResponse.data;
        reExamCache.current = {
          requests: reExamRequestsResponse.data,
          marks: reExamMarksResponse.data,
        };

        setPendingUsers(usersResponse.data.length);
        setPendingResultApprovals(resultsResponse.data.length);
        setPendingReExams(reExamRequestsResponse.data.length + reExamMarksResponse.data.length);
      } catch {
        clearCaches();
        setPendingUsers(0);
        setPendingResultApprovals(0);
        setPendingReExams(0);
      }
    })().finally(() => {
      refreshAllInFlight = null;
    });

    await refreshAllInFlight;
  }, [clearCaches, user?.role]);

  const loadPendingUsers = useCallback(
    async (force = false) => {
      if (!force && pendingUsersCache.current) {
        return pendingUsersCache.current;
      }

      const response = await authApi.getPendingUsers();
      pendingUsersCache.current = response.data;
      setPendingUsers(response.data.length);
      return response.data;
    },
    [],
  );

  const loadPendingResultApprovals = useCallback(
    async (force = false) => {
      if (!force && resultApprovalsCache.current) {
        return resultApprovalsCache.current;
      }

      const response = await examApi.getPendingResultApprovals();
      resultApprovalsCache.current = response.data;
      setPendingResultApprovals(response.data.length);
      return response.data;
    },
    [],
  );

  const loadPendingReExams = useCallback(
    async (force = false) => {
      if (!force && reExamCache.current) {
        return reExamCache.current;
      }

      const [requestsResponse, marksResponse] = await Promise.all([
        examApi.getPendingReExams(),
        examApi.getPendingReExamMarks(),
      ]);

      const data: ReExamPendingData = {
        requests: requestsResponse.data,
        marks: marksResponse.data,
      };
      reExamCache.current = data;
      setPendingReExams(data.requests.length + data.marks.length);
      return data;
    },
    [],
  );

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    function handleChange(event: Event) {
      const detail = (event as CustomEvent<AdminPendingSnapshot | null>).detail;
      if (detail) {
        applySnapshot(detail);
        return;
      }
      clearCaches();
      void refreshAll();
    }

    window.addEventListener(ADMIN_PENDING_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(ADMIN_PENDING_CHANGED_EVENT, handleChange);
  }, [refreshAll, applySnapshot, clearCaches]);

  const value = useMemo(
    () => ({
      pendingUsers,
      pendingResultApprovals,
      pendingReExams,
      loadPendingUsers,
      loadPendingResultApprovals,
      loadPendingReExams,
      refreshAll,
    }),
    [
      pendingUsers,
      pendingResultApprovals,
      pendingReExams,
      loadPendingUsers,
      loadPendingResultApprovals,
      loadPendingReExams,
      refreshAll,
    ],
  );

  return createElement(AdminPendingCountsContext.Provider, { value }, children);
}

function useAdminPendingCountsContext() {
  const context = useContext(AdminPendingCountsContext);
  if (!context) {
    throw new Error('useAdminPendingCounts must be used within AdminPendingCountsProvider');
  }
  return context;
}

export function useAdminPendingCounts() {
  const { pendingUsers, pendingResultApprovals, pendingReExams } = useAdminPendingCountsContext();
  return { pendingUsers, pendingResultApprovals, pendingReExams };
}

export function useAdminPendingLists() {
  const {
    loadPendingUsers,
    loadPendingResultApprovals,
    loadPendingReExams,
    refreshAll,
  } = useAdminPendingCountsContext();
  return { loadPendingUsers, loadPendingResultApprovals, loadPendingReExams, refreshAll };
}
