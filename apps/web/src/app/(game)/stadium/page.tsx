import { redirect } from 'next/navigation';

import { StadiumView } from '@/components/stadium/StadiumView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { ensureClubFixtures } from '@/lib/fixtures';
import type { FixtureDto } from '@/lib/fixtures/types';
import { resolveClubStadium, type HomeMatchOutcome } from '@/lib/stadium';

function homeOutcome(fixture: FixtureDto): HomeMatchOutcome | null {
  if (fixture.homeScore == null || fixture.awayScore == null) return null;
  const home = fixture.homeScore;
  const away = fixture.awayScore;
  if (home > away) return 'win';
  if (home < away) return 'loss';
  return 'draw';
}

/**
 * Stadium — fed only by resolveClubStadium() (LFE-STADIUM-01 · D109).
 * Information Thin — no Server Actions / no persist / no tickets (D110 · D112).
 */
export default async function StadiumPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const fixtures = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
  const homePlayed = fixtures
    .filter((f) => f.isHome && f.status === 'played')
    .sort((a, b) => {
      const aT = a.playedAt ?? '';
      const bT = b.playedAt ?? '';
      if (aT !== bT) return aT < bT ? 1 : -1;
      return b.matchday - a.matchday;
    });
  const lastHome = homePlayed[0] ?? null;

  const stadium = resolveClubStadium({
    clubName: club.name,
    seasonPhase: club.seasonPhase,
    lastHomeOutcome: lastHome ? homeOutcome(lastHome) : null,
    homePlayedCount: homePlayed.length,
  });

  return <StadiumView stadium={stadium} />;
}
