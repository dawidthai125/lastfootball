'use client';

import Link from 'next/link';

import { ClubCrest, NavIcon, PlayerPortrait } from '@/components/assets';
import { useClub } from '@/components/club/ClubProvider';
import { useOverlay } from '@/components/overlay/OverlayProvider';
import { useShell } from '@/components/layout/ShellProvider';
import { signOut } from '@/lib/auth/actions';
import { resolveHubPhase } from '@/lib/hub';

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'gold' | 'ok' }) {
  return (
    <div className="lf-chrome-metric">
      <span className="lf-chrome-metric__label">{label}</span>
      <span
        className={
          tone === 'gold'
            ? 'lf-chrome-metric__value lf-chrome-metric__value--gold'
            : tone === 'ok'
              ? 'lf-chrome-metric__value lf-chrome-metric__value--ok'
              : 'lf-chrome-metric__value'
        }
      >
        {value}
      </span>
    </div>
  );
}

export function TopBar() {
  const club = useClub();
  const phase = resolveHubPhase(club);
  const early = phase === 'EARLY_CLUB' || phase === 'NEW_CLUB';
  const { toggleNotifications } = useOverlay();
  const { toggleNav, navCollapsed } = useShell();

  const clubName = club?.name ?? 'Klub';
  const shortName = club?.shortName ?? 'LF';

  return (
    <header
      className="flex shrink-0 items-center"
      style={{
        height: 'var(--lf-shell-topbar)',
        background: 'var(--lf-color-bg-raised)',
        borderBottomWidth: 'var(--lf-border-width-hair)',
        borderBottomStyle: 'solid',
        borderBottomColor: 'var(--lf-color-border-subtle)',
        boxShadow: 'inset 0 -1px 0 var(--lf-color-border-gold)',
        paddingInline: 'var(--lf-space-3)',
        gap: 'var(--lf-space-3)',
        zIndex: 'var(--lf-z-chrome)',
        position: 'relative',
      }}
    >
      <button
        type="button"
        onClick={toggleNav}
        aria-label={navCollapsed ? 'Rozwiń nawigację' : 'Zwiń nawigację'}
        aria-pressed={navCollapsed}
        className="hidden md:inline-flex"
        style={{
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-subtle)',
          background: 'var(--lf-color-bg-inset)',
          color: 'var(--lf-color-text-muted)',
          fontSize: 'var(--lf-type-caption)',
          padding: 'var(--lf-space-1) var(--lf-space-2)',
          borderRadius: 'var(--lf-radius-sm)',
          minWidth: 'var(--lf-space-6)',
          justifyContent: 'center',
        }}
      >
        {navCollapsed ? '»' : '«'}
      </button>

      <Link
        href="/hub"
        className="flex items-center"
        style={{
          gap: 'var(--lf-space-2)',
          paddingRight: 'var(--lf-space-3)',
          borderRightWidth: 'var(--lf-border-width-hair)',
          borderRightStyle: 'solid',
          borderRightColor: 'var(--lf-color-border-subtle)',
          minWidth: 0,
        }}
      >
        <ClubCrest
          shortName={shortName}
          clubName={clubName}
          crestTemplateId={club?.crestTemplateId}
          accentColor={club?.primaryColor}
          size="sm"
          style={{ lineHeight: 0 }}
        />
        <div className="hidden min-w-0 sm:block">
          <div
            className="truncate font-[family-name:var(--font-ui)] font-bold uppercase"
            style={{
              fontSize: 'var(--lf-type-table)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-primary)',
              lineHeight: 1.1,
            }}
          >
            LastFootball
          </div>
          <div
            className="truncate"
            style={{
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-gold)',
              textTransform: 'uppercase',
            }}
          >
            {clubName}
          </div>
        </div>
      </Link>

      <div className="hidden items-center md:flex" style={{ gap: 0 }}>
        <Metric label="Sezon" value="1" />
        <Metric label="Dzień" value={early ? '1' : '1'} />
        {early ? <Metric label="Faza" value="Start" tone="gold" /> : null}
      </div>

      <div
        className="ml-auto flex items-center overflow-x-auto"
        style={{ gap: 'var(--lf-space-2)' }}
      >
        <button
          type="button"
          onClick={toggleNotifications}
          className="relative inline-flex items-center"
          style={{
            borderWidth: 'var(--lf-border-width-hair)',
            borderStyle: 'solid',
            borderColor: 'var(--lf-color-border-subtle)',
            background: 'var(--lf-color-bg-inset)',
            color: 'var(--lf-color-text-muted)',
            gap: 'var(--lf-space-1)',
            padding: 'var(--lf-space-1) var(--lf-space-2)',
            borderRadius: 'var(--lf-radius-sm)',
          }}
          aria-label="Powiadomienia"
        >
          <NavIcon id="messages" size={14} />
        </button>

        <Link
          href="/profile"
          className="flex items-center"
          style={{
            borderWidth: 'var(--lf-border-width-hair)',
            borderStyle: 'solid',
            borderColor: 'var(--lf-color-border-gold)',
            background: 'var(--lf-color-gold-soft)',
            gap: 'var(--lf-space-2)',
            paddingBlock: 'var(--lf-space-1)',
            paddingRight: 'var(--lf-space-2)',
            paddingLeft: 'var(--lf-space-1)',
            borderRadius: 'var(--lf-radius-sm)',
          }}
        >
          <PlayerPortrait
            playerId="manager"
            name="Menedżer"
            size="sm"
            style={{ width: 22, height: 22 }}
          />
          <div className="hidden leading-tight sm:block">
            <div
              className="font-[family-name:var(--font-ui)] font-semibold"
              style={{ fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-primary)' }}
            >
              Menedżer
            </div>
            <div
              className="font-[family-name:var(--font-ui)] uppercase"
              style={{
                fontSize: '9px',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-gold)',
              }}
            >
              {early ? 'Early club' : 'Klub'}
            </div>
          </div>
        </Link>

        <form action={signOut}>
          <button
            type="submit"
            aria-label="Wyloguj"
            style={{
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-subtle)',
              background: 'var(--lf-color-bg-inset)',
              color: 'var(--lf-color-text-muted)',
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              textTransform: 'uppercase',
              padding: 'var(--lf-space-1) var(--lf-space-2)',
              borderRadius: 'var(--lf-radius-sm)',
              cursor: 'pointer',
            }}
          >
            Wyjdź
          </button>
        </form>
      </div>
    </header>
  );
}
