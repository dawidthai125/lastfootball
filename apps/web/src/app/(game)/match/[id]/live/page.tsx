import { notFound, redirect } from 'next/navigation';

import { LiveMatchFoundation } from '@/components/match/LiveMatchFoundation';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { buildFirstLiveBundle } from '@/lib/first-match/bundles';
import { FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { buildLeagueLiveBundle, getFixtureByIdForClub } from '@/lib/fixtures';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LiveMatchPage({ params }: PageProps) {
  const { id } = await params;

  if (id === FIRST_MATCH_ID) {
    const club = await getManagerClub();
    if (!club) redirect('/welcome');
    if (isFirstMatchCompleted(club)) redirect('/hub');
    return <LiveMatchFoundation bundle={buildFirstLiveBundle(club)} club={club} firstMatch />;
  }

  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const dto = await getFixtureByIdForClub(club.id, id);
  if (!dto) notFound();
  if (dto.status === 'played') redirect('/hub');
  if (dto.status !== 'upcoming') redirect('/hub');

  return (
    <LiveMatchFoundation
      bundle={buildLeagueLiveBundle(club, dto)}
      club={club}
      leagueFixture={dto}
    />
  );
}
