'use client';

import Link from 'next/link';

import { BrandLogo, ClubCrest, NavIcon, PlayerPortrait } from '@/components/assets';
import { useClub, useHasFixtures } from '@/components/club/ClubProvider';
import { useOverlay } from '@/components/overlay/OverlayProvider';
import { useShell } from '@/components/layout/ShellProvider';
import { signOut } from '@/lib/auth/actions';
import { formatMoney } from '@/lib/finance/format-money';
import { resolveHubPhase } from '@/lib/hub';

function phaseLabel(phase: ReturnType<typeof resolveHubPhase>): string {
  if (phase === 'SEASON') return 'Sezon';
  if (phase === 'EARLY_CLUB' || phase === 'NEW_CLUB') return 'Start';
  return 'Klub';
}

/**
 * Shell TopBar — LFE-UI-IMPL-04: klub first, 1× kasa muted (HF-SHELL-01).
 */
export function TopBar() {
  const club = useClub();
  const hasFixtures = useHasFixtures();
  const phase = resolveHubPhase(club, { hasFixtures });
  const { toggleNotifications } = useOverlay();
  const { toggleNav, navCollapsed } = useShell();

  const clubName = club?.name ?? 'Klub';
  const shortName = club?.shortName ?? 'LF';
  const cashLabel = club ? formatMoney(club.cashBalance) : null;

  return (
    <header
      className="flex shrink-0 items-center"
      data-lf-impl="LFE-UI-IMPL-04"
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
          minHeight: 32,
          justifyContent: 'center',
        }}
      >
        {navCollapsed ? '»' : '«'}
      </button>

      <Link
        href="/hub"
        className="flex min-w-0 items-center"
        style={{
          gap: 'var(--lf-space-2)',
          paddingRight: 'var(--lf-space-3)',
          borderRightWidth: 'var(--lf-border-width-hair)',
          borderRightStyle: 'solid',
          borderRightColor: 'var(--lf-color-border-subtle)',
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
            className="truncate font-[family-name:var(--font-ui)] font-bold"
            style={{
              fontSize: 'var(--lf-type-table)',
              color: 'var(--lf-color-text-primary)',
              lineHeight: 1.1,
            }}
          >
            {clubName}
          </div>
          <div
            className="truncate font-[family-name:var(--font-ui)] uppercase"
            style={{
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-faint)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <BrandLogo size="sm" variant="monogram" />
              <span>{phaseLabel(phase)}</span>
            </span>
          </div>
        </div>
      </Link>

      {cashLabel ? (
        <div className="lf-chrome-metric hidden md:flex" aria-label="Kasa klubu">
          <span className="lf-chrome-metric__label">Kasa</span>
          <span className="lf-chrome-metric__value tabular-nums">{cashLabel}</span>
        </div>
      ) : null}

      <div className="ml-auto flex items-center" style={{ gap: 'var(--lf-space-1)' }}>
        {cashLabel ? (
          <div className="lf-chrome-metric md:hidden" aria-label="Kasa klubu">
            <span className="lf-chrome-metric__value tabular-nums">{cashLabel}</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={toggleNotifications}
          className="inline-flex items-center"
          style={{
            borderWidth: 'var(--lf-border-width-hair)',
            borderStyle: 'solid',
            borderColor: 'var(--lf-color-border-subtle)',
            background: 'transparent',
            color: 'var(--lf-color-text-muted)',
            padding: 'var(--lf-space-1) var(--lf-space-2)',
            borderRadius: 'var(--lf-radius-sm)',
            minHeight: 44,
            minWidth: 44,
            justifyContent: 'center',
          }}
          aria-label="Powiadomienia"
        >
          <NavIcon id="messages" size={16} />
        </button>

        <Link
          href="/profile"
          className="inline-flex items-center"
          aria-label="Profil menedżera"
          style={{
            borderWidth: 'var(--lf-border-width-hair)',
            borderStyle: 'solid',
            borderColor: 'var(--lf-color-border-subtle)',
            background: 'transparent',
            gap: 'var(--lf-space-2)',
            padding: 'var(--lf-space-1)',
            borderRadius: 'var(--lf-radius-sm)',
            minHeight: 44,
            textDecoration: 'none',
          }}
        >
          <PlayerPortrait
            playerId="manager"
            name="Menedżer"
            size="sm"
            style={{ width: 22, height: 22 }}
          />
          <span
            className="hidden font-[family-name:var(--font-ui)] sm:inline"
            style={{
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-muted)',
              paddingRight: 'var(--lf-space-1)',
            }}
          >
            Profil
          </span>
        </Link>

        <form action={signOut}>
          <button
            type="submit"
            aria-label="Wyloguj"
            style={{
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-subtle)',
              background: 'transparent',
              color: 'var(--lf-color-text-muted)',
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              textTransform: 'uppercase',
              padding: 'var(--lf-space-1) var(--lf-space-2)',
              borderRadius: 'var(--lf-radius-sm)',
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            Wyjdź
          </button>
        </form>
      </div>
    </header>
  );
}
