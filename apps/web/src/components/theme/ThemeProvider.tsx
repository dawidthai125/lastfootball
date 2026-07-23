'use client';

import { useEffect, type ReactNode } from 'react';

import { cssVariableMap } from '@/styles/tokens';

type ThemeProviderProps = {
  children: ReactNode;
};

/**
 * Applies canonical design tokens as CSS variables on :root.
 * SSR first paint uses globals.css; this keeps runtime in sync with tokens.ts.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(cssVariableMap)) {
      root.style.setProperty(key, value);
    }
  }, []);

  return children;
}
