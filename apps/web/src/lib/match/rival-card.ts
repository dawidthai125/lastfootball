import { clubStyleSentence } from '@/lib/training/style';

/** Finished meeting already stored on a club fixture. Scores are home:away. */
export type RivalResultFact = {
  readonly homeScore: number;
  readonly awayScore: number;
  /** True when the viewer's club was at home. */
  readonly isHome: boolean;
};

export type RivalMeetingFact = {
  readonly opponentClubId: string;
  readonly status: string;
  readonly matchday: number;
  readonly playedAt: string | null;
  readonly isHome: boolean;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
};

/**
 * Facts the versus card may print. Null form means no opponent player rows.
 * A style column is null when that habit is not on the opponent club row.
 */
export type RivalCardInput = {
  readonly last: RivalResultFact | null;
  readonly starterForms: readonly number[] | null;
  readonly stylePressing: number | null;
  readonly styleTempo: number | null;
  readonly styleWidth: number | null;
};

function isFiniteNumber(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Latest finished fixture against this opponent. Unplayed rows do not count. */
export function lastRivalResult(
  fixtures: readonly RivalMeetingFact[],
  opponentClubId: string,
): RivalResultFact | null {
  const played = fixtures.filter(
    (fixture) =>
      fixture.opponentClubId === opponentClubId &&
      fixture.status === 'played' &&
      isFiniteNumber(fixture.homeScore) &&
      isFiniteNumber(fixture.awayScore),
  );
  if (played.length === 0) return null;
  const last = played.slice().sort((a, b) => {
    const byTime = (b.playedAt ?? '').localeCompare(a.playedAt ?? '');
    if (byTime !== 0) return byTime;
    return b.matchday - a.matchday;
  })[0];
  if (!last || !isFiniteNumber(last.homeScore) || !isFiniteNumber(last.awayScore)) return null;
  return { homeScore: last.homeScore, awayScore: last.awayScore, isHome: last.isHome };
}

/** Polish lines for the compact Rywal block. Omits form and style when unread. */
export function buildRivalCardLines(input: RivalCardInput): readonly string[] {
  const lines: string[] = [];
  if (input.last == null) {
    lines.push('Pierwszy mecz w tym sezonie');
  } else {
    const place = input.last.isHome ? 'U siebie' : 'Wyjazd';
    lines.push(`${input.last.homeScore}:${input.last.awayScore} · ${place}`);
  }

  const forms = (input.starterForms ?? []).filter((form) => Number.isFinite(form));
  if (input.starterForms != null && forms.length > 0) {
    const total = forms.reduce((sum, form) => sum + form, 0);
    lines.push(`Forma ${Math.round(total / forms.length)}`);
  }

  if (
    isFiniteNumber(input.stylePressing) &&
    isFiniteNumber(input.styleTempo) &&
    isFiniteNumber(input.styleWidth)
  ) {
    lines.push(clubStyleSentence(input.stylePressing, input.styleTempo, input.styleWidth));
  }

  return lines;
}
