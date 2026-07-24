'use client';

import Link from 'next/link';

import { AtmosphereLayer, ClubCrest } from '@/components/assets';
import { useClubIdentity } from '@/components/club/ClubProvider';
import { sessionChrome, dashboardMock } from '@/data/mock';
import { STARTER_PACKAGE } from '@/lib/club/types';

type ClubHeroProps = {
  club?: typeof dashboardMock.club;
  season?: number;
};

export function ClubHero({
  club = dashboardMock.club,
  season = sessionChrome.season,
}: ClubHeroProps) {
  const live = useClubIdentity({
    name: club.name,
    shortName: club.shortName,
  });

  const stadium = live.isLive ? STARTER_PACKAGE.stadiumLabel(live.name) : club.stadium;
  const division = live.isLive ? STARTER_PACKAGE.league : club.division;

  return (
    <AtmosphereLayer
      aria-label="Club Hero"
      style={{
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        background: 'var(--lf-color-bg-panel)',
        borderRadius: 'var(--lf-radius-sm)',
        padding: 'var(--lf-space-5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--lf-space-4)',
        }}
      >
        <ClubCrest
          shortName={live.shortName}
          clubName={live.name}
          crestTemplateId={live.crestTemplateId}
          accentColor={live.primaryColor}
          size="xl"
        />

        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <p
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              margin: 0,
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-gold)',
            }}
          >
            Siedziba klubu
          </p>
          <h1
            className="font-[family-name:var(--font-ui)] font-bold"
            style={{
              margin: 0,
              marginTop: 'var(--lf-space-1)',
              fontSize: 'var(--lf-type-hero)',
              lineHeight: 1.1,
              color: 'var(--lf-color-text-primary)',
            }}
          >
            {live.name}
          </h1>
          <p
            style={{
              margin: 0,
              marginTop: 'var(--lf-space-2)',
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            {stadium} · {division} · Sezon {season}
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--lf-space-4)',
              marginTop: 'var(--lf-space-3)',
              fontSize: 'var(--lf-type-caption)',
            }}
          >
            <span>
              <span style={{ color: 'var(--lf-color-text-faint)' }}>Reputacja </span>
              <strong
                className="tabular-nums"
                style={{ color: 'var(--lf-color-text-gold)', fontWeight: 600 }}
              >
                {club.reputation}
              </strong>
            </span>
            <span>
              <span style={{ color: 'var(--lf-color-text-faint)' }}>Kibice </span>
              <strong
                className="tabular-nums"
                style={{ color: 'var(--lf-color-text-primary)', fontWeight: 600 }}
              >
                {club.supporters.toLocaleString('pl-PL')}
              </strong>
            </span>
            <span>
              <span style={{ color: 'var(--lf-color-text-faint)' }}>Pozycja </span>
              <strong
                className="tabular-nums"
                style={{ color: 'var(--lf-color-text-primary)', fontWeight: 600 }}
              >
                {club.place}.
              </strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--lf-space-2)', flexShrink: 0 }}>
          <Link
            href="/club"
            style={{
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-strong)',
              background: 'var(--lf-color-bg-panel-alt)',
              color: 'var(--lf-color-text-secondary)',
              fontSize: 'var(--lf-type-caption)',
              padding: 'var(--lf-space-2) var(--lf-space-3)',
              borderRadius: 'var(--lf-radius-sm)',
            }}
          >
            Klub
          </Link>
          <Link
            href="/squad"
            style={{
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-subtle)',
              background: 'transparent',
              color: 'var(--lf-color-text-muted)',
              fontSize: 'var(--lf-type-caption)',
              padding: 'var(--lf-space-2) var(--lf-space-3)',
              borderRadius: 'var(--lf-radius-sm)',
            }}
          >
            Kadra
          </Link>
        </div>
      </div>
    </AtmosphereLayer>
  );
}
