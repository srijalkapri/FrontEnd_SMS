import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { TopProgressBar } from '../components/layout/TopProgressBar';

interface TopProgressContextValue {
  start: () => void;
  done: () => void;
}

const TopProgressContext = createContext<TopProgressContextValue | null>(null);

export function TopProgressProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completing, setCompleting] = useState(false);
  const trickleRef = useRef<number | null>(null);
  const finishRef = useRef<number | null>(null);
  const activeCount = useRef(0);

  const clearTimers = useCallback(() => {
    if (trickleRef.current != null) {
      window.clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    if (finishRef.current != null) {
      window.clearTimeout(finishRef.current);
      finishRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    activeCount.current += 1;
    if (activeCount.current > 1) return;

    clearTimers();
    setCompleting(false);
    setVisible(true);
    setProgress(8);

    trickleRef.current = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 90) return current;
        const step = current < 40 ? 8 : current < 70 ? 4 : 1.5;
        return Math.min(90, current + step);
      });
    }, 280);
  }, [clearTimers]);

  const done = useCallback(() => {
    if (activeCount.current <= 0) return;
    activeCount.current -= 1;
    if (activeCount.current > 0) return;

    clearTimers();
    setProgress(100);
    setCompleting(true);
    finishRef.current = window.setTimeout(() => {
      setVisible(false);
      setCompleting(false);
      setProgress(0);
    }, 280);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const value = useMemo(() => ({ start, done }), [start, done]);

  return (
    <TopProgressContext.Provider value={value}>
      {children}
      <TopProgressBar visible={visible} progress={progress} completing={completing} />
      <RouteProgressBridge />
    </TopProgressContext.Provider>
  );
}

function RouteProgressBridge() {
  const location = useLocation();
  const { start, done } = useTopProgress();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    start();
    const timer = window.setTimeout(() => done(), 420);
    return () => {
      window.clearTimeout(timer);
      done();
    };
  }, [location.pathname, location.search, start, done]);

  return null;
}

export function useTopProgress() {
  const context = useContext(TopProgressContext);
  if (!context) {
    throw new Error('useTopProgress must be used within TopProgressProvider');
  }
  return context;
}
