import { randomUUID } from 'node:crypto';

import type { FormationCode } from '@lastfootball/lfe';
import { notFound, redirect } from 'next/navigation';

import { EmergencyJuniorOffer } from '@/components/squad/EmergencyJuniorOffer';
import { FreshEntry } from '@/components/match/FreshEntry';
import { KickoffBlocked } from '@/components/match/KickoffBlocked';
import { LiveMatchFoundation } from '@/components/match/LiveMatchFoundation';
import { OpenMatchNotice } from '@/components/match/OpenMatchNotice';
import { LiveMatchShell } from '@/components/match/LiveMatchShell';
import { EmptyState, LocationHero } from '@/components/ui';
import { readClubBuild } from '@/lib/club/read-build';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { createClient } from '@/lib/supabase/server';
import { buildFirstLiveBundle } from '@/lib/first-match/bundles';
import { FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { buildLeagueLiveBundle, getFixtureByIdForClub } from '@/lib/fixtures';
import { matchPrePath } from '@/lib/match/match-path';
import { lineupEditorHref } from '@/lib/match/xi-block-path';
import { parseOurFormation, withShape } from '@/lib/match/our-formation';
import { previewMatchDevelopment } from '@/lib/squad/apply-match-development';
import { listClubPlayers } from '@/lib/squad/get-players';
import { loadRivalSquad } from '@/lib/rivals/squad';
import { resolveMatchBench, resolveStartingXi, SquadUnavailableError } from '@/lib/squad';
import { prepareHumanLive } from '@/lib/league/human-league-store';
import {
  resolveOpponentBench,
  resolveOpponentXi,
  type MatchExtra,
} from '@/lib/fixtures/create-session';
import { MATCH_RULES_VERSION } from '@/lib/match/kickoff-snapshot';
import { enterMatch, storeKickoff } from '@/lib/match/kickoff-store';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { lineupProblem } from '@/lib/squad/lineup-problem';
import { upcomingKickoffSentence } from '@/lib/match/upcoming-kickoff-block';
import { UI_COPY } from '@/lib/ui/copy';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ shape?: string | string[] }>;
};

function SquadError({
  matchId,
  detail,
  formation = '4-4-2',
}: {
  matchId: string;
  detail?: string;
  formation?: FormationCode;
}) {
  return (
    <div data-lf-impl="LFE-UI-IMPL-06" data-mch="SCR-MCH-04">
      <LocationHero waId="HERO-003" src="/assets/world-art/hero-003-pitch-night.png" priority />
      <EmptyState
        waId="EMP-002"
        illustrationSrc="/assets/world-art/emp-002-empty-locker.png"
        title="Kadra niedostępna"
        body={detail ?? 'Nie można rozpocząć meczu — brak składu. Wróć do przedmeczu i ustaw XI.'}
        links={[
          { href: withShape(lineupEditorHref(matchId), formation), label: 'Popraw skład' },
          { href: withShape(matchPrePath(matchId), formation), label: UI_COPY.backToPrematch },
          { href: '/squad', label: UI_COPY.squadNav },
        ]}
      />
      <EmergencyJuniorOffer />
    </div>
  );
}

export default async function LiveMatchPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sentence = await upcomingKickoffSentence(id);
  if (sentence) return <KickoffBlocked sentence={sentence} />;
  const ourFormation = parseOurFormation((await searchParams).shape);

  if (id === FIRST_MATCH_ID) {
    const club = await getManagerClub();
    if (!club) redirect('/welcome');
    if (isFirstMatchCompleted(club)) redirect('/hub');
    try {
      const players = await listClubPlayers(club.id);
      const ourXi = resolveStartingXi(players);
      const ourBench = resolveMatchBench(players);
      const developmentNames = previewMatchDevelopment(
        players,
        'first-match',
        new Set(ourXi.map((p) => p.id)),
      );
      const supabase = await createClient();
      const build = await readClubBuild(supabase, club.id);
      const moodRow = await supabase
        .from('clubs')
        .select('fan_mood')
        .eq('id', club.id)
        .maybeSingle();
      const fanMoodBefore =
        moodRow.error || !moodRow.data
          ? 60
          : typeof (moodRow.data as { fan_mood?: number }).fan_mood === 'number'
            ? (moodRow.data as { fan_mood: number }).fan_mood
            : 60;
      return (
        <LiveMatchFoundation
          bundle={buildFirstLiveBundle(club, build.levels)}
          club={club}
          firstMatch
          ourXi={ourXi}
          ourBench={ourBench}
          developmentNames={developmentNames}
          fanMoodBefore={fanMoodBefore}
        />
      );
    } catch (e) {
      if (e instanceof SquadUnavailableError) {
        return <SquadError matchId={id} detail={e.message} />;
      }
      throw e;
    }
  }

  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const dto = await getFixtureByIdForClub(club.id, id);
  if (!dto) notFound();
  if (dto.status === 'played') {
    return <LiveMatchShell playedHref={`/match/${id}`}>{null}</LiveMatchShell>;
  }
  if (dto.status !== 'upcoming') redirect('/hub');

  try {
    const players = await listClubPlayers(club.id);
    const human = dto.competition === 'human' ? await prepareHumanLive(club, dto) : null;
    if (human?.block) return <KickoffBlocked sentence={human.block} />;
    const entry = human ? null : await enterMatch(club.id, dto.id, filterSeniorPlayers(players));
    if (entry?.kind === 'error') {
      return <KickoffBlocked sentence="Nie udało się odczytać meczu. Odśwież stronę." />;
    }
    if (entry?.kind === 'other') return <OpenMatchNotice fixtureId={entry.fixtureId} other />;
    const going = entry?.kind === 'resume' ? entry : null;
    const problem = human || going ? null : lineupProblem(club.id, players);
    if (problem) return <SquadError matchId={id} detail={problem} formation={ourFormation} />;
    const ourXi = human ? human.ourXi : (going?.snapshot.ourXi ?? resolveStartingXi(players));
    const ourBench = human
      ? human.ourBench
      : (going?.snapshot.ourBench ?? resolveMatchBench(players));
    const developmentNames = previewMatchDevelopment(
      players,
      dto.id,
      new Set(ourXi.map((p) => p.id)),
    );
    const rival =
      dto.competition === 'challenge' && !going ? await loadRivalSquad(dto.opponentClubId) : null;
    if (dto.competition === 'challenge' && !going && !rival) {
      return <SquadError matchId={id} detail="Rywal nie ma pełnej jedenastki." />;
    }
    const supabase = await createClient();
    const moodRow = await supabase.from('clubs').select('fan_mood').eq('id', club.id).maybeSingle();
    const fanMoodBefore =
      moodRow.error || !moodRow.data
        ? 60
        : typeof (moodRow.data as { fan_mood?: number }).fan_mood === 'number'
          ? (moodRow.data as { fan_mood: number }).fan_mood
          : 60;
    // A resumed match keeps the rules and the bench it started with.
    const extra: MatchExtra = human
      ? { theirBench: human.theirBench, fullRules: human.fullRules }
      : going
        ? {
            theirBench: going.snapshot.theirBench ?? null,
            fullRules: going.snapshot.rules === MATCH_RULES_VERSION,
          }
        : { theirBench: rival?.bench ?? resolveOpponentBench(club, dto), fullRules: true };
    if (!human && !going) {
      await storeKickoff({
        club,
        fixture: dto,
        ourXi,
        ourBench,
        formation: ourFormation,
        theirXi: rival?.xi ?? resolveOpponentXi(club, dto),
        theirBench: extra.theirBench,
        rules: MATCH_RULES_VERSION,
      });
    }
    return (
      <LiveMatchShell playedHref={`/match/${id}`}>
        <FreshEntry token={randomUUID()}>
          <LiveMatchFoundation
            bundle={buildLeagueLiveBundle(club, human?.fixture ?? dto)}
            club={going?.snapshot.club ?? club}
            leagueFixture={human?.fixture ?? going?.snapshot.fixture ?? dto}
            ourXi={ourXi}
            ourBench={ourBench}
            ourFormation={going?.snapshot.formation ?? ourFormation}
            theirXi={human?.theirXi ?? going?.snapshot.theirXi ?? rival?.xi ?? null}
            extra={extra}
            resume={going ? { tick: going.tick, log: going.log } : null}
            developmentNames={developmentNames}
            fanMoodBefore={fanMoodBefore}
          />
        </FreshEntry>
      </LiveMatchShell>
    );
  } catch (e) {
    if (e instanceof SquadUnavailableError) {
      return <SquadError matchId={id} detail={e.message} />;
    }
    throw e;
  }
}
