'use client';

import { useState, type ReactNode } from 'react';

import { UI_COPY } from '@/lib/ui/copy';

import './domain-states.css';

type ConfirmSubmitProps = {
  /** Visible primary label before confirm */
  label: string;
  /** Label on the confirm step */
  confirmLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  pending?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Two-step confirm for transfer settle (HF-XFR-02) — no fake Primary after cancel.
 */
export function ConfirmSubmit({
  label,
  confirmLabel = UI_COPY.confirm,
  cancelLabel = 'Anuluj',
  disabled = false,
  pending = false,
  className,
  children,
}: ConfirmSubmitProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        className={className ?? 'lf-cf__go'}
        disabled={disabled || pending}
        onClick={() => setOpen(true)}
      >
        {pending ? '…' : label}
      </button>
    );
  }

  return (
    <div className="lf-cf" role="group" aria-label="Potwierdzenie decyzji">
      <p className="lf-cf__prompt">{UI_COPY.confirmOffer}</p>
      <div className="lf-cf__row">
        {children}
        <button
          type="button"
          className="lf-cf__cancel"
          disabled={pending}
          onClick={() => setOpen(false)}
        >
          {cancelLabel}
        </button>
      </div>
      <span className="lf-cf__sr">{confirmLabel}</span>
    </div>
  );
}
