import { redirect } from 'next/navigation';

import { EarlyClubHub } from '@/components/hub/EarlyClubHub';
import { getManagerClub } from '@/lib/club/get-manager-club';
import {
  countPlayedInList,
  ensureClubFixtures,
  getLastPlayedFixture,
  getNextFixture,
  hasPlayedUnlock,
  utcDateString,
} from '@/lib/fixtures';
import { FIRST_MATCH_PATHS } from '@/lib/first-match/constants';
import { resolveCashChipLabel, resolveClubFinance } from '@/lib/finance';
import { listClubFinanceMovements } from '@/lib/finance/get-movements';
import { resolveHubPhase } from '@/lib/hub';
import { resolveLeagueTable, resolvePlayerLeaguePositionLabel } from '@/lib/league';
import { closeSeasonIfComplete, resolveSeasonReport } from '@/lib/season';
import { TRAINING_THIN } from '@/lib/training';

/**
 * Hub / Panel menedżera — decision screen (EARLY_CLUB / SEASON / OFFSEASON).
 */
export default async function HubPage() {
  let club = await getManagerClub();
  if (!club) redirect('/welcome');

  let fixtures = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });

  // Recovery path: trigger met but phase not yet closed (AC-10 consistency).
  if (club.seasonPhase === 'in_season') {
    const closed = await closeSeasonIfComplete(club.id, fixtures);
    if (closed) {
      club = (await getManagerClub()) ?? club;
      fixtures = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
    }
  }

  const hasFixtures = fixtures.length > 0;
  const phase = resolveHubPhase(club, { hasFixtures });
  if (phase === 'NEW_CLUB') redirect(FIRST_MATCH_PATHS.intro);

  const nextFixture = phase === 'OFFSEASON' ? null : ((await getNextFixture(club.id)) ?? null);
  const lastPlayed = (await getLastPlayedFixture(club.id)) ?? null;
  const table = resolveLeagueTable(club, fixtures);
  const leaguePositionLabel = hasFixtures ? resolvePlayerLeaguePositionLabel(table) : null;
  const seasonReport =
    phase === 'OFFSEASON' ? resolveSeasonReport(table, club.seasonNumber, club.leagueTier) : null;

  const movements = await listClubFinanceMovements(club.id, 5);
  const finance = resolveClubFinance(club, movements);
  const cashLabel =
    phase === 'SEASON' || phase === 'OFFSEASON' ? resolveCashChipLabel(finance) : null;
  const trainingUnlocked = hasPlayedUnlock(
    countPlayedInList(fixtures),
    TRAINING_THIN.UNLOCK_AFTER_PLAYED,
  );

  return (
    <EarlyClubHub
      club={club}
      nextFixture={nextFixture}
      lastPlayedFixture={lastPlayed}
      hasFixtures={hasFixtures}
      leaguePositionLabel={leaguePositionLabel}
      cashLabel={cashLabel}
      trainingUnlocked={trainingUnlocked}
      todayUtc={utcDateString()}
      seasonReport={seasonReport}
    />
  );
}
