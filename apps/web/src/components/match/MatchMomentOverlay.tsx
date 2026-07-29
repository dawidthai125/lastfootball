'use client';

import Image from 'next/image';
import { useEffect } from 'react';

import './match-path.css';

type MatchMomentOverlayProps = {
  variant: 'goal' | 'final';
  title: string;
  scoreLine?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  onDismiss?: () => void;
  autoDismissMs?: number;
};

/**
 * HF-MCH-05 / HF-MCH-07 — moment overlays (no decision-as-goal Primary).
 */
export function MatchMomentOverlay({
  variant,
  title,
  scoreLine,
  primaryLabel,
  onPrimary,
  onDismiss,
  autoDismissMs = variant === 'goal' ? 1800 : undefined,
}: MatchMomentOverlayProps) {
  useEffect(() => {
    if (!autoDismissMs || !onDismiss) return;
    const t = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(t);
  }, [autoDismissMs, onDismiss]);

  const wa = variant === 'goal' ? 'MOM-002' : 'MOM-003';
  const src =
    variant === 'goal'
      ? '/assets/world-art/mom-002-goal-bloom.png'
      : '/assets/world-art/mom-003-final-whistle.png';

  return (
    <div
      className="lf-mp-overlay lf-motion-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-wa={wa}
      data-mch={variant === 'goal' ? 'SCR-MCH-05' : 'SCR-MCH-07'}
      onClick={variant === 'goal' ? onDismiss : undefined}
    >
      <div className="lf-mp-overlay__art" aria-hidden>
        <Image src={src} alt="" fill sizes="100vw" priority />
      </div>
      <div className="lf-mp-overlay__panel lf-motion-enter">
        <p className="lf-mp__eyebrow">{variant === 'goal' ? 'Moment' : 'Koniec'}</p>
        <h2 className="lf-mp-overlay__title">{title}</h2>
        {scoreLine ? <p className="lf-mp-overlay__score">{scoreLine}</p> : null}
        {primaryLabel && onPrimary ? (
          <button type="button" className="lf-mp__primary" onClick={onPrimary}>
            {primaryLabel}
          </button>
        ) : variant === 'goal' ? (
          <p className="lf-mp__meta">Dotknij, aby kontynuować</p>
        ) : null}
      </div>
    </div>
  );
}
