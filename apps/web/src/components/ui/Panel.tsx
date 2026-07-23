import type { ReactNode } from 'react';

type PanelProps = {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  flush?: boolean;
};

export function Panel({
  children,
  title,
  action,
  className = '',
  bodyClassName = '',
  flush = false,
}: PanelProps) {
  return (
    <section
      className={`border border-[var(--lf-border)] bg-[var(--lf-panel)] ${className}`}
      style={{ borderRadius: 'var(--lf-radius)' }}
    >
      {title ? (
        <header className="flex items-center justify-between gap-2 border-b border-[var(--lf-border)] bg-[var(--lf-panel-alt)] px-2.5 py-1.5">
          <h2 className="font-[family-name:var(--font-ui)] text-[11px] font-semibold tracking-[0.06em] text-[var(--lf-gold)] uppercase">
            {title}
          </h2>
          {action ? <div className="shrink-0 text-[11px] text-[var(--lf-muted)]">{action}</div> : null}
        </header>
      ) : null}
      <div className={`${flush ? '' : 'p-2.5'} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
