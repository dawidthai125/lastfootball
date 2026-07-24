'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { ClubCrest } from '@/components/assets';
import { useClub } from '@/components/club/ClubProvider';
import { STARTER_PACKAGE } from '@/lib/club/types';
import { FIRST_MATCH_BOT } from '@/lib/first-match/constants';
import { resolveHubPhase } from '@/lib/hub';

/**
 * Right rail — EARLY_CLUB context (no mid-season matchday / injuries).
 */
export function RightSidebar() {
  const club = useClub();
  const phase = resolveHubPhase(club);
  const early = phase === 'EARLY_CLUB' || phase === 'NEW_CLUB';

  if (!early || !club) {
    return (
      <aside
        className="flex h-full flex-col overflow-y-auto"
        style={{
          width: '100%',
          background: 'var(--lf-color-bg-raised)',
          padding: 'var(--lf-space-3)',
        }}
      >
        <p style={{ color: 'var(--lf-color-text-faint)', fontSize: 'var(--lf-type-caption)' }}>
          Kontekst pojawi się wraz z sezonem.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="flex h-full flex-col overflow-y-auto"
      style={{
        width: '100%',
        background: 'var(--lf-color-bg-raised)',
        padding: 'var(--lf-space-3)',
        gap: 'var(--lf-space-3)',
      }}
    >
      <div
        className="font-[family-name:var(--font-ui)] font-semibold uppercase"
        style={{
          fontSize: 'var(--lf-type-label)',
          letterSpacing: 'var(--lf-type-tracking-label)',
          color: 'var(--lf-color-text-faint)',
        }}
      >
        Kontekst klubu
      </div>

      <RailBlock>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--lf-space-3)' }}>
          <ClubCrest
            shortName={club.shortName}
            clubName={club.name}
            crestTemplateId={club.crestTemplateId}
            accentColor={club.primaryColor}
            size="md"
          />
          <div style={{ minWidth: 0 }}>
            <div
              className="font-[family-name:var(--font-ui)] font-semibold uppercase"
              style={{
                fontSize: 'var(--lf-type-label)',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-gold)',
              }}
            >
              Early club
            </div>
            <div
              className="truncate font-[family-name:var(--font-ui)] font-semibold"
              style={{
                marginTop: '2px',
                fontSize: 'var(--lf-type-h2)',
                color: 'var(--lf-color-text-primary)',
              }}
            >
              {club.name}
            </div>
            <div
              style={{ fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-muted)' }}
            >
              {STARTER_PACKAGE.league} · Dzień 1
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 'var(--lf-space-3)',
            fontSize: 'var(--lf-type-caption)',
            color: 'var(--lf-color-text-muted)',
          }}
        >
          Ostatni rywal: {FIRST_MATCH_BOT.name}. Kolejny mecz ligowy pojawi się wkrótce.
        </div>

        <Link
          href="/squad"
          className="font-[family-name:var(--font-ui)] font-semibold"
          style={{
            display: 'block',
            marginTop: 'var(--lf-space-3)',
            textAlign: 'center',
            borderWidth: 'var(--lf-border-width-hair)',
            borderStyle: 'solid',
            borderColor: 'var(--lf-color-border-gold)',
            background: 'var(--lf-color-gold-soft)',
            color: 'var(--lf-color-gold-base)',
            fontSize: 'var(--lf-type-caption)',
            padding: 'var(--lf-space-2) var(--lf-space-3)',
            borderRadius: 'var(--lf-radius-sm)',
            textDecoration: 'none',
          }}
        >
          Zobacz skład
        </Link>
      </RailBlock>

      <RailBlock title="Gotowość">
        <p
          style={{
            margin: 0,
            fontSize: 'var(--lf-type-caption)',
            color: 'var(--lf-color-text-muted)',
          }}
        >
          Skład startowy gotowy. Trening i głębokie systemy odblokują się wraz z kolejnymi meczami.
        </p>
      </RailBlock>
    </aside>
  );
}

function RailBlock({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section
      style={{
        borderTopWidth: 'var(--lf-border-width-hair)',
        borderBottomWidth: 'var(--lf-border-width-hair)',
        borderRightWidth: 'var(--lf-border-width-hair)',
        borderLeftWidth: 'var(--lf-border-width-thick)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        borderLeftColor: 'var(--lf-color-border-gold)',
        background: 'var(--lf-color-bg-panel)',
        borderRadius: 'var(--lf-radius-sm)',
        padding: 'var(--lf-space-3)',
      }}
    >
      {title ? (
        <h2
          className="font-[family-name:var(--font-ui)] font-semibold uppercase"
          style={{
            margin: 0,
            marginBottom: 'var(--lf-space-2)',
            fontSize: 'var(--lf-type-label)',
            letterSpacing: 'var(--lf-type-tracking-label)',
            color: 'var(--lf-color-text-gold)',
          }}
        >
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
