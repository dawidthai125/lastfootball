import { redirect } from 'next/navigation';

import { TrophyCabinet } from '@/components/achievements/TrophyCabinet';
import { AchievementsView } from '@/components/achievements/AchievementsView';
import { resolveClubAchievements } from '@/lib/achievements';
import { loadSeasonHistory } from '@/lib/board/store';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { listClubFixtures } from '@/lib/fixtures';
import { resolveClubRecords } from '@/lib/stats/records';
import {
  loadBestMatch,
  loadClubMatches,
  loadHumanAwards,
  loadPlayerTotals,
} from '@/lib/stats/store';
import { sumByPlayer } from '@/lib/stats/totals';
import { resolveTrophies } from '@/lib/stats/trophies';
import { createClient } from '@/lib/supabase/server';

/**
 * Achievements — fed only by resolveClubAchievements() (LFE-ACHIEVEMENTS-01).
 * Placeholder replaced; Information Thin · derive only · no XP/score.
 */
export default async function AchievementsPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const supabase = await createClient();
  const [fixtures, history, human, matches, totals, bestMatch] = await Promise.all([
    listClubFixtures(club.id),
    loadSeasonHistory(supabase, club.id),
    loadHumanAwards(club.id),
    loadClubMatches(club.id),
    loadPlayerTotals(club.id),
    loadBestMatch(club.id),
  ]);
  const achievements = resolveClubAchievements({ club, fixtures });

  return (
    <AchievementsView achievements={achievements}>
      <TrophyCabinet
        trophies={history ? resolveTrophies({ history, human }) : null}
        records={matches ? resolveClubRecords(matches) : null}
        players={totals ? sumByPlayer(totals) : null}
        bestMatch={bestMatch}
      />
    </AchievementsView>
  );
}
