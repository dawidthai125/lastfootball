'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { LocationHero, Panel, Button } from '@/components/ui';
import { formatMoney } from '@/lib/finance/format-money';
import type { ClubStadiumDto, StadiumAttendanceBand } from '@/lib/stadium';
import { raiseGroundPart, type GroundActionState } from '@/lib/stadium/actions-build';
import {
  STADIUM_UPGRADE_COST,
  stadiumLook,
  stadiumSeatLabel,
  ticketIncome,
  type StadiumLevels,
  type StadiumPart,
} from '@/lib/stadium/levels';
import { UI_COPY } from '@/lib/ui/copy';

const GROUND_INITIAL: GroundActionState = {};

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
function partLevel(levels: StadiumLevels, part: StadiumPart): number {
  if (part === 'stands') return levels.stands;
  if (part === 'pitch') return levels.pitch;
  return levels.trainingCenter;
}

export function StadiumView({
  stadium,
  ground,
  cash = 0,
}: {
  stadium: ClubStadiumDto;
  ground?: StadiumLevels;
  cash?: number;
}) {
  const levels = ground ?? { stands: 0, pitch: 0, trainingCenter: 0 };
  const look = stadiumLook(levels);
  const [buildState, buildAction, buildPending] = useActionState(raiseGroundPart, GROUND_INITIAL);
  const parts: { part: StadiumPart; title: string; detail: string }[] = [
    {
      part: 'stands',
      title: look.stands,
      detail: `Bilety z meczu u siebie przy pełnej frekwencji: ${formatMoney(
        ticketIncome({ standsLevel: levels.stands, attendance: 'lively' }),
      )}`,
    },
    {
      part: 'pitch',
      title: look.pitch,
      detail: 'Murawa daje lekki bonus gospodarzowi. Obaj widzowie meczu biorą poziom domu.',
    },
    {
      part: 'training_center',
      title: look.center,
      detail: 'Ośrodek podnosi limit zawodników, którzy rosną na jednym treningu.',
    },
  ];

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
        <p className="mt-1 text-[12px] text-[var(--lf-muted)]">{stadiumSeatLabel(levels.stands)}</p>
      </header>

      <Panel title="Dom klubu" flush>
        <p className="px-2.5 py-2.5 text-[13px] text-[var(--lf-muted)]">{stadium.identityNote}</p>
      </Panel>

      <div className="mt-3">
        <Panel title="Rozbudowa" flush>
          <div className="space-y-3 px-2.5 py-2.5 text-[13px]">
            {buildState.error ? (
              <p className="text-[12px] text-[var(--lf-danger)]" role="alert">
                {buildState.error}
              </p>
            ) : null}
            {parts.map((item) => {
              const level = partLevel(levels, item.part);
              const cost = level >= 3 ? 0 : (STADIUM_UPGRADE_COST[item.part][level] ?? 0);
              return (
                <div key={item.part} className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[var(--lf-text-strong)]">
                      {item.title} · poziom {level}
                    </p>
                    <p className="text-[12px] text-[var(--lf-muted)]">{item.detail}</p>
                  </div>
                  {level >= 3 ? (
                    <span className="text-[12px] text-[var(--lf-muted)]">Maksimum</span>
                  ) : (
                    <form action={buildAction}>
                      <input type="hidden" name="part" value={item.part} />
                      <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        disabled={buildPending || cash < cost}
                      >
                        {buildPending ? '…' : `Rozbuduj · ${formatMoney(cost)}`}
                      </Button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

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
