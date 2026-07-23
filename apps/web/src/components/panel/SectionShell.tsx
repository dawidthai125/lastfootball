import type { ReactNode } from 'react';
import Link from 'next/link';

type SectionShellProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
};

export function SectionShell({ title, action, children, flush = false }: SectionShellProps) {
  return (
    <section
      style={{
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        background: 'var(--lf-color-bg-panel)',
        borderRadius: 'var(--lf-radius-sm)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--lf-space-2)',
          borderBottomWidth: 'var(--lf-border-width-hair)',
          borderBottomStyle: 'solid',
          borderBottomColor: 'var(--lf-color-border-subtle)',
          background: 'var(--lf-color-bg-panel-alt)',
          padding: 'var(--lf-space-2) var(--lf-space-3)',
        }}
      >
        <h2
          className="font-[family-name:var(--font-ui)] font-semibold uppercase"
          style={{
            margin: 0,
            fontSize: 'var(--lf-type-label)',
            letterSpacing: 'var(--lf-type-tracking-label)',
            color: 'var(--lf-color-text-gold)',
          }}
        >
          {title}
        </h2>
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
    <Link href={href} style={{ color: 'var(--lf-color-text-gold)' }}>
      {children}
    </Link>
  );
}
