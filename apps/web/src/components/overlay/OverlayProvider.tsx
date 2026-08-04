'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type OverlayKind = 'messages' | 'modal' | null;

type OverlayContextValue = {
  active: OverlayKind;
  openMessages: () => void;
  openModal: () => void;
  close: () => void;
  toggleMessages: () => void;
};

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<OverlayKind>(null);

  const close = useCallback(() => setActive(null), []);
  const openMessages = useCallback(() => setActive('messages'), []);
  const openModal = useCallback(() => setActive('modal'), []);
  const toggleMessages = useCallback(() => {
    setActive((prev) => (prev === 'messages' ? null : 'messages'));
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, close]);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  const value = useMemo(
    () => ({ active, openMessages, openModal, close, toggleMessages }),
    [active, openMessages, openModal, close, toggleMessages],
  );

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext);
  if (!ctx) {
    throw new Error('useOverlay must be used within OverlayProvider');
  }
  return ctx;
}
