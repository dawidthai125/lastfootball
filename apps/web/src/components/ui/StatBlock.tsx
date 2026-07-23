import type { ReactNode } from 'react';

type StatBlockProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'default' | 'ok' | 'warn' | 'danger' | 'gold';
};

const toneClass: Record<NonNullable<StatBlockProps['tone']>, string> = {
  default: 'text-[var(--lf-text-strong)]',
  ok: 'text-[var(--lf-ok)]',
  warn: 'text-[var(--lf-warn)]',
  danger: 'text-[var(--lf-danger)]',
  gold: 'text-[var(--lf-gold)]',
};

export function StatBlock({ label, value, hint, tone = 'default' }: StatBlockProps) {
  return (
    <div className="min-w-0 border border-[var(--lf-border)] bg-[var(--lf-inset)] px-2 py-1.5">
      <div className="truncate text-[10px] tracking-wide text-[var(--lf-faint)] uppercase">
        {label}
      </div>
      <div
        className={`mt-0.5 truncate font-[family-name:var(--font-ui)] text-sm font-semibold tabular-nums ${toneClass[tone]}`}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-0.5 truncate text-[10px] text-[var(--lf-muted)]">{hint}</div>
      ) : null}
    </div>
  );
}
