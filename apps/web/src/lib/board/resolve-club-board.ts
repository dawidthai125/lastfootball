/**
 * LFE-BOARD-01 — Board Information Thin (D102–D108).
 * Pure derive only — no persist, no Server Actions, no Prestige engine.
 */

import { formatSeasonLabel, type ClubSeasonPhase, type SeasonReportDto } from '@/lib/season/types';

export type BoardTone = 'positive' | 'neutral' | 'concern';

/** Qualitative standing signal — not a completion flag (Owner LOCK 8). */
export type BoardStandingTrend = 'rising' | 'steady' | 'slipping' | 'unknown';

export type ClubBoardDto = {
  readonly seasonLabel: string;
  readonly phaseLabel: string;
  readonly expectation: {
    readonly label: string;
    readonly summary: string;
  };
  readonly standing: {
    readonly position: number | null;
    readonly played: number;
    readonly tableSize: number;
    readonly progressLabel: string;
    readonly trend: BoardStandingTrend;
  };
  readonly seasonReview: {
    readonly available: true;
    readonly outcomeLabel: string;
    readonly summary: string;
  } | null;
  readonly tone: BoardTone;
  /** Offseason: Confirm is not blocked by Board. */
  readonly hubHint: string | null;
};

export type ResolveClubBoardInput = {
  readonly seasonPhase: ClubSeasonPhase;
  readonly seasonNumber: number;
  readonly playerPosition: number | null;
  readonly tableSize: number;
  readonly playedCount: number;
  readonly seasonReport: SeasonReportDto | null;
};

const EXPECTATION = {
  label: 'Oczekiwanie władz',
  summary:
    'Sezon ma być czytelny i godny klubu — solidna ligowa postawa bez dramatu. To opis kierunku, nie zadanie do odhaczenia.',
} as const;

function resolveTrend(position: number | null, tableSize: number): BoardStandingTrend {
  if (position == null || tableSize < 1) return 'unknown';
  const size = Math.max(1, Math.trunc(tableSize));
  const pos = Math.trunc(position);
  if (pos < 1 || pos > size) return 'unknown';
  const third = Math.max(1, Math.ceil(size / 3));
  if (pos <= third) return 'rising';
  if (pos > size - third) return 'slipping';
  return 'steady';
}

function trendLabel(trend: BoardStandingTrend, position: number | null): string {
  if (position == null) return 'Pozycja: —';
  switch (trend) {
    case 'rising':
      return `Miejsce ${position} · trend: w górę tabeli`;
    case 'slipping':
      return `Miejsce ${position} · trend: pod presją`;
    case 'steady':
      return `Miejsce ${position} · trend: stabilnie`;
    default:
      return `Miejsce ${position}`;
  }
}

function resolveTone(
  seasonPhase: ClubSeasonPhase,
  trend: BoardStandingTrend,
  report: SeasonReportDto | null,
): BoardTone {
  if (seasonPhase === 'offseason' && report) {
    if (report.zone === 'top' || report.zone === 'upper_mid') return 'positive';
    if (report.zone === 'bottom') return 'concern';
    return 'neutral';
  }
  if (trend === 'rising') return 'positive';
  if (trend === 'slipping') return 'concern';
  return 'neutral';
}

/**
 * Sole UI DTO for Board (D102 · D103 · D108).
 * Information Thin — describe season facts; never mutate.
 */
export function resolveClubBoard(input: ResolveClubBoardInput): ClubBoardDto {
  const { seasonPhase, seasonNumber, playerPosition, tableSize, playedCount, seasonReport } = input;

  const size = Math.max(0, Math.trunc(tableSize));
  const played = Math.max(0, Math.trunc(playedCount));
  const trend = resolveTrend(playerPosition, size);
  const tone = resolveTone(seasonPhase, trend, seasonReport);
  const offseason = seasonPhase === 'offseason';

  const seasonReview =
    offseason && seasonReport
      ? {
          available: true as const,
          outcomeLabel: seasonReport.promotionLabel
            ? `${seasonReport.zoneLabel} · ${seasonReport.promotionLabel}`
            : seasonReport.zoneLabel,
          summary: `Sezon zamknięty na miejscu ${seasonReport.position}/${seasonReport.tableSize} (${seasonReport.points} pkt). To odczyt faktów — nie ocena do „zaliczenia”.`,
        }
      : null;

  return {
    seasonLabel: formatSeasonLabel(seasonNumber),
    phaseLabel: offseason ? 'Przerwa międzysezonowa' : 'Sezon w toku',
    expectation: {
      label: EXPECTATION.label,
      summary: EXPECTATION.summary,
    },
    standing: {
      position: playerPosition,
      played,
      tableSize: size,
      progressLabel: trendLabel(trend, playerPosition),
      trend,
    },
    seasonReview,
    tone,
    hubHint: offseason
      ? 'Start kolejnego sezonu potwierdzasz na Hubie — Zarząd go nie blokuje.'
      : null,
  };
}
