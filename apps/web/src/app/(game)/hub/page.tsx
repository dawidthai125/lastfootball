import { redirect } from 'next/navigation';

import { EarlyClubHub } from '@/components/hub/EarlyClubHub';
import { loadEmailGate } from '@/lib/auth/email-confirm';
import { fanMoodLabel } from '@/lib/club/fans';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { createClient } from '@/lib/supabase/server';
import { latestPlayedAt } from '@/lib/fixtures/kickoff-gate';
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
import { ensurePlayerCupTie } from '@/lib/cup/ensure-cup-tie';
import { resolveNationalCup } from '@/lib/cup';
import { resolveHubCupLink } from '@/lib/hub/cup-link';
import { resolveLeagueTable, resolvePlayerLeaguePositionLabel } from '@/lib/league';
import { closeSeasonIfComplete, resolveDeparturePreview, resolveSeasonReport } from '@/lib/season';
import { listClubPlayers } from '@/lib/squad/get-players';
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

  const [movements, emailGate, offseasonPlayers] = await Promise.all([
    listClubFinanceMovements(club.id, 5),
    loadEmailGate(club.ownerId),
    phase === 'OFFSEASON' ? listClubPlayers(club.id) : Promise.resolve([]),
  ]);
  const departurePreview =
    phase === 'OFFSEASON'
      ? resolveDeparturePreview(
          offseasonPlayers.map((player) => ({
            id: player.id,
            name: player.name,
            age: player.age,
            skill: player.skill,
            academyTrack: Boolean(player.academyTrack),
            departed: player.departedAt != null || player.status === 'DEPARTED',
          })),
        )
      : null;
  const finance = resolveClubFinance(club, movements);
  const cashLabel =
    phase === 'SEASON' || phase === 'OFFSEASON' ? resolveCashChipLabel(finance) : null;
  const leaguePlayedCount = countPlayedInList(fixtures.filter((f) => f.competition === 'league'));
  const trainingUnlocked = hasPlayedUnlock(leaguePlayedCount, TRAINING_THIN.UNLOCK_AFTER_PLAYED);
  const withCup = phase === 'OFFSEASON' ? fixtures : await ensurePlayerCupTie(club, fixtures);
  const cupLink =
    phase === 'OFFSEASON' ? null : resolveHubCupLink(resolveNationalCup(club, withCup).playerTie);
  const supabase = await createClient();
  const mood = await supabase.from('clubs').select('fan_mood').eq('id', club.id).maybeSingle();
  const moodValue = mood.error || !mood.data ? null : (mood.data as { fan_mood?: number }).fan_mood;
  const fanLabel =
    typeof moodValue === 'number' ? `Kibice: ${fanMoodLabel(moodValue)} ${moodValue}` : null;

  return (
    <EarlyClubHub
      club={club}
      nextFixture={nextFixture}
      lastPlayedFixture={lastPlayed}
      hasFixtures={hasFixtures}
      leaguePositionLabel={leaguePositionLabel}
      cashLabel={cashLabel}
      trainingUnlocked={trainingUnlocked}
      playedCount={leaguePlayedCount}
      todayUtc={utcDateString()}
      seasonReport={seasonReport}
      departurePreview={departurePreview}
      cupLink={cupLink}
      fanLabel={fanLabel}
      matchesBlocked={emailGate.matchesBlocked}
      lastPlayedAt={latestPlayedAt(fixtures)}
    />
  );
}
