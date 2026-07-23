import type { ReactNode } from 'react';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="mb-2 flex items-end justify-between gap-3 border-b border-[var(--lf-border)] pb-1.5">
      <div className="min-w-0">
        <h1 className="font-[family-name:var(--font-ui)] text-base font-semibold tracking-wide text-[var(--lf-text-strong)]">
          {title}
        </h1>
        {subtitle ? <p className="mt-0.5 text-[11px] text-[var(--lf-muted)]">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
