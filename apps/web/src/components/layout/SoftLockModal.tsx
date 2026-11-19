'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId } from 'react';

import { UI_COPY } from '@/lib/ui/copy';

type SoftLockModalProps = {
  open: boolean;
  title: string;
  reason: string;
  onClose: () => void;
};

/**
 * SYS-04 soft-lock modal — exit outline (PTI-06), bez fałszywego „Odblokuj”.
 */
export function SoftLockModal({ open, title, reason, onClose }: SoftLockModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lf-slm" role="presentation" data-lf-impl="LFE-UI-IMPL-04">
      <button
        type="button"
        className="lf-slm__backdrop"
        aria-label={UI_COPY.close}
        onClick={onClose}
      />
      <div className="lf-slm__panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <Image
          src="/assets/world-art/ico-020-lock.png"
          alt=""
          width={40}
          height={40}
          data-wa="ICO-020"
        />
        <h2 id={titleId} className="lf-slm__title">
          {title}
        </h2>
        <p className="lf-slm__body">{reason}</p>
        <div className="lf-slm__actions">
          <Link href="/hub" className="lf-slm__hub" onClick={onClose}>
            {UI_COPY.hubExit}
          </Link>
          <button type="button" className="lf-slm__close" onClick={onClose}>
            {UI_COPY.close}
          </button>
        </div>
      </div>
    </div>
  );
}
