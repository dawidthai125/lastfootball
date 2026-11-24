import { kickoffBlockReason, type KickoffCompetition } from '@/lib/fixtures/kickoff-gate';

export type CalendarHrefStatus = 'played' | 'upcoming' | 'scheduled' | 'live';

/** Same sentence as the hub kickoff gate. No second copy of the rule. */
export function fixtureKickoffSentence(input: {
  readonly matchesBlocked: boolean;
  readonly competition: KickoffCompetition | null | undefined;
  readonly lastPlayedAt: string | null | undefined;
  readonly lastChallengeAt?: string | null;
  readonly now: Date;
}): string | null {
  return kickoffBlockReason(input);
}

export function playedMatchHref(id: string): string {
  return `/match/${id}`;
}

/**
 * Terminarz row target.
 * Played results stay on /match/{id}. Live stays on /live.
 * An upcoming tunnel opens only when kickoffBlockReason is null for that competition.
 * Scheduled rows never start a match from the list.
 */
export function calendarFixtureHref(input: {
  readonly id: string;
  readonly status: CalendarHrefStatus;
  readonly competition: KickoffCompetition;
  readonly matchesBlocked: boolean;
  readonly lastPlayedAt: string | null | undefined;
  readonly lastChallengeAt?: string | null;
  readonly now: Date;
}): string | null {
  if (input.status === 'played') return playedMatchHref(input.id);
  if (input.status === 'live') return `/match/${input.id}/live`;
  if (input.status !== 'upcoming' && input.status !== 'scheduled') return null;
  const sentence = fixtureKickoffSentence({
    matchesBlocked: input.matchesBlocked,
    competition: input.competition,
    lastPlayedAt: input.lastPlayedAt,
    lastChallengeAt: input.lastChallengeAt,
    now: input.now,
  });
  if (sentence) return null;
  if (input.status === 'upcoming') return `/match/${input.id}/tunnel`;
  return null;
}
