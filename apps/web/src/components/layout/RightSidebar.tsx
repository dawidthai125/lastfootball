import Link from 'next/link';
import type { ReactNode } from 'react';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { dashboardMock, sessionChrome } from '@/data/mock';

/**
 * Right rail — match context only (WF / GX: not a second dashboard).
 * No duplicate daily tasks / notifications list.
 */
export function RightSidebar() {
  const { nextTraining, nextMatch, form, injuries } = dashboardMock;
  const { energy } = sessionChrome;

  return (
    <aside
      className="flex h-full flex-col overflow-y-auto border-l"
      style={{
        width: '100%',
        background: 'var(--lf-color-bg-raised)',
        borderColor: 'var(--lf-color-border-subtle)',
        padding: 'var(--lf-space-2)',
        gap: 'var(--lf-space-2)',
      }}
    >
      <RailWidget title="Następny mecz" href="/match/m-next">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--lf-space-2)',
          }}
        >
          <span
            className="font-semibold"
            style={{ fontSize: 'var(--lf-type-table)', color: 'var(--lf-color-text-primary)' }}
          >
            {nextMatch.opponent}
          </span>
          <span
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              fontSize: 'var(--lf-type-label)',
              padding: '0 var(--lf-space-1)',
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderRadius: 'var(--lf-radius-xs)',
              borderColor: nextMatch.home
                ? 'var(--lf-color-status-ok)'
                : 'var(--lf-color-status-info)',
              background: nextMatch.home
                ? 'var(--lf-color-status-ok-soft)'
                : 'var(--lf-color-bg-inset)',
              color: nextMatch.home ? 'var(--lf-color-status-ok)' : 'var(--lf-color-status-info)',
            }}
          >
            {nextMatch.home ? 'Dom' : 'Wyjazd'}
          </span>
        </div>
        <p style={{ margin: 0, marginTop: 'var(--lf-space-1)', fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-muted)' }}>
          {nextMatch.competition}
        </p>
        <p style={{ margin: 0, fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-faint)' }}>
          {nextMatch.when} · {nextMatch.countdown}
        </p>
      </RailWidget>

      <RailWidget title="Następny trening" href="/training">
        <div
          className="font-semibold"
          style={{ fontSize: 'var(--lf-type-table)', color: 'var(--lf-color-text-primary)' }}
        >
          {nextTraining.focus}
        </div>
        <p style={{ margin: 0, marginTop: 'var(--lf-space-1)', fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-muted)' }}>
          {nextTraining.when}
        </p>
        <p style={{ margin: 0, fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-faint)' }}>
          Intensywność: {nextTraining.intensity}
        </p>
      </RailWidget>

      <RailWidget title="Energia">
        <ProgressBar
          value={energy.current}
          max={energy.max}
          tone={energy.current < 30 ? 'danger' : energy.current < 60 ? 'warn' : 'ok'}
        />
      </RailWidget>

      <RailWidget title="Forma">
        <ProgressBar value={form} tone={form >= 70 ? 'ok' : form >= 45 ? 'warn' : 'danger'} />
      </RailWidget>

      <RailWidget title="Kontuzje">
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-1)' }}>
          {injuries.map((inj) => (
            <li
              key={inj.name}
              style={{
                borderWidth: 'var(--lf-border-width-hair)',
                borderStyle: 'solid',
                borderColor: 'var(--lf-color-status-danger)',
                background: 'var(--lf-color-status-danger-soft)',
                padding: 'var(--lf-space-2)',
                borderRadius: 'var(--lf-radius-sm)',
              }}
            >
              <div style={{ fontSize: 'var(--lf-type-caption)', fontWeight: 600, color: 'var(--lf-color-text-primary)' }}>
                {inj.name}
              </div>
              <div style={{ fontSize: 'var(--lf-type-label)', color: 'var(--lf-color-status-danger)' }}>
                {inj.detail}
              </div>
            </li>
          ))}
        </ul>
      </RailWidget>
    </aside>
  );
}

function RailWidget({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: ReactNode;
}) {
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
          borderBottomWidth: 'var(--lf-border-width-hair)',
          borderBottomStyle: 'solid',
          borderBottomColor: 'var(--lf-color-border-subtle)',
          background: 'var(--lf-color-bg-panel-alt)',
          padding: 'var(--lf-space-2)',
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
        {href ? (
          <Link href={href} style={{ color: 'var(--lf-color-text-gold)', fontSize: 'var(--lf-type-caption)' }}>
            →
          </Link>
        ) : null}
      </header>
      <div style={{ padding: 'var(--lf-space-2)' }}>{children}</div>
    </section>
  );
}
