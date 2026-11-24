/**
 * Prestige 0..100 (D131, GDD §6.2 / §6.5 / §26.8). Pure derive from the season history,
 * the current league and completed board tasks. Not a currency; the match engine never reads it.
 */

import type { SeasonHistory } from '@/lib/board/season-history';
import { resolveLeagueTierLabel, type LeagueTier } from '@/lib/league/league-tier';
import { PRESTIGE_START, prestigeSponsorShare } from '@/lib/sponsors/crowd';

const TIER_BASE: Record<LeagueTier, number> = { iv: PRESTIGE_START, iii: 15, ii: 22, i: 30 };
/** A good finish is worth more in a higher league. A bad one costs the same everywhere. */
const TIER_FINISH: Record<LeagueTier, number> = { iv: 1, iii: 1.25, ii: 1.5, i: 2 };
const FINISH_SPAN = 6;
const FINISH_FLOOR = -2;
const PROMOTION = 3;
/** By round reached: 0 out of the draw, 1 = 1/8, 2 = 1/4, 3 = semi, 4 = final, 5 = cup won. */
const CUP_DEPTH = [0, 0, 1, 2, 3, 5] as const;
const TASK = 0.5;
/** Each older season weighs this much less. */
const SEASON_FADE = 0.8;

const BANDS = [
  [80, 'Wielki'],
  [60, 'Ceniony'],
  [40, 'Rozpoznawalny'],
  [20, 'Lokalny'],
] as const;

export type PrestigeSource = {
  readonly label: string;
  readonly points: number;
  readonly pointsLabel: string;
};

export type PrestigeDto = {
  /** Whole number, 0..100. */
  readonly value: number;
  readonly band: string;
  readonly sources: readonly PrestigeSource[];
  /** Added to the sponsor quote at renewal, 0..0.10. */
  readonly sponsorShare: number;
  readonly sponsorLabel: string;
};

export function prestigeBand(value: number): string {
  return BANDS.find(([from]) => value >= from)?.[1] ?? 'Nieznany';
}

/** Share of the table below this place: 1 for the first, 0 for the last. */
function finishPoints(row: SeasonHistory): number {
  const size = Math.max(2, row.tableSize);
  const place = Math.min(size, Math.max(1, row.position));
  const points = FINISH_FLOOR + FINISH_SPAN * ((size - place) / (size - 1));
  return points > 0 ? points * TIER_FINISH[row.leagueTier] : points;
}

function promotionPoints(row: SeasonHistory): number {
  if (row.outcome === 'promote') return PROMOTION;
  return row.outcome === 'relegate' ? -PROMOTION : 0;
}

function cupPoints(row: SeasonHistory): number {
  const round = Math.min(CUP_DEPTH.length - 1, Math.max(0, Math.trunc(row.cupRoundReached)));
  return CUP_DEPTH[round]!;
}

export function resolvePrestige(input: {
  readonly leagueTier: LeagueTier;
  readonly history: readonly SeasonHistory[];
  /** One season number per completed task, any season. */
  readonly completedTaskSeasons: readonly number[];
}): PrestigeDto {
  const latest = Math.max(0, ...input.history.map((row) => row.seasonNumber));
  const weight = (season: number) => SEASON_FADE ** Math.max(0, latest - season);
  const sum = (points: (row: SeasonHistory) => number) =>
    input.history.reduce((total, row) => total + points(row) * weight(row.seasonNumber), 0);

  const parts: readonly (readonly [string, number])[] = [
    [resolveLeagueTierLabel(input.leagueTier), TIER_BASE[input.leagueTier]],
    ['Miejsca w lidze', sum(finishPoints)],
    ['Awanse i spadki', sum(promotionPoints)],
    ['Puchar Krajowy', sum(cupPoints)],
    [
      'Zadania zarządu',
      input.completedTaskSeasons.reduce((total, season) => total + TASK * weight(season), 0),
    ],
  ];
  const exact = Math.min(
    100,
    Math.max(
      0,
      parts.reduce((total, [, points]) => total + points, 0),
    ),
  );
  const value = Math.round(exact);
  const sponsorShare = prestigeSponsorShare(value);
  return {
    value,
    band: prestigeBand(value),
    sources: parts
      .map(([label, points]) => ({ label, points, pointsLabel: signed(points) }))
      .filter((source, i) => i === 0 || Math.abs(source.points) >= 0.05),
    sponsorShare,
    sponsorLabel: `${signed(sponsorShare * 100)}%`,
  };
}

function signed(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const text = Math.abs(rounded).toLocaleString('pl-PL', { maximumFractionDigits: 1 });
  return rounded < 0 ? `−${text}` : `+${text}`;
}
