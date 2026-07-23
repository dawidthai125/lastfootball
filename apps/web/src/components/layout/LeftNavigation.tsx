'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ClubCrest, NavIcon } from '@/components/assets';
import { useShell } from '@/components/layout/ShellProvider';
import { DEV_NAV, NAV_GROUPS } from '@/lib/nav';
import { dashboardMock, sessionChrome } from '@/data/mock';

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/squad') {
    return pathname === '/squad' || pathname.startsWith('/players/');
  }
  if (href === '/matches') {
    return pathname === '/matches' || pathname.startsWith('/match/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function LeftNavigation() {
  const pathname = usePathname();
  const { navCollapsed } = useShell();
  const { nextMatch } = dashboardMock;

  return (
    <aside
      className="lf-app-shell__nav hidden flex-col border-r md:flex"
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
            <ClubCrest shortName="FCL" clubName={sessionChrome.player.club} size="sm" />
            <div style={{ minWidth: 0 }}>
              <div
                className="font-[family-name:var(--font-ui)] font-semibold uppercase truncate"
                style={{
                  fontSize: 'var(--lf-type-label)',
                  letterSpacing: 'var(--lf-type-tracking-label)',
                  color: 'var(--lf-color-text-faint)',
                }}
              >
                Twój klub
              </div>
              <div
                className="truncate font-[family-name:var(--font-ui)] font-semibold"
                style={{
                  marginTop: '2px',
                  fontSize: 'var(--lf-type-table)',
                  color: 'var(--lf-color-text-primary)',
                }}
              >
                {sessionChrome.player.club}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ClubCrest shortName="FCL" clubName={sessionChrome.player.club} size="sm" />
          </div>
        )}
      </div>

      <nav
        className="flex-1 overflow-y-auto"
        aria-label="Menu główne"
        style={{ paddingBlock: 'var(--lf-space-2)' }}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.id} style={{ marginBottom: 'var(--lf-space-3)' }}>
            {!navCollapsed ? (
              <div
                className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                style={{
                  paddingInline: 'var(--lf-space-3)',
                  paddingBottom: 'var(--lf-space-1)',
                  fontSize: 'var(--lf-type-label)',
                  letterSpacing: 'var(--lf-type-tracking-label)',
                  color: 'var(--lf-color-text-faint)',
                }}
              >
                {group.label}
              </div>
            ) : null}
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={item.label}
                  className={`lf-nav-item ${active ? 'lf-nav-item--active' : ''}`}
                  style={{
                    color: active ? 'var(--lf-color-text-primary)' : 'var(--lf-color-text-muted)',
                    paddingInline: navCollapsed ? 'var(--lf-space-2)' : 'var(--lf-space-3)',
                    fontSize: 'var(--lf-type-table)',
                    justifyContent: navCollapsed ? 'center' : 'space-between',
                  }}
                >
                  <span
                    className="flex items-center truncate font-[family-name:var(--font-ui)]"
                    style={{ gap: 'var(--lf-space-2)' }}
                  >
                    <NavIcon id={item.id} active={active} size={navCollapsed ? 18 : 16} />
                    {navCollapsed ? null : item.label}
                  </span>
                  {!navCollapsed && item.badge ? (
                    <span
                      className="font-semibold tabular-nums"
                      style={{
                        minWidth: '1.1rem',
                        textAlign: 'center',
                        background: 'var(--lf-color-status-danger)',
                        color: 'var(--lf-color-text-primary)',
                        fontSize: 'var(--lf-type-label)',
                        paddingInline: 'var(--lf-space-1)',
                        borderRadius: 'var(--lf-radius-xs)',
                      }}
                    >
                      {sessionChrome.notifications}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {!navCollapsed ? (
        <div
          className="border-t"
          style={{
            borderColor: 'var(--lf-color-border-subtle)',
            padding: 'var(--lf-space-3)',
            background: 'var(--lf-color-bg-inset)',
          }}
        >
          <div
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-gold)',
            }}
          >
            Następny mecz
          </div>
          <div
            className="truncate"
            style={{
              marginTop: 'var(--lf-space-1)',
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-primary)',
              fontWeight: 600,
            }}
          >
            vs {nextMatch.opponent}
          </div>
          <div style={{ fontSize: 'var(--lf-type-label)', color: 'var(--lf-color-text-faint)' }}>
            {nextMatch.when} · {nextMatch.countdown}
          </div>
          <Link
            href="/match/m-next"
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              display: 'inline-block',
              marginTop: 'var(--lf-space-2)',
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-gold-base)',
            }}
          >
            Przygotuj →
          </Link>
        </div>
      ) : null}

      <div className="border-t" style={{ borderColor: 'var(--lf-color-border-subtle)', paddingBlock: 'var(--lf-space-1)' }}>
        {!navCollapsed ? (
          <div
            style={{
              paddingInline: 'var(--lf-space-3)',
              paddingBottom: 'var(--lf-space-1)',
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-faint)',
              textTransform: 'uppercase',
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
              title={item.label}
              className={`lf-nav-item ${active ? 'lf-nav-item--active' : ''}`}
              style={{
                color: active ? 'var(--lf-color-text-primary)' : 'var(--lf-color-text-muted)',
                paddingInline: navCollapsed ? 'var(--lf-space-2)' : 'var(--lf-space-3)',
                fontSize: 'var(--lf-type-table)',
                justifyContent: navCollapsed ? 'center' : 'flex-start',
              }}
            >
              {navCollapsed ? (
                <NavIcon id={item.id} active={active} size={18} />
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
    </aside>
  );
}
