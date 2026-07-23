'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useShell } from '@/components/layout/ShellProvider';
import { DEV_NAV, NAV_GROUPS } from '@/lib/nav';
import { sessionChrome } from '@/data/mock';

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
          padding: 'var(--lf-space-2)',
        }}
      >
        {!navCollapsed ? (
          <>
            <div
              className="font-[family-name:var(--font-ui)] font-semibold uppercase"
              style={{
                fontSize: 'var(--lf-type-label)',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-faint)',
              }}
            >
              Nawigacja
            </div>
            <div
              className="truncate font-medium"
              style={{
                marginTop: 'var(--lf-space-1)',
                fontSize: 'var(--lf-type-table)',
                color: 'var(--lf-color-text-secondary)',
              }}
            >
              {sessionChrome.player.club}
            </div>
          </>
        ) : (
          <div
            className="text-center font-[family-name:var(--font-ui)] font-bold"
            style={{ color: 'var(--lf-color-gold-base)', fontSize: 'var(--lf-type-caption)' }}
            title={sessionChrome.player.club}
          >
            FL
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto" aria-label="Menu główne" style={{ paddingBlock: 'var(--lf-space-1)' }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.id} style={{ marginBottom: 'var(--lf-space-2)' }}>
            {!navCollapsed ? (
              <div
                className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                style={{
                  paddingInline: 'var(--lf-space-3)',
                  paddingBottom: 'var(--lf-space-1)',
                  fontSize: '9px',
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
                  className="flex items-center justify-between transition-colors"
                  style={{
                    borderLeftWidth: 'var(--lf-border-width-thick)',
                    borderLeftStyle: 'solid',
                    borderLeftColor: active ? 'var(--lf-color-gold-base)' : 'transparent',
                    background: active ? 'var(--lf-color-gold-soft)' : 'transparent',
                    color: active ? 'var(--lf-color-text-primary)' : 'var(--lf-color-text-muted)',
                    paddingBlock: 'var(--lf-space-1)',
                    paddingInline: navCollapsed ? 'var(--lf-space-2)' : 'var(--lf-space-3)',
                    fontSize: 'var(--lf-type-table)',
                    justifyContent: navCollapsed ? 'center' : 'space-between',
                    transitionDuration: 'var(--lf-motion-fast)',
                    transitionTimingFunction: 'var(--lf-motion-easing)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = 'var(--lf-color-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = active
                      ? 'var(--lf-color-gold-soft)'
                      : 'transparent';
                  }}
                >
                  <span className="truncate font-[family-name:var(--font-ui)] tracking-wide">
                    {navCollapsed ? item.shortLabel : item.label}
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

      <div className="border-t" style={{ borderColor: 'var(--lf-color-border-subtle)', paddingBlock: 'var(--lf-space-1)' }}>
        {!navCollapsed ? (
          <div
            style={{
              paddingInline: 'var(--lf-space-3)',
              paddingBottom: 'var(--lf-space-1)',
              fontSize: '9px',
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
              className="flex transition-colors"
              style={{
                borderLeftWidth: 'var(--lf-border-width-thick)',
                borderLeftStyle: 'solid',
                borderLeftColor: active ? 'var(--lf-color-gold-base)' : 'transparent',
                background: active ? 'var(--lf-color-gold-soft)' : 'transparent',
                color: active ? 'var(--lf-color-text-primary)' : 'var(--lf-color-text-muted)',
                paddingBlock: 'var(--lf-space-1)',
                paddingInline: navCollapsed ? 'var(--lf-space-2)' : 'var(--lf-space-3)',
                fontSize: 'var(--lf-type-table)',
                justifyContent: navCollapsed ? 'center' : 'flex-start',
              }}
            >
              {navCollapsed ? item.shortLabel : item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
