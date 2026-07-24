import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

import { PreMatchView } from '@/components/match/PreMatchView';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { buildFirstPreMatchBundle } from '@/lib/first-match/bundles';
import { FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { buildLeaguePreMatchBundle, getFixtureByIdForClub } from '@/lib/fixtures';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PreMatchPage({ params }: PageProps) {
  const { id } = await params;

  if (id === FIRST_MATCH_ID) {
    const club = await getManagerClub();
    if (!club) redirect('/welcome');
    if (isFirstMatchCompleted(club)) redirect('/hub');
    return <PreMatchView bundle={buildFirstPreMatchBundle(club)} firstMatch />;
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

  return <PreMatchView bundle={buildLeaguePreMatchBundle(club, dto)} />;
}
