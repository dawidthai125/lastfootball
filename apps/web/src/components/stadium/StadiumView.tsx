import Link from 'next/link';

import { LocationHero, Panel } from '@/components/ui';
import type { ClubStadiumDto, StadiumAttendanceBand } from '@/lib/stadium';
import { UI_COPY } from '@/lib/ui/copy';

function bandCaption(band: StadiumAttendanceBand): string {
  switch (band) {
    case 'lively':
      return 'Pasmo: żywe';
    case 'steady':
      return 'Pasmo: solidne';
    case 'quiet':
      return 'Pasmo: ciche';
    default:
      return 'Pasmo: nieznane';
  }
}

/**
 * Stadium Experience — LFE-STADIUM-01 Information Thin.
 * Domain only via resolveClubStadium (D109 · D110). No actions / tickets.
 */
export function StadiumView({ stadium }: { stadium: ClubStadiumDto }) {
  return (
    <div
      className="lf-sta"
      data-lf-impl="LFE-STADIUM-01"
      data-stadium-attendance={stadium.attendance.band}
    >
      <LocationHero waId="HERO-003" src="/assets/world-art/hero-003-pitch-night.png" priority />

      <header className="mb-3 px-0.5">
        <p className="text-[11px] tracking-wide text-[var(--lf-muted)] uppercase">Stadion</p>
        <h1 className="font-[family-name:var(--font-display)] text-[1.25rem] text-[var(--lf-text-strong)]">
          {stadium.name}
        </h1>
        <p className="mt-1 text-[12px] text-[var(--lf-muted)]">{stadium.capacityLabel}</p>
      </header>

      <Panel title="Dom klubu" flush>
        <p className="px-2.5 py-2.5 text-[13px] text-[var(--lf-muted)]">{stadium.identityNote}</p>
      </Panel>

      <div className="mt-3">
        <Panel title="Frekwencja (jakościowa)" flush>
          <div className="space-y-1 px-2.5 py-2.5 text-[13px]">
            <p className="text-[var(--lf-text-strong)]">{stadium.attendance.label}</p>
            <p className="text-[12px] text-[var(--lf-muted)]">
              {bandCaption(stadium.attendance.band)}
            </p>
            <p className="text-[12px] text-[var(--lf-muted)]">{stadium.attendance.summary}</p>
          </div>
        </Panel>
      </div>

      {stadium.hubHint ? (
        <p className="mt-3 text-[12px] text-[var(--lf-faint)]">{stadium.hubHint}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/hub"
          className="text-[13px] text-[var(--lf-color-accent)] underline-offset-2 hover:underline"
        >
          {UI_COPY.hubExit}
        </Link>
        <Link
          href="/finance"
          className="text-[13px] text-[var(--lf-muted)] underline-offset-2 hover:underline"
        >
          Finanse
        </Link>
      </div>
    </div>
  );
}
