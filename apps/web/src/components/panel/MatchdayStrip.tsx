import Link from 'next/link';

import { dashboardMock } from '@/data/mock';

type MatchdayStripProps = {
  match?: typeof dashboardMock.nextMatch;
  clubName?: string;
  clubShort?: string;
};

export function MatchdayStrip({
  match = dashboardMock.nextMatch,
  clubName = dashboardMock.club.name,
  clubShort = dashboardMock.club.shortName,
}: MatchdayStripProps) {
  const homeName = match.home ? clubName : match.opponent;
  const awayName = match.home ? match.opponent : clubName;
  const homeShort = match.home ? clubShort : match.opponentShort;
  const awayShort = match.home ? match.opponentShort : clubShort;

  return (
    <section
      aria-label="Matchday"
      style={{
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        background: 'var(--lf-color-bg-panel)',
        borderRadius: 'var(--lf-radius-sm)',
        padding: 'var(--lf-space-4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--lf-space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--lf-space-3)', flex: '1 1 280px' }}>
          <CrestInitials initials={homeShort} label={homeName} />
          <div style={{ textAlign: 'center', minWidth: '4rem' }}>
            <div
              className="font-[family-name:var(--font-ui)] font-bold"
              style={{ fontSize: 'var(--lf-type-h1)', color: 'var(--lf-color-text-gold)' }}
            >
              VS
            </div>
            <div
              className="tabular-nums"
              style={{ fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-faint)' }}
            >
              {match.countdown}
            </div>
          </div>
          <CrestInitials initials={awayShort} label={awayName} />
        </div>

        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <p
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              margin: 0,
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-status-warn)',
            }}
          >
            {match.when}
          </p>
          <p
            className="font-[family-name:var(--font-ui)] font-semibold"
            style={{
              margin: 0,
              marginTop: 'var(--lf-space-1)',
              fontSize: 'var(--lf-type-h2)',
              color: 'var(--lf-color-text-primary)',
            }}
          >
            {homeName} — {awayName}
          </p>
          <p
            style={{
              margin: 0,
              marginTop: 'var(--lf-space-1)',
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            {match.competition} · {match.stake} · {match.home ? 'Dom' : 'Wyjazd'}
          </p>
        </div>

        <QuickActions />
      </div>
    </section>
  );
}

function CrestInitials({ initials, label }: { initials: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        className="font-[family-name:var(--font-ui)] font-bold"
        title={label}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'var(--lf-space-8)',
          height: 'var(--lf-space-8)',
          marginInline: 'auto',
          background: 'var(--lf-color-bg-inset)',
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-subtle)',
          color: 'var(--lf-color-text-primary)',
          fontSize: 'var(--lf-type-table)',
          borderRadius: 'var(--lf-radius-sm)',
        }}
      >
        {initials}
      </div>
      <div
        style={{
          marginTop: 'var(--lf-space-1)',
          maxWidth: '7rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 'var(--lf-type-label)',
          color: 'var(--lf-color-text-muted)',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function QuickActions() {
  return (
    <div
      aria-label="Quick Actions"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--lf-space-2)', flexShrink: 0 }}
    >
      <Link
        href="/match/m-next"
        style={{
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-gold)',
          background: 'var(--lf-color-gold-soft)',
          color: 'var(--lf-color-gold-base)',
          fontSize: 'var(--lf-type-body)',
          fontWeight: 600,
          padding: 'var(--lf-space-2) var(--lf-space-4)',
          borderRadius: 'var(--lf-radius-sm)',
        }}
      >
        Przygotuj mecz
      </Link>
      <Link
        href="/training"
        style={{
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-strong)',
          background: 'var(--lf-color-bg-panel-alt)',
          color: 'var(--lf-color-text-secondary)',
          fontSize: 'var(--lf-type-body)',
          padding: 'var(--lf-space-2) var(--lf-space-4)',
          borderRadius: 'var(--lf-radius-sm)',
        }}
      >
        Trening
      </Link>
    </div>
  );
}
