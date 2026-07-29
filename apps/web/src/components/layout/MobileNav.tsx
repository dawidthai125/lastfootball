'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NavIcon } from '@/components/assets';
import { useClub, useHasFixtures, useTrainingUnlocked } from '@/components/club/ClubProvider';
import { SoftLockModal } from '@/components/layout/SoftLockModal';
import { NAV_GROUPS, type NavItem } from '@/lib/nav';
import { resolveHubPhase, resolveNavAccess } from '@/lib/hub';

import './mobile-nav.css';

const PRIMARY_IDS = ['panel', 'training', 'squad', 'transfers'] as const;

/** Display labels for primary slots (href/id unchanged). Variant A: Trening in bar. */
const PRIMARY_LABEL: Record<(typeof PRIMARY_IDS)[number], string> = {
  panel: 'Hub',
  training: 'Trening',
  squad: 'Kadra',
  transfers: 'Transfery',
};

function isActive(pathname: string, href: string): boolean {
  if (href === '/hub') return pathname === '/hub';
  if (href === '/squad') {
    return pathname === '/squad' || pathname.startsWith('/players/');
  }
  if (href === '/matches') {
    return pathname === '/matches' || pathname.startsWith('/match/');
  }
  if (href === '/training') {
    return pathname === '/training' || pathname.startsWith('/training/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function findNavItem(id: string): NavItem | undefined {
  for (const group of NAV_GROUPS) {
    const hit = group.items.find((i) => i.id === id);
    if (hit) return hit;
  }
  return undefined;
}

/**
 * Mobile bottom nav — LFE-UI-IMPL-04 / HF-SHELL-02 Variant A.
 */
export function MobileNav() {
  const pathname = usePathname();
  const club = useClub();
  const hasFixtures = useHasFixtures();
  const trainingUnlocked = useTrainingUnlocked();
  const phase = resolveHubPhase(club, { hasFixtures });
  const navCtx = {
    transferWindowOpen: club?.transferWindowOpen,
    trainingUnlocked,
  };
  const [moreOpen, setMoreOpen] = useState(false);
  const [lockTitle, setLockTitle] = useState<string | null>(null);
  const titleId = useId();
  const closeLock = useCallback(() => setLockTitle(null), []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  const primaryItems = PRIMARY_IDS.map((id) => findNavItem(id)).filter((item): item is NavItem =>
    Boolean(item),
  );

  const moreGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !(PRIMARY_IDS as readonly string[]).includes(item.id)),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <nav
        className="lf-mobile-nav md:hidden"
        aria-label="Menu mobilne"
        data-lf-impl="LFE-UI-IMPL-04"
      >
        {primaryItems.map((item) => {
          const active = isActive(pathname, item.href);
          const locked = resolveNavAccess(item.id, phase, navCtx) === 'soft_locked';
          const label = PRIMARY_LABEL[item.id as (typeof PRIMARY_IDS)[number]] ?? item.label;
          const className = [
            'lf-mobile-nav__slot',
            active && !locked ? 'lf-mobile-nav__slot--active' : '',
            locked ? 'lf-mobile-nav__slot--locked' : '',
          ]
            .filter(Boolean)
            .join(' ');

          if (locked) {
            return (
              <button
                key={item.id}
                type="button"
                className={className}
                title={`${item.label} — niedostępne`}
                onClick={() => setLockTitle(item.label)}
              >
                <NavIcon id={item.id} active={false} size={16} />
                <span className="font-[family-name:var(--font-ui)]">{label}</span>
              </button>
            );
          }

          return (
            <Link key={item.id} href={item.href} className={className}>
              <NavIcon id={item.id} active={active} size={16} />
              <span className="font-[family-name:var(--font-ui)]">{label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          className={`lf-mobile-nav__slot ${moreOpen ? 'lf-mobile-nav__slot--active' : ''}`}
          aria-expanded={moreOpen}
          aria-controls={moreOpen ? titleId : undefined}
          onClick={() => setMoreOpen((v) => !v)}
        >
          <NavIcon id="settings" active={moreOpen} size={16} />
          <span className="font-[family-name:var(--font-ui)] font-semibold">Więcej</span>
        </button>
      </nav>

      {moreOpen ? (
        <div className="lf-mobile-more md:hidden" role="presentation">
          <button
            type="button"
            className="lf-mobile-more__backdrop"
            aria-label="Zamknij menu"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="lf-mobile-more__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <header className="lf-mobile-more__header">
              <h2 id={titleId} className="lf-mobile-more__title">
                Więcej
              </h2>
              <button
                type="button"
                className="lf-mobile-more__close"
                onClick={() => setMoreOpen(false)}
              >
                Zamknij
              </button>
            </header>
            <div className="lf-mobile-more__body">
              {moreGroups.map((group) => (
                <div key={group.id} className="lf-mobile-more__group">
                  <p className="lf-mobile-more__group-label">{group.label}</p>
                  <ul className="lf-mobile-more__list">
                    {group.items.map((item) => {
                      const active = isActive(pathname, item.href);
                      const locked = resolveNavAccess(item.id, phase, navCtx) === 'soft_locked';
                      if (locked) {
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              className="lf-mobile-more__item lf-mobile-more__item--locked"
                              title={`${item.label} — niedostępne`}
                              onClick={() => {
                                setMoreOpen(false);
                                setLockTitle(item.label);
                              }}
                            >
                              <NavIcon id={item.id} active={false} size={16} />
                              {item.label}
                              <span className="lf-mobile-more__soon">wkrótce</span>
                            </button>
                          </li>
                        );
                      }
                      return (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            className={`lf-mobile-more__item ${active ? 'lf-mobile-more__item--active' : ''}`}
                            onClick={() => setMoreOpen(false)}
                          >
                            <NavIcon id={item.id} active={active} size={16} />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <SoftLockModal
        open={Boolean(lockTitle)}
        title={lockTitle ? `${lockTitle} niedostępne` : 'Niedostępne'}
        reason="Ta lokacja odblokuje się wraz z postępem klubu. Reguła pochodzi z resolveNavAccess — nie z UI."
        onClose={closeLock}
      />
    </>
  );
}
