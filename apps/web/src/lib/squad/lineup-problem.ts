import { utcDateString } from '@/lib/fixtures/played-unlock';
import { resolveClubSquad } from '@/lib/squad/resolve-club-squad';
import type { PlayerRowDto } from '@/lib/squad/types';
import { validateStartingXi } from '@/lib/squad/validate-starting-xi';

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
