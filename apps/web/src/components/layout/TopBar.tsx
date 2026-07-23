'use client';

import Link from 'next/link';

import { useOverlay } from '@/components/overlay/OverlayProvider';
import { useShell } from '@/components/layout/ShellProvider';
import { formatMoney, sessionChrome } from '@/data/mock';

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'gold' | 'ok';
}) {
  const color =
    tone === 'gold'
      ? 'var(--lf-color-text-gold)'
      : tone === 'ok'
        ? 'var(--lf-color-status-ok)'
        : 'var(--lf-color-text-primary)';

  return (
    <div
      className="flex items-baseline gap-1 whitespace-nowrap"
      style={{ paddingInline: 'var(--lf-space-2)', fontSize: 'var(--lf-type-caption)' }}
    >
      <span style={{ color: 'var(--lf-color-text-faint)' }}>{label}</span>
      <span
        className="font-[family-name:var(--font-ui)] font-semibold tabular-nums"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

export function TopBar() {
  const { server, season, day, money, premium, energy, notifications, player } = sessionChrome;
  const { toggleNotifications } = useOverlay();
  const { toggleNav, navCollapsed } = useShell();

  return (
    <header
      className="flex shrink-0 items-center border-b"
      style={{
        height: 'var(--lf-shell-topbar)',
        background: 'var(--lf-color-bg-raised)',
        borderColor: 'var(--lf-color-border-subtle)',
        paddingInline: 'var(--lf-space-2)',
        gap: 'var(--lf-space-2)',
        zIndex: 'var(--lf-z-chrome)',
        position: 'relative',
      }}
    >
      <button
        type="button"
        onClick={toggleNav}
        aria-label={navCollapsed ? 'Rozwiń nawigację' : 'Zwiń nawigację'}
        aria-pressed={navCollapsed}
        className="hidden border md:inline-flex"
        style={{
          borderColor: 'var(--lf-color-border-subtle)',
          background: 'var(--lf-color-bg-panel)',
          color: 'var(--lf-color-text-muted)',
          fontSize: 'var(--lf-type-caption)',
          padding: 'var(--lf-space-1) var(--lf-space-2)',
          borderRadius: 'var(--lf-radius-sm)',
        }}
      >
        {navCollapsed ? '»' : '«'}
      </button>

      <Link
        href="/"
        className="flex items-center border-r"
        style={{
          gap: 'var(--lf-space-2)',
          paddingRight: 'var(--lf-space-2)',
          borderColor: 'var(--lf-color-border-subtle)',
        }}
      >
        <span
          className="inline-flex items-center justify-center font-[family-name:var(--font-ui)] font-bold"
          style={{
            width: '20px',
            height: '20px',
            background: 'var(--lf-color-gold-soft)',
            color: 'var(--lf-color-gold-base)',
            fontSize: 'var(--lf-type-label)',
            borderRadius: 'var(--lf-radius-xs)',
          }}
          aria-hidden
        >
          LF
        </span>
        <span
          className="hidden font-[family-name:var(--font-ui)] font-semibold uppercase sm:inline"
          style={{
            fontSize: 'var(--lf-type-table)',
            letterSpacing: 'var(--lf-type-tracking-label)',
            color: 'var(--lf-color-text-primary)',
          }}
        >
          LastFootball
        </span>
      </Link>

      <div className="hidden items-center md:flex">
        <Metric label="Serwer" value={server} />
        <span style={{ color: 'var(--lf-color-border-strong)' }}>|</span>
        <Metric label="Sezon" value={String(season)} />
        <span style={{ color: 'var(--lf-color-border-strong)' }}>|</span>
        <Metric label="Dzień" value={String(day)} />
      </div>

      <div className="ml-auto flex items-center overflow-x-auto" style={{ gap: 'var(--lf-space-1)' }}>
        <Metric label="€" value={formatMoney(money).replace(/\s/g, '\u00a0')} tone="ok" />
        <span className="hidden sm:inline" style={{ color: 'var(--lf-color-border-strong)' }}>
          |
        </span>
        <Metric label="LF" value={String(premium)} tone="gold" />
        <span className="hidden sm:inline" style={{ color: 'var(--lf-color-border-strong)' }}>
          |
        </span>
        <Metric label="Energia" value={`${energy.current}/${energy.max}`} />

        <button
          type="button"
          onClick={toggleNotifications}
          className="relative border"
          style={{
            marginLeft: 'var(--lf-space-1)',
            borderColor: 'var(--lf-color-border-subtle)',
            background: 'var(--lf-color-bg-panel)',
            color: 'var(--lf-color-text-muted)',
            fontSize: 'var(--lf-type-caption)',
            padding: 'var(--lf-space-1) var(--lf-space-2)',
            borderRadius: 'var(--lf-radius-sm)',
          }}
          aria-label={`Powiadomienia: ${notifications}`}
        >
          Powiad.
          {notifications > 0 ? (
            <span
              className="absolute flex items-center justify-center font-bold"
              style={{
                top: '-4px',
                right: '-4px',
                minWidth: '14px',
                height: '14px',
                paddingInline: '2px',
                background: 'var(--lf-color-status-danger)',
                color: 'var(--lf-color-text-primary)',
                fontSize: '9px',
                borderRadius: 'var(--lf-radius-xs)',
              }}
            >
              {notifications}
            </span>
          ) : null}
        </button>

        <Link
          href="/profile"
          className="flex items-center border"
          style={{
            marginLeft: 'var(--lf-space-1)',
            borderColor: 'var(--lf-color-border-subtle)',
            background: 'var(--lf-color-bg-panel)',
            gap: 'var(--lf-space-2)',
            paddingBlock: 'var(--lf-space-1)',
            paddingRight: 'var(--lf-space-2)',
            paddingLeft: 'var(--lf-space-1)',
            borderRadius: 'var(--lf-radius-sm)',
          }}
        >
          <span
            className="flex items-center justify-center font-[family-name:var(--font-ui)] font-bold"
            style={{
              width: '20px',
              height: '20px',
              background: 'var(--lf-color-bg-panel-alt)',
              color: 'var(--lf-color-gold-base)',
              fontSize: '9px',
              borderRadius: 'var(--lf-radius-xs)',
            }}
          >
            {player.avatarInitials}
          </span>
          <div className="hidden leading-tight sm:block">
            <div
              className="font-medium"
              style={{ fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-primary)' }}
            >
              {player.name}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--lf-color-text-faint)' }}>
              {player.club}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
