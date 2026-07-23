import Link from 'next/link';
import type { ReactNode } from 'react';

import { ClubCrest } from '@/components/assets';
import { dashboardMock } from '@/data/mock';

/**
 * Right rail — match-day context only (WF / GX / DESIGN-REVIEW-02).
 * Not a second dashboard: no energy/form/training duplicates.
 */
export function RightSidebar() {
  const { nextMatch, injuries, club } = dashboardMock;

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
        Kontekst meczu
      </div>

      <RailBlock>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--lf-space-3)',
          }}
        >
          <ClubCrest shortName={nextMatch.opponentShort} clubName={nextMatch.opponent} size="md" />
          <div style={{ minWidth: 0 }}>
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
              className="truncate font-[family-name:var(--font-ui)] font-semibold"
              style={{
                marginTop: '2px',
                fontSize: 'var(--lf-type-h2)',
                color: 'var(--lf-color-text-primary)',
              }}
            >
              vs {nextMatch.opponent}
            </div>
            <div
              style={{ fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-muted)' }}
            >
              {nextMatch.competition}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 'var(--lf-space-3)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--lf-space-2)',
          }}
        >
          <MetaChip label="Kiedy" value={nextMatch.when} />
          <MetaChip label="Odliczanie" value={nextMatch.countdown} tone="gold" />
          <MetaChip label="Miejsce" value={nextMatch.home ? 'Dom' : 'Wyjazd'} />
          <MetaChip label="Stawka" value={nextMatch.stake} />
        </div>

        <div
          style={{
            marginTop: 'var(--lf-space-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--lf-space-2)',
          }}
        >
          <ClubCrest shortName={club.shortName} clubName={club.name} size="sm" />
          <span style={{ fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-faint)' }}>
            {club.name}
          </span>
        </div>

        <Link
          href="/match/m-next"
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
          }}
        >
          Przygotuj mecz
        </Link>
      </RailBlock>

      <RailBlock title="Gotowość składu">
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--lf-space-1)',
          }}
        >
          {injuries.map((inj) => (
            <li
              key={inj.name}
              style={{
                borderLeftWidth: 'var(--lf-border-width-thick)',
                borderLeftStyle: 'solid',
                borderLeftColor: 'var(--lf-color-status-danger)',
                background: 'var(--lf-color-status-danger-soft)',
                padding: 'var(--lf-space-2)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--lf-type-caption)',
                  fontWeight: 600,
                  color: 'var(--lf-color-text-primary)',
                }}
              >
                {inj.name}
              </div>
              <div
                style={{ fontSize: 'var(--lf-type-label)', color: 'var(--lf-color-status-danger)' }}
              >
                {inj.detail}
              </div>
            </li>
          ))}
        </ul>
      </RailBlock>
    </aside>
  );
}

function MetaChip({ label, value, tone }: { label: string; value: string; tone?: 'gold' }) {
  return (
    <div
      style={{
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        background: 'var(--lf-color-bg-inset)',
        padding: 'var(--lf-space-2)',
        borderRadius: 'var(--lf-radius-sm)',
        minWidth: 0,
      }}
    >
      <div
        className="font-[family-name:var(--font-ui)] font-semibold uppercase"
        style={{
          fontSize: '9px',
          letterSpacing: 'var(--lf-type-tracking-label)',
          color: 'var(--lf-color-text-faint)',
        }}
      >
        {label}
      </div>
      <div
        className="truncate"
        style={{
          marginTop: '2px',
          fontSize: 'var(--lf-type-caption)',
          fontWeight: 600,
          color: tone === 'gold' ? 'var(--lf-color-text-gold)' : 'var(--lf-color-text-secondary)',
        }}
      >
        {value}
      </div>
    </div>
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
