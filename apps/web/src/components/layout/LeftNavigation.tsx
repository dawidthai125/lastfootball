'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BrandLogo, ClubCrest, NavIcon } from '@/components/assets';
import { useClub, useHasFixtures, useTrainingUnlocked } from '@/components/club/ClubProvider';
import { SoftLockModal } from '@/components/layout/SoftLockModal';
import { useShell } from '@/components/layout/ShellProvider';
import { DEV_NAV, NAV_GROUPS } from '@/lib/nav';
import { UI_COPY } from '@/lib/ui/copy';
import { resolveHubPhase, resolveNavAccess } from '@/lib/hub';

import './left-nav.css';

function isActive(pathname: string, href: string): boolean {
  if (href === '/hub') return pathname === '/hub';
  if (href === '/squad') {
    return pathname === '/squad' || pathname.startsWith('/players/');
  }
  if (href === '/matches') {
    return pathname === '/matches' || pathname.startsWith('/match/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Left nav — LFE-UI-IMPL-04 icon rail + LFE-UI-IMPL-06A instant tooltips (collapsed).
 */
export function LeftNavigation() {
  const pathname = usePathname();
  const { navCollapsed } = useShell();
  const club = useClub();
  const hasFixtures = useHasFixtures();
  const trainingUnlocked = useTrainingUnlocked();
  const phase = resolveHubPhase(club, { hasFixtures });
  const navCtx = {
    transferWindowOpen: club?.transferWindowOpen,
    trainingUnlocked,
  };
  const showDev = process.env.NODE_ENV === 'development';
  const [lockTitle, setLockTitle] = useState<string | null>(null);
  const clubName = club?.name ?? 'Klub';

  const closeLock = useCallback(() => setLockTitle(null), []);

  return (
    <aside
      className="lf-app-shell__nav hidden flex-col border-r md:flex"
      data-lf-impl="LFE-UI-IMPL-06A"
      data-nav-collapsed={navCollapsed ? 'true' : 'false'}
      style={{
        width: navCollapsed ? 'var(--lf-shell-nav-collapsed)' : 'var(--lf-shell-nav)',
        background: 'var(--lf-color-bg-raised)',
        borderColor: 'var(--lf-color-border-subtle)',
        transitionProperty: 'width',
        transitionDuration: 'var(--lf-motion-base)',
        transitionTimingFunction: 'var(--lf-motion-easing)',
        zIndex: 'var(--lf-z-chrome)',
      }}
    >
      <div
        className="border-b"
        style={{
          borderColor: 'var(--lf-color-border-subtle)',
          padding: navCollapsed ? 'var(--lf-space-2)' : 'var(--lf-space-3)',
        }}
      >
        {!navCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--lf-space-2)' }}>
            <ClubCrest
              shortName={club?.shortName ?? 'LF'}
              clubName={clubName}
              crestTemplateId={club?.crestTemplateId}
              accentColor={club?.primaryColor}
              size="sm"
            />
            <div style={{ minWidth: 0 }}>
              <div
                className="truncate font-[family-name:var(--font-ui)] font-semibold"
                style={{
                  fontSize: 'var(--lf-type-table)',
                  color: 'var(--lf-color-text-primary)',
                }}
              >
                {clubName}
              </div>
              <div style={{ marginTop: '2px', opacity: 0.72 }}>
                <BrandLogo size="sm" variant="wordmark" />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="lf-nav-crest"
            data-lf-tooltip={clubName}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <ClubCrest
              shortName={club?.shortName ?? 'LF'}
              clubName={clubName}
              crestTemplateId={club?.crestTemplateId}
              accentColor={club?.primaryColor}
              size="sm"
            />
            <span style={{ marginLeft: '4px', opacity: 0.72 }}>
              <BrandLogo size="sm" variant="monogram" />
            </span>
          </div>
        )}
      </div>

      <nav
        className="flex-1 overflow-y-auto"
        aria-label="Menu główne"
        style={{ paddingBlock: 'var(--lf-space-2)' }}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.id} style={{ marginBottom: 'var(--lf-space-2)' }}>
            {!navCollapsed ? (
              <div
                className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                style={{
                  paddingInline: 'var(--lf-space-3)',
                  paddingBottom: '2px',
                  fontSize: '9px',
                  letterSpacing: 'var(--lf-type-tracking-label)',
                  color: 'var(--lf-color-text-faint)',
                  opacity: 0.75,
                }}
              >
                {group.label}
              </div>
            ) : null}
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const access = resolveNavAccess(item.id, phase, navCtx);
              const locked = access === 'soft_locked';
              const tip = navCollapsed ? item.label : undefined;
              const itemStyle = {
                color: locked
                  ? 'var(--lf-color-text-faint)'
                  : active
                    ? 'var(--lf-color-text-primary)'
                    : 'var(--lf-color-text-muted)',
                paddingInline: navCollapsed ? 'var(--lf-space-2)' : 'var(--lf-space-3)',
                fontSize: 'var(--lf-type-caption)',
                justifyContent: navCollapsed ? ('center' as const) : ('space-between' as const),
              };

              if (locked) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`${item.label} — ${UI_COPY.softLockUnavailable}`}
                    data-lf-tooltip={tip}
                    className="lf-nav-item lf-nav-item--locked"
                    style={itemStyle}
                    onClick={() => setLockTitle(item.label)}
                  >
                    <span
                      className="flex items-center truncate font-[family-name:var(--font-ui)]"
                      style={{ gap: 'var(--lf-space-2)' }}
                    >
                      <NavIcon id={item.id} active={false} size={navCollapsed ? 20 : 16} />
                      {navCollapsed ? null : item.label}
                    </span>
                    {!navCollapsed ? (
                      <span
                        style={{
                          fontSize: '9px',
                          color: 'var(--lf-color-text-faint)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {UI_COPY.softLockSoon}
                      </span>
                    ) : null}
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-label={item.label}
                  data-lf-tooltip={tip}
                  className={`lf-nav-item ${active ? 'lf-nav-item--active' : ''}`}
                  style={itemStyle}
                >
                  <span
                    className="flex items-center truncate font-[family-name:var(--font-ui)]"
                    style={{ gap: 'var(--lf-space-2)' }}
                  >
                    <NavIcon id={item.id} active={active} size={navCollapsed ? 20 : 16} />
                    {navCollapsed ? null : item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {showDev ? (
        <div
          className="border-t"
          style={{
            borderColor: 'var(--lf-color-border-subtle)',
            paddingBlock: 'var(--lf-space-1)',
          }}
        >
          {!navCollapsed ? (
            <div
              style={{
                paddingInline: 'var(--lf-space-3)',
                paddingBottom: 'var(--lf-space-1)',
                fontSize: '9px',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-faint)',
                textTransform: 'uppercase',
                opacity: 0.75,
              }}
            >
              Dev
            </div>
          ) : null}
          {DEV_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.label}
                data-lf-tooltip={navCollapsed ? item.label : undefined}
                className={`lf-nav-item ${active ? 'lf-nav-item--active' : ''}`}
                style={{
                  color: active ? 'var(--lf-color-text-primary)' : 'var(--lf-color-text-muted)',
                  paddingInline: navCollapsed ? 'var(--lf-space-2)' : 'var(--lf-space-3)',
                  fontSize: 'var(--lf-type-caption)',
                  justifyContent: navCollapsed ? 'center' : 'flex-start',
                }}
              >
                {navCollapsed ? (
                  <NavIcon id={item.id} active={active} size={20} />
                ) : (
                  <span className="flex items-center" style={{ gap: 'var(--lf-space-2)' }}>
                    <NavIcon id={item.id} active={active} size={16} />
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ) : null}

      <SoftLockModal
        open={Boolean(lockTitle)}
        title={
          lockTitle
            ? `${lockTitle} jest ${UI_COPY.softLockUnavailable}`
            : `Lokacja ${UI_COPY.softLockUnavailable}`
        }
        reason={UI_COPY.softLockReason}
        onClose={closeLock}
      />
    </aside>
  );
}
