import { utcDateString } from '@/lib/fixtures/played-unlock';
import { resolveClubSquad } from '@/lib/squad/resolve-club-squad';
import type { PlayerRowDto } from '@/lib/squad/types';
import {
  pickBestXi,
  replaceUnavailableStarters,
  validateStartingXi,
} from '@/lib/squad/validate-starting-xi';

/**
 * Full XI rules on stored rows: loans, call-ups, keeper, bans. The save action checks them
 * too, but `starter` is open to the player session, so every official match checks again.
 */
export function lineupProblem(
  clubId: string,
  rows: readonly PlayerRowDto[],
  today: string = utcDateString(),
): string | null {
  const starters = resolveClubSquad({ id: clubId }, rows).players.filter((p) => p.starter);
  return validateStartingXi(starters, today).errors[0] ?? null;
}

/**
 * The same squad with a line-up that may play: the manager's XI without the unavailable, or the
 * best eleven when that is not enough. For matches another club waits for; nothing is saved.
 */
export function repairLineup(
  clubId: string,
  rows: readonly PlayerRowDto[],
  today: string = utcDateString(),
): PlayerRowDto[] {
  if (!lineupProblem(clubId, rows, today)) return [...rows];
  const squad = resolveClubSquad({ id: clubId }, rows).players;
  for (const players of [replaceUnavailableStarters(squad, today), pickBestXi(squad, today)]) {
    const starters = new Set(players.filter((p) => p.starter).map((p) => p.id));
    const fixed = rows.map((row) => ({ ...row, starter: starters.has(row.id) }));
    if (!lineupProblem(clubId, fixed, today)) return fixed;
  }
  return [...rows];
}
