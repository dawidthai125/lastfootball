import { matchLivePath, matchXiPath } from '@/lib/match/match-path';

/** Lineup editor for a match that cannot start with the current XI. */
export function lineupEditorHref(matchId: string): string {
  return matchXiPath(matchId);
}

/** VS skip control: legal XI goes live; a blocked XI goes to the editor. */
export function skipOrLineupLink(input: {
  matchId: string;
  xiBlocked: boolean;
}): { href: string; label: string } {
  if (input.xiBlocked) {
    return { href: lineupEditorHref(input.matchId), label: 'Popraw skład' };
  }
  return { href: matchLivePath(input.matchId), label: 'Pomiń checklistę · Start' };
}
