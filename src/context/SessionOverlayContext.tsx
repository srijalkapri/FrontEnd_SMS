import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { SessionOverlay } from '../components/auth/SessionOverlay';

export type SessionOverlayMode = 'none' | 'logout' | 'login-success';

interface SessionOverlayContextValue {
  mode: SessionOverlayMode;
  message: string;
  showLogout: (message?: string) => void;
  showLoginSuccess: (message?: string) => void;
  hide: () => void;
}

const SessionOverlayContext = createContext<SessionOverlayContextValue | null>(null);

export function SessionOverlayProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SessionOverlayMode>('none');
  const [message, setMessage] = useState('');

  const showLogout = useCallback((text = 'Signing you out…') => {
    setMessage(text);
    setMode('logout');
  }, []);

  const showLoginSuccess = useCallback((text = 'Welcome back!') => {
    setMessage(text);
    setMode('login-success');
  }, []);

  const hide = useCallback(() => {
    setMode('none');
    setMessage('');
  }, []);

  const value = useMemo(
    () => ({ mode, message, showLogout, showLoginSuccess, hide }),
    [mode, message, showLogout, showLoginSuccess, hide],
  );

  return (
    <SessionOverlayContext.Provider value={value}>
      {children}
      <SessionOverlay mode={mode} message={message} />
    </SessionOverlayContext.Provider>
  );
}

export function useSessionOverlay() {
  const context = useContext(SessionOverlayContext);
  if (!context) {
    throw new Error('useSessionOverlay must be used within SessionOverlayProvider');
  }
  return context;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export { sleep };
