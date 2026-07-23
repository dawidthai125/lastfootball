'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NavIcon } from '@/components/assets';
import { FLAT_NAV } from '@/lib/nav';

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

export function MobileNav() {
  const pathname = usePathname();

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
        return (
          <Link
            key={item.id}
            href={item.href}
            className="shrink-0 whitespace-nowrap"
            style={{
              borderBottomWidth: 'var(--lf-border-width-thick)',
              borderBottomStyle: 'solid',
              borderBottomColor: active ? 'var(--lf-color-gold-base)' : 'transparent',
              background: active ? 'var(--lf-color-gold-soft)' : 'transparent',
              color: active ? 'var(--lf-color-gold-base)' : 'var(--lf-color-text-muted)',
              fontSize: 'var(--lf-type-caption)',
              padding: 'var(--lf-space-2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--lf-space-1)',
            }}
          >
            <NavIcon id={item.id} active={active} size={14} />
            <span className="font-[family-name:var(--font-ui)]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
