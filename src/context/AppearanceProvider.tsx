import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AppearanceContext,
  UI_LAYOUTS,
  UI_STYLES,
  type Theme,
  type UiLayout,
  type UiStyle,
} from '../hooks/useTheme';

// Initial values are applied before React loads by the inline script in index.html
// (prevents a flash of the wrong look); these readers must use the same rules.
const readStored = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStored = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode) — the choice just won't persist
  }
};

const readTheme = (): Theme => {
  const stored = readStored('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const readOneOf = <T extends string>(key: string, allowed: T[], fallback: T): T => {
  const stored = readStored(key);
  return allowed.includes(stored as T) ? (stored as T) : fallback;
};

export const AppearanceProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [uiStyle, setUiStyle] = useState<UiStyle>(() => readOneOf('uiStyle', UI_STYLES, 'classic'));
  const [uiLayout, setUiLayout] = useState<UiLayout>(() => readOneOf('uiLayout', UI_LAYOUTS, 'focused'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    writeStored('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-style', uiStyle);
    writeStored('uiStyle', uiStyle);
  }, [uiStyle]);

  useEffect(() => {
    document.documentElement.setAttribute('data-layout', uiLayout);
    writeStored('uiLayout', uiLayout);
  }, [uiLayout]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
      uiStyle,
      setUiStyle,
      uiLayout,
      setUiLayout,
    }),
    [theme, uiStyle, uiLayout],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
};
