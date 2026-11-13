import { redirect } from 'next/navigation';

import { CupBracket } from '@/components/cup/CupBracket';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { ensurePlayerCupTie } from '@/lib/cup/ensure-cup-tie';
import { resolveNationalCup } from '@/lib/cup';
import { ensureClubFixtures } from '@/lib/fixtures';

/** National cup. The bracket used to live only on /league, so /cup was a 404. */
export default async function CupPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const seeded = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
  const fixtures = await ensurePlayerCupTie(club, seeded);
  const cup = resolveNationalCup(club, fixtures);
  const playable = cup.playerTie?.due
    ? fixtures.find(
        (f) =>
          f.competition === 'cup' &&
          f.matchday === cup.playerTie?.matchday &&
          f.status !== 'played',
      )
    : null;

  return (
    <div>
      <SectionHeader title="Puchar Krajowy" subtitle={cup.seasonLabel} />
      <CupBracket cup={cup} playFixtureId={playable?.id ?? null} />
    </div>
  );
}
