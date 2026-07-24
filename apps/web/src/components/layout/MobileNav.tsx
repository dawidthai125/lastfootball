'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NavIcon } from '@/components/assets';
import { useClub } from '@/components/club/ClubProvider';
import { FLAT_NAV } from '@/lib/nav';
import { resolveHubPhase, resolveNavAccess } from '@/lib/hub';

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

export function MobileNav() {
  const pathname = usePathname();
  const club = useClub();
  const phase = resolveHubPhase(club);

  return (
    <nav
      className="flex shrink-0 overflow-x-auto border-b md:hidden"
      aria-label="Menu mobilne"
      style={{
        background: 'var(--lf-color-bg-raised)',
        borderColor: 'var(--lf-color-border-subtle)',
        boxShadow: 'inset 0 -1px 0 var(--lf-color-border-gold)',
        padding: 'var(--lf-space-1) var(--lf-space-2)',
        gap: 'var(--lf-space-1)',
        zIndex: 'var(--lf-z-chrome)',
      }}
    >
      {FLAT_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const locked = resolveNavAccess(item.id, phase) === 'soft_locked';
        const style = {
          borderBottomWidth: 'var(--lf-border-width-thick)',
          borderBottomStyle: 'solid' as const,
          borderBottomColor: active && !locked ? 'var(--lf-color-gold-base)' : 'transparent',
          background: active && !locked ? 'var(--lf-color-gold-soft)' : 'transparent',
          color: locked
            ? 'var(--lf-color-text-faint)'
            : active
              ? 'var(--lf-color-gold-base)'
              : 'var(--lf-color-text-muted)',
          fontSize: 'var(--lf-type-caption)',
          padding: 'var(--lf-space-2)',
          display: 'inline-flex' as const,
          alignItems: 'center',
          gap: 'var(--lf-space-1)',
          opacity: locked ? 0.6 : 1,
        };

        if (locked) {
          return (
            <span
              key={item.id}
              className="shrink-0 whitespace-nowrap"
              style={style}
              title={`${item.label} — wkrótce`}
              aria-disabled="true"
            >
              <NavIcon id={item.id} active={false} size={14} />
              <span className="font-[family-name:var(--font-ui)]">{item.shortLabel}</span>
            </span>
          );
        }

        return (
          <Link key={item.id} href={item.href} className="shrink-0 whitespace-nowrap" style={style}>
            <NavIcon id={item.id} active={active} size={14} />
            <span className="font-[family-name:var(--font-ui)]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
