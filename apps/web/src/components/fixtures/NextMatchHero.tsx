import Link from 'next/link';

import { AtmosphereLayer } from '@/components/assets';
import type { Fixture } from '@/data/fixtures';

type NextMatchHeroProps = {
  fixture: Fixture;
  clubName: string;
  clubShortName: string;
};

export function NextMatchHero({ fixture, clubName, clubShortName }: NextMatchHeroProps) {
  const homeName = fixture.home ? clubName : fixture.opponent;
  const awayName = fixture.home ? fixture.opponent : clubName;
  const homeShort = fixture.home ? clubShortName : fixture.opponentShort;
  const awayShort = fixture.home ? fixture.opponentShort : clubShortName;

  return (
    <AtmosphereLayer
      aria-label="Następny mecz"
      style={{
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        background: 'var(--lf-color-bg-panel)',
        borderRadius: 'var(--lf-radius-sm)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--lf-space-4)',
          padding: 'var(--lf-space-5)',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              margin: 0,
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-gold)',
            }}
          >
            Następny mecz
          </p>
          <h2
            className="font-[family-name:var(--font-ui)] font-bold"
            style={{
              margin: 0,
              marginTop: 'var(--lf-space-1)',
              fontSize: 'var(--lf-type-h2)',
              color: 'var(--lf-color-text-primary)',
            }}
          >
            {homeShort} vs {awayShort}
          </h2>
          <p
            style={{
              margin: 0,
              marginTop: 'var(--lf-space-1)',
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            {homeName} · {awayName} · {fixture.competitionLabel} · {fixture.stadium}
          </p>
        </div>
        {fixture.status === 'upcoming' || fixture.status === 'scheduled' ? (
          <Link
            href={`/match/${fixture.id}`}
            className="font-[family-name:var(--font-ui)] font-semibold"
            style={{
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-gold)',
              background: 'var(--lf-color-gold-soft)',
              color: 'var(--lf-color-gold-base)',
              fontSize: 'var(--lf-type-body)',
              padding: 'var(--lf-space-2) var(--lf-space-4)',
              borderRadius: 'var(--lf-radius-sm)',
              textDecoration: 'none',
            }}
          >
            Przygotuj mecz
          </Link>
        ) : null}
      </div>
    </AtmosphereLayer>
  );
}
