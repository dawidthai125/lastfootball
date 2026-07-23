'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ShellContextValue = {
  navCollapsed: boolean;
  toggleNav: () => void;
  setNavCollapsed: (value: boolean) => void;
  showRail: boolean;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({
  children,
  showRail = true,
}: {
  children: ReactNode;
  showRail?: boolean;
}) {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const toggleNav = useCallback(() => setNavCollapsed((v) => !v), []);

  const value = useMemo(
    () => ({ navCollapsed, toggleNav, setNavCollapsed, showRail }),
    [navCollapsed, toggleNav, showRail],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error('useShell must be used within ShellProvider');
  }
  return ctx;
}
