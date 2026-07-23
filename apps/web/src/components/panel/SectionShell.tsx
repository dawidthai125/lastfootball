import type { ReactNode } from 'react';
import Link from 'next/link';

type SectionShellProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
};

/**
 * Dense section frame — gold edge accent, no SaaS header band.
 */
export function SectionShell({ title, action, children, flush = false }: SectionShellProps) {
  return (
    <section className="lf-section-shell">
      <header className="lf-section-shell__header">
        <h2 className="lf-section-shell__title">{title}</h2>
        {action ? (
          <div style={{ fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-muted)' }}>
            {action}
          </div>
        ) : null}
      </header>
      <div style={flush ? undefined : { padding: 'var(--lf-space-3)' }}>{children}</div>
    </section>
  );
}

export function SectionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-[family-name:var(--font-ui)] font-semibold uppercase"
      style={{
        color: 'var(--lf-color-text-gold)',
        fontSize: 'var(--lf-type-label)',
        letterSpacing: 'var(--lf-type-tracking-label)',
      }}
    >
      {children}
    </Link>
  );
}
