import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

import { PreMatchView } from '@/components/match/PreMatchView';
import { Panel } from '@/components/ui/Panel';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { buildFirstPreMatchBundle } from '@/lib/first-match/bundles';
import { FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { buildLeaguePreMatchBundle, getFixtureByIdForClub } from '@/lib/fixtures';
import { loadClubStartingXi, SquadUnavailableError } from '@/lib/squad/load-starting-xi';

type PageProps = {
  params: Promise<{ id: string }>;
};

function SquadError({ detail }: { detail?: string }) {
  return (
    <Panel title="Kadra niedostępna">
      <p style={{ margin: 0, color: 'var(--lf-color-text-muted)' }}>
        {detail ?? 'Nie można przygotować meczu — brak składu w bazie.'} Wróć do{' '}
        <Link href="/squad" style={{ color: 'var(--lf-color-text-gold)' }}>
          kadry
        </Link>{' '}
        lub popraw XI przed meczem.
      </p>
    </Panel>
  );
}

export default async function PreMatchPage({ params }: PageProps) {
  const { id } = await params;

  if (id === FIRST_MATCH_ID) {
    const club = await getManagerClub();
    if (!club) redirect('/welcome');
    if (isFirstMatchCompleted(club)) redirect('/hub');
    try {
      const ourXi = await loadClubStartingXi(club);
      return <PreMatchView bundle={buildFirstPreMatchBundle(club, ourXi)} firstMatch />;
    } catch (e) {
      if (e instanceof SquadUnavailableError) return <SquadError detail={e.message} />;
      throw e;
    }
  }

  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const dto = await getFixtureByIdForClub(club.id, id);
  if (!dto) notFound();

  if (dto.status === 'played') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-3)' }}>
        <h1
          className="font-[family-name:var(--font-ui)] font-semibold"
          style={{
            margin: 0,
            fontSize: 'var(--lf-type-h1)',
            color: 'var(--lf-color-text-primary)',
          }}
        >
          Mecz zakończony
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--lf-type-body)',
            color: 'var(--lf-color-text-muted)',
          }}
        >
          {dto.opponent.name} ·{' '}
          {dto.homeScore != null && dto.awayScore != null
            ? `${dto.homeScore}:${dto.awayScore}`
            : '—'}
        </p>
        <Link
          href="/hub"
          style={{ color: 'var(--lf-color-text-gold)', fontSize: 'var(--lf-type-caption)' }}
        >
          ← Hub
        </Link>
      </div>
    );
  }

  if (dto.status !== 'upcoming') {
    redirect('/hub');
  }

  try {
    const ourXi = await loadClubStartingXi(club);
    return <PreMatchView bundle={buildLeaguePreMatchBundle(club, dto, ourXi)} />;
  } catch (e) {
    if (e instanceof SquadUnavailableError) return <SquadError detail={e.message} />;
    throw e;
  }
}
