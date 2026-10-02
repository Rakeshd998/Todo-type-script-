import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';
export type UiStyle = 'classic' | 'glass' | 'tactile';
export type UiLayout = 'focused' | 'wide' | 'sidebar';

export const UI_STYLES: UiStyle[] = ['classic', 'glass', 'tactile'];
export const UI_LAYOUTS: UiLayout[] = ['focused', 'wide', 'sidebar'];

export interface AppearanceContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  uiStyle: UiStyle;
  setUiStyle: (style: UiStyle) => void;
  uiLayout: UiLayout;
  setUiLayout: (layout: UiLayout) => void;
}

export const AppearanceContext = createContext<AppearanceContextValue | null>(null);

// Shared appearance settings (state lives in AppearanceProvider, so every
// component — header toggle, Profile picker — sees the same values)
export const useTheme = (): AppearanceContextValue => {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useTheme must be used inside <AppearanceProvider>');
  return ctx;
};
