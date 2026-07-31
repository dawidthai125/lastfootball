'use client';

import { ClubCrest } from '@/components/assets';
import { useClub, useHasFixtures } from '@/components/club/ClubProvider';
import { STARTER_PACKAGE } from '@/lib/club/types';
import { resolveHubPhase, type HubPhase } from '@/lib/hub';

function phaseLabel(phase: HubPhase): string {
  if (phase === 'SEASON') return 'Sezon';
  if (phase === 'OFFSEASON') return 'Przerwa';
  if (phase === 'EARLY_CLUB' || phase === 'NEW_CLUB') return 'Start';
  return 'Klub';
}

/**
 * Right rail slim — LFE-UI-EVOLUTION-01B: tożsamość + jeden kontekst, bez CTA / KPI.
 */
export function RightSidebar() {
  const club = useClub();
  const hasFixtures = useHasFixtures();
  const phase = resolveHubPhase(club, { hasFixtures });
  const decision =
    phase === 'EARLY_CLUB' || phase === 'NEW_CLUB' || phase === 'SEASON' || phase === 'OFFSEASON';

  if (!decision || !club) {
    return (
      <aside
        className="flex h-full flex-col"
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

  const contextLine =
    phase === 'SEASON'
      ? `${STARTER_PACKAGE.league} · prowadzisz sezon`
      : `${STARTER_PACKAGE.league} · poznaj skład i wróć na boisko`;

  return (
    <aside
      className="flex h-full flex-col"
      style={{
        width: '100%',
        background: 'var(--lf-color-bg-raised)',
        padding: 'var(--lf-space-3)',
        gap: 'var(--lf-space-3)',
      }}
      aria-label="Kontekst klubu"
    >
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
            className="truncate font-[family-name:var(--font-ui)] font-semibold"
            style={{
              fontSize: 'var(--lf-type-h2)',
              color: 'var(--lf-color-text-primary)',
            }}
          >
            {club.name}
          </div>
          <div
            className="font-[family-name:var(--font-ui)] uppercase"
            style={{
              marginTop: '2px',
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-faint)',
            }}
          >
            {phaseLabel(phase)}
          </div>
        </div>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 'var(--lf-type-caption)',
          lineHeight: 1.45,
          color: 'var(--lf-color-text-muted)',
        }}
      >
        {contextLine}
      </p>
    </aside>
  );
}
