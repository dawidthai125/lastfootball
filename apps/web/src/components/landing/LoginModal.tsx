'use client';

import { useEffect, useId, useRef } from 'react';

import { BrandLogo } from '@/components/assets';
import { LoginForm } from '@/components/auth/LoginForm';
import { UI_COPY } from '@/lib/ui/copy';

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Landing Login Modal — presentation only; reuses LoginForm / auth actions.
 */
export function LoginModal({ open, onClose }: LoginModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const focusables = () =>
      panel
        ? Array.from(
            panel.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];

    const firstFocus = focusables()[0];
    firstFocus?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lf-login-modal" role="presentation" data-lf-impl="LFE-AUTH-UX-01">
      <button
        type="button"
        className="lf-login-modal__backdrop"
        aria-label={UI_COPY.close}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="lf-login-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="lf-login-modal__brand">
          <BrandLogo size="md" variant="lockup" />
        </div>
        <p className="lf-landing__eyebrow">Powrót do klubu</p>
        <h2 id={titleId} className="lf-login-modal__title">
          Zaloguj się
        </h2>
        <p className="lf-login-modal__lead">Wejdź do swojego świata menedżerskiego.</p>
        <LoginForm />
        <button type="button" className="lf-login-modal__dismiss" onClick={onClose}>
          {UI_COPY.close}
        </button>
      </div>
    </div>
  );
}
