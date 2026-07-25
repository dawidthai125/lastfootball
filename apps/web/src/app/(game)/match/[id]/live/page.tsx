import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

import { LiveMatchFoundation } from '@/components/match/LiveMatchFoundation';
import { Panel } from '@/components/ui/Panel';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { buildFirstLiveBundle } from '@/lib/first-match/bundles';
import { FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { buildLeagueLiveBundle, getFixtureByIdForClub } from '@/lib/fixtures';
import { loadClubStartingXi, SquadUnavailableError } from '@/lib/squad/load-starting-xi';

type PageProps = {
  params: Promise<{ id: string }>;
};

function SquadError() {
  return (
    <Panel title="Kadra niedostępna">
      <p style={{ margin: 0, color: 'var(--lf-color-text-muted)' }}>
        Nie można rozpocząć meczu — brak składu w bazie.{' '}
        <Link href="/squad" style={{ color: 'var(--lf-color-text-gold)' }}>
          Kadra
        </Link>
      </p>
    </Panel>
  );
}

export default async function LiveMatchPage({ params }: PageProps) {
  const { id } = await params;

  if (id === FIRST_MATCH_ID) {
    const club = await getManagerClub();
    if (!club) redirect('/welcome');
    if (isFirstMatchCompleted(club)) redirect('/hub');
    try {
      const ourXi = await loadClubStartingXi(club);
      return (
        <LiveMatchFoundation
          bundle={buildFirstLiveBundle(club)}
          club={club}
          firstMatch
          ourXi={ourXi}
        />
      );
    } catch (e) {
      if (e instanceof SquadUnavailableError) return <SquadError />;
      throw e;
    }
  }

  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const dto = await getFixtureByIdForClub(club.id, id);
  if (!dto) notFound();
  if (dto.status === 'played') redirect('/hub');
  if (dto.status !== 'upcoming') redirect('/hub');

  try {
    const ourXi = await loadClubStartingXi(club);
    return (
      <LiveMatchFoundation
        bundle={buildLeagueLiveBundle(club, dto)}
        club={club}
        leagueFixture={dto}
        ourXi={ourXi}
      />
    );
  } catch (e) {
    if (e instanceof SquadUnavailableError) return <SquadError />;
    throw e;
  }
}
