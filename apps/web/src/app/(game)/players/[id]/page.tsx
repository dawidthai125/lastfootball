import { notFound, redirect } from 'next/navigation';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  PlayerActions,
  PlayerAttributes,
  PlayerContract,
  PlayerHero,
  PlayerHistory,
  PlayerStatus,
} from '@/components/squad/PlayerDetail';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { getSquadPlayerById, resolveClubSquad, SquadUnavailableError } from '@/lib/squad';
import { listClubPlayers } from '@/lib/squad/get-players';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlayerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const rows = await listClubPlayers(club.id);
  let player;
  try {
    const squad = resolveClubSquad(club, rows);
    player = getSquadPlayerById(squad, id);
  } catch (e) {
    if (e instanceof SquadUnavailableError) notFound();
    throw e;
  }
  if (!player) notFound();

  return (
    <div className="lf-sq-detail" data-pti="PTI-01-SQD-03-M" data-lf-impl="LFE-UI-IMPL-01">
      <Breadcrumbs
        items={[
          { label: 'Klub', href: '/club' },
          { label: 'Kadra', href: '/squad' },
          { label: player.name },
        ]}
      />

      {/* M4: Hero → decyzja → status → atrybuty → kontekst */}
      <PlayerHero player={player} />
      <PlayerActions player={player} />
      <PlayerStatus player={player} />
      <PlayerAttributes player={player} />
      <div className="lf-sq-detail__context">
        <PlayerContract player={player} />
        <PlayerHistory player={player} />
      </div>
    </div>
  );
}
