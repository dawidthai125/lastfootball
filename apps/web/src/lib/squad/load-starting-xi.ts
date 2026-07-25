import type { ClubDto } from '@/lib/club/types';
import { listClubPlayers } from '@/lib/squad/get-players';
import { resolveStartingXi } from '@/lib/squad/resolve-club-squad';
import type { RosterPlayerSeed } from '@/lib/squad/seed-roster';
import { SquadUnavailableError } from '@/lib/squad/types';

/** Load DB roster and resolve XI for match path. Throws SquadUnavailableError if empty/incomplete. */
export async function loadClubStartingXi(
  club: Pick<ClubDto, 'id'>,
): Promise<readonly RosterPlayerSeed[]> {
  const rows = await listClubPlayers(club.id);
  return resolveStartingXi(rows);
}

export { SquadUnavailableError };
