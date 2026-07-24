import { redirect } from 'next/navigation';

import { SquadView } from '@/components/squad/SquadView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { resolveClubSquad } from '@/lib/squad';

export default async function SquadPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');
  const squad = resolveClubSquad(club);
  return <SquadView players={squad.players} />;
}
