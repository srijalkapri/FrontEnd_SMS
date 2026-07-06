import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api/authApi';
import type { AuthUser, LoginRequest } from '../types/auth';
import {
  clearAuthSession,
  getToken,
  hasStoredSession,
  setAuthSession,
} from '../utils/authStorage';
import { normalizeAuthUser } from '../utils/roles';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    if (!hasStoredSession()) {
      clearAuthSession();
      setUser(null);
      return;
    }

    try {
      const result = await authApi.me();
      setUser(normalizeAuthUser(result.data));
    } catch {
      clearAuthSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!getToken()) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      await loadCurrentUser();

      if (!cancelled) {
        setIsLoading(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [loadCurrentUser]);

  const login = useCallback(async (credentials: LoginRequest) => {
    const result = await authApi.login(credentials);
    setAuthSession(result.data.token, result.data.expiresAt);
    setUser(normalizeAuthUser(result.data.user));
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getToken()) {
        await authApi.logout();
      }
    } catch {
      // Token may already be invalid; still clear local session.
    } finally {
      clearAuthSession();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
