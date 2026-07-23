import type { ReactNode } from 'react';

type BadgeTone = 'default' | 'gold' | 'ok' | 'warn' | 'danger' | 'info';

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  default: 'border-[var(--lf-border)] bg-[var(--lf-inset)] text-[var(--lf-muted)]',
  gold: 'border-[var(--lf-gold-dim)] bg-[var(--lf-gold-soft)] text-[var(--lf-gold)]',
  ok: 'border-[var(--lf-ok)]/35 bg-[var(--lf-ok-soft)] text-[var(--lf-ok)]',
  warn: 'border-[var(--lf-warn)]/35 bg-[var(--lf-warn-soft)] text-[var(--lf-warn)]',
  danger: 'border-[var(--lf-danger)]/35 bg-[var(--lf-danger-soft)] text-[var(--lf-danger)]',
  info: 'border-[var(--lf-info)]/35 bg-[rgba(90,126,160,0.15)] text-[var(--lf-info)]',
};

export function Badge({ children, tone = 'default' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center border px-1.5 py-px text-[10px] font-semibold tracking-wide uppercase ${tones[tone]}`}
      style={{ borderRadius: 'var(--lf-radius-sm)' }}
    >
      {children}
    </span>
  );
}
