import Link from 'next/link';

import { AtmosphereLayer, ClubCrest } from '@/components/assets';
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
    <AtmosphereLayer
      aria-label="Matchday"
      layers={['floodlight', 'vignette']}
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
          <ClubCrest shortName={homeShort} clubName={homeName} label={homeName} size="md" />
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
          <ClubCrest shortName={awayShort} clubName={awayName} label={awayName} size="md" />
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
    </AtmosphereLayer>
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
