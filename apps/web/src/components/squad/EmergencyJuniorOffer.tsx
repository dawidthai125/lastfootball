import { EmergencyJunior } from '@/components/squad/EmergencyJunior';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { missingRole } from '@/lib/squad/emergency-junior';
import { listClubPlayers } from '@/lib/squad/get-players';
import { resolveClubSquad } from '@/lib/squad/resolve-club-squad';

/** Nothing when the club can set an eleven, or when the squad cannot be read. */
export async function EmergencyJuniorOffer() {
  const club = await getManagerClub().catch(() => null);
  const rows = club ? await listClubPlayers(club.id).catch(() => null) : null;
  if (!club || !rows?.some((row) => !row.academyTrack)) return null;
  const missing = missingRole(resolveClubSquad(club, rows).players, utcDateString());
  return missing ? <EmergencyJunior keeper={missing.pos === 'BR'} /> : null;
}
