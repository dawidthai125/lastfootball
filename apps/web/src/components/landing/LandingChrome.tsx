'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { LandingHeader } from '@/components/landing/LandingHeader';
import { LoginModal } from '@/components/landing/LoginModal';

type LoginModalContextValue = {
  openLogin: () => void;
  closeLogin: () => void;
  isLoginOpen: boolean;
};

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

export function useLoginModal(): LoginModalContextValue {
  const ctx = useContext(LoginModalContext);
  if (!ctx) {
    throw new Error('useLoginModal must be used within LandingChrome');
  }
  return ctx;
}

type LandingChromeProps = {
  children: ReactNode;
};

/**
 * Marketing chrome — premium header + Login Modal host (LFE-AUTH-UX-01).
 */
export function LandingChrome({ children }: LandingChromeProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = useCallback(() => setIsLoginOpen(true), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  const value = useMemo(
    () => ({ openLogin, closeLogin, isLoginOpen }),
    [openLogin, closeLogin, isLoginOpen],
  );

  return (
    <LoginModalContext.Provider value={value}>
      <LandingHeader variant="marketing" onLoginClick={openLogin} />
      {children}
      <LoginModal open={isLoginOpen} onClose={closeLogin} />
    </LoginModalContext.Provider>
  );
}
