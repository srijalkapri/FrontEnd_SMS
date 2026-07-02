import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  isThemeAccent,
  isThemeMode,
  type ThemeAccent,
  type ThemeMode,
} from '../themes/themeConfig';

interface ThemeContextValue {
  mode: ThemeMode;
  accent: ThemeAccent;
  /** @deprecated Use `mode` instead */
  theme: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: ThemeAccent) => void;
  /** @deprecated Use `setMode` instead */
  setTheme: (mode: ThemeMode) => void;
  toggleMode: () => void;
  /** @deprecated Use `toggleMode` instead */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialMode(): ThemeMode {
  const storedMode = localStorage.getItem('theme-mode');
  if (isThemeMode(storedMode)) {
    return storedMode;
  }

  const legacyTheme = localStorage.getItem('theme');
  if (isThemeMode(legacyTheme)) {
    return legacyTheme;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getInitialAccent(): ThemeAccent {
  const storedAccent = localStorage.getItem('theme-accent');
  if (isThemeAccent(storedAccent)) {
    return storedAccent;
  }

  return 'indigo';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [accent, setAccentState] = useState<ThemeAccent>(getInitialAccent);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    document.documentElement.setAttribute('data-accent', accent);
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('theme-accent', accent);
    localStorage.setItem('theme', mode);
  }, [mode, accent]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  const setAccent = useCallback((next: ThemeAccent) => {
    setAccentState(next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        accent,
        theme: mode,
        setMode,
        setAccent,
        setTheme: setMode,
        toggleMode,
        toggleTheme: toggleMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
