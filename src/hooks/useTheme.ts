import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';
export type UiStyle = 'classic' | 'glass';

export const UI_STYLES: UiStyle[] = ['classic', 'glass'];

// Initial values are applied before React loads by the inline script in index.html
// (prevents a flash of the wrong style); these readers must use the same rules.
const readTheme = (): Theme => {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const readUiStyle = (): UiStyle => {
  const stored = localStorage.getItem('uiStyle');
  return UI_STYLES.includes(stored as UiStyle) ? (stored as UiStyle) : 'classic';
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [uiStyle, setUiStyle] = useState<UiStyle>(readUiStyle);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-style', uiStyle);
    localStorage.setItem('uiStyle', uiStyle);
  }, [uiStyle]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return { theme, setTheme, toggleTheme, uiStyle, setUiStyle };
};
