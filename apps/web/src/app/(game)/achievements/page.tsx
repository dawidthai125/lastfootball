import { redirect } from 'next/navigation';

import { AchievementsView } from '@/components/achievements/AchievementsView';
import { resolveClubAchievements } from '@/lib/achievements';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { listClubFixtures } from '@/lib/fixtures';

/**
 * Achievements — fed only by resolveClubAchievements() (LFE-ACHIEVEMENTS-01).
 * Placeholder replaced; Information Thin · derive only · no XP/score.
 */
export default async function AchievementsPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const fixtures = await listClubFixtures(club.id);
  const achievements = resolveClubAchievements({ club, fixtures });

  return <AchievementsView achievements={achievements} />;
}
