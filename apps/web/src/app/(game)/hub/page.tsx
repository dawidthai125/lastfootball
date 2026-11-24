import { redirect } from 'next/navigation';

import { EarlyClubHub } from '@/components/hub/EarlyClubHub';
import { loadEmailGate } from '@/lib/auth/email-confirm';
import { resolveHubFanLabel } from '@/lib/club/fans';
import { resolveSeasonGoalProgressLine } from '@/lib/season/season-goal';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { resolveClubSquad } from '@/lib/squad/resolve-club-squad';
import { matchWageDue } from '@/lib/squad/truth';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { validateStartingXi } from '@/lib/squad/validate-starting-xi';
import { resolveStarterPath } from '@/lib/starter/steps';
import { loadStarterProgress } from '@/lib/starter/store';
import { contractPreview } from '@/lib/season/contract-expiry';
import { createClient } from '@/lib/supabase/server';
import { latestPlayedAt } from '@/lib/fixtures/kickoff-gate';
import {
  countPlayedInList,
  ensureClubFixtures,
  getLastPlayedFixture,
  getNextFixture,
  hasPlayedUnlock,
  unlockPlayedCount,
  utcDateString,
} from '@/lib/fixtures';
import { FIRST_MATCH_PATHS } from '@/lib/first-match/constants';
import { loadAcademyUpkeep } from '@/lib/academy/read-level';
import { resolveCashChipLabel, resolveClubFinance } from '@/lib/finance';
import { listClubFinanceMovements } from '@/lib/finance/get-movements';
import { resolveHubPhase } from '@/lib/hub';
import { ensurePlayerCupTie } from '@/lib/cup/ensure-cup-tie';
import { resolveNationalCup } from '@/lib/cup';
import { resolveHubCupLink } from '@/lib/hub/cup-link';
import { resolveLeagueTable, resolvePlayerLeaguePositionLabel } from '@/lib/league';
import {
  closeSeasonIfComplete,
  listClubRetirementFlash,
  resolveDeparturePreview,
  resolveRetirementFarewell,
  resolveSeasonReport,
} from '@/lib/season';
import { isPersonality } from '@/lib/squad/depth';
import { resolveDressingConflict } from '@/lib/squad/dressing-room';
import { listClubPlayers } from '@/lib/squad/get-players';
import { resolveIntlCallup } from '@/lib/squad/intl-callup';
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

  const todayUtc = utcDateString();
  const [movements, emailGate, activePlayers, farewellFlash] = await Promise.all([
    listClubFinanceMovements(club.id),
    loadEmailGate(club.ownerId),
    listClubPlayers(club.id),
    phase === 'SEASON' ? listClubRetirementFlash(club.id, todayUtc) : Promise.resolve([]),
  ]);
  const retirePreview =
    phase === 'OFFSEASON'
      ? resolveDeparturePreview(
          activePlayers.map((player) => ({
            id: player.id,
            name: player.name,
            age: player.age,
            skill: player.skill,
            academyTrack: Boolean(player.academyTrack),
            departed: player.departedAt != null || player.status === 'DEPARTED',
          })),
        )
      : null;
  const contractLine = retirePreview
    ? contractPreview(
        activePlayers.filter((player) => player.id !== retirePreview.retire?.id),
        club.seasonNumber,
      )
    : null;
  const departurePreview =
    retirePreview && contractLine
      ? { ...retirePreview, summary: `${retirePreview.summary} ${contractLine}` }
      : retirePreview;
  const retirementFarewell =
    phase === 'SEASON' ? resolveRetirementFarewell(farewellFlash, todayUtc) : null;
  const dressingConflict = Boolean(
    resolveDressingConflict(
      activePlayers.map((player) => ({
        id: player.id,
        name: player.name,
        starter: player.starter,
        morale: typeof player.morale === 'number' ? player.morale : 60,
        personality: isPersonality(player.personality) ? player.personality : 'spokojny',
      })),
    ),
  );
  const intlCallup = Boolean(
    resolveIntlCallup({
      clubId: club.id,
      today: todayUtc,
      players: activePlayers.map((player) => ({
        id: player.id,
        name: player.name,
        skill: player.skill,
        nationality: player.nationality,
        starter: player.starter,
        onLoan: player.onLoan === true,
        loanedIn: player.loanedIn === true,
      })),
      alreadyAbsentIds: activePlayers
        .filter((player) => player.intlAbsentUntil && player.intlAbsentUntil >= todayUtc)
        .map((player) => player.id),
    }),
  );
  const seniors = filterSeniorPlayers(activePlayers);
  const lineupBlocked =
    seniors.length > 0 &&
    !validateStartingXi(
      resolveClubSquad(club, seniors).players.filter((player) => player.starter),
      todayUtc,
    ).ok;
  const supabase = await createClient();
  const finance = resolveClubFinance(
    club,
    movements,
    matchWageDue(seniors),
    await loadAcademyUpkeep(supabase, club.id),
  );
  const cashLabel =
    phase === 'SEASON' || phase === 'OFFSEASON' ? resolveCashChipLabel(finance) : null;
  const leaguePlayedCount = countPlayedInList(fixtures.filter((f) => f.competition === 'league'));
  const trainingUnlocked = hasPlayedUnlock(
    unlockPlayedCount(leaguePlayedCount, club.seasonNumber),
    TRAINING_THIN.UNLOCK_AFTER_PLAYED,
  );
  const withCup = phase === 'OFFSEASON' ? fixtures : await ensurePlayerCupTie(club, fixtures);
  const cupLink =
    phase === 'OFFSEASON' ? null : resolveHubCupLink(resolveNationalCup(club, withCup).playerTie);
  const mood = await supabase.from('clubs').select('fan_mood').eq('id', club.id).maybeSingle();
  const moodValue = mood.error || !mood.data ? null : (mood.data as { fan_mood?: number }).fan_mood;
  const fanLabel = resolveHubFanLabel(
    typeof moodValue === 'number' ? moodValue : null,
    lastPlayed
      ? {
          id: lastPlayed.id,
          homeScore: lastPlayed.homeScore,
          awayScore: lastPlayed.awayScore,
          isHome: lastPlayed.isHome,
        }
      : null,
  );
  const starterPath =
    phase === 'SEASON' && club.seasonNumber <= 2
      ? resolveStarterPath(await loadStarterProgress(club.id))
      : null;
  const playerRow = table.rows.find((row) => row.isPlayer);
  const seasonGoalLine = resolveSeasonGoalProgressLine({
    position: playerRow?.position ?? null,
    tableSize: table.rows.length,
    playedCount: leaguePlayedCount,
  });

  return (
    <EarlyClubHub
      club={club}
      nextFixture={nextFixture}
      lastPlayedFixture={lastPlayed}
      hasFixtures={hasFixtures}
      leaguePositionLabel={leaguePositionLabel}
      cashLabel={cashLabel}
      trainingUnlocked={trainingUnlocked}
      seasonGoalLine={seasonGoalLine}
      wageNote={phase === 'SEASON' ? finance.wageNote : null}
      playedCount={leaguePlayedCount}
      todayUtc={todayUtc}
      seasonReport={seasonReport}
      departurePreview={departurePreview}
      retirementFarewell={retirementFarewell}
      cupLink={cupLink}
      fanLabel={fanLabel}
      starterPath={starterPath}
      matchesBlocked={emailGate.matchesBlocked}
      lastPlayedAt={latestPlayedAt(fixtures)}
      lineupBlocked={lineupBlocked}
      dressingConflict={dressingConflict}
      intlCallup={intlCallup}
    />
  );
}
