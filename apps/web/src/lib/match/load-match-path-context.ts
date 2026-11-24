import { notFound, redirect } from 'next/navigation';

import { env } from '@/config/env';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { FIRST_MATCH_BOT, FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { getFixtureByIdForClub, listClubFixtures } from '@/lib/fixtures';
import { humanRoundFromFixture } from '@/lib/league/human-league';
import { buildRivalCardLines, lastRivalResult, type RivalCardInput } from '@/lib/match/rival-card';
import { createAdminClient } from '@/lib/supabase/admin';

export type MatchPathContext = {
  matchId: string;
  opponentLabel: string;
  homeShort: string;
  homeName: string;
  awayShort: string;
  awayName: string;
  meta: string;
  firstMatch: boolean;
  rivalLines: readonly string[];
};

const CLUB_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NO_RIVAL_FACTS: RivalCardInput = {
  last: null,
  starterForms: null,
  stylePressing: null,
  styleTempo: null,
  styleWidth: null,
};

function stylePoint(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Opponent habits and starter form. Missing columns or an AI side stay null. */
async function readOpponentFacts(
  opponentClubId: string,
): Promise<Pick<RivalCardInput, 'starterForms' | 'stylePressing' | 'styleTempo' | 'styleWidth'>> {
  const empty = {
    starterForms: null,
    stylePressing: null,
    styleTempo: null,
    styleWidth: null,
  };
  if (!CLUB_UUID.test(opponentClubId) || !env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return empty;
  }
  const admin = createAdminClient();
  const style = await admin
    .from('clubs')
    .select('style_pressing, style_tempo, style_width')
    .eq('id', opponentClubId)
    .maybeSingle();
  const styleRow = style.error || !style.data ? null : style.data;
  const players = await admin
    .from('players')
    .select('starter, form, status')
    .eq('club_id', opponentClubId)
    .is('departed_at', null);
  const rows = players.error || !players.data ? null : players.data;
  const starterForms =
    rows == null || rows.length === 0
      ? null
      : rows
          .filter((row) => row.starter && row.status !== 'DEPARTED' && typeof row.form === 'number')
          .map((row) => row.form);
  return {
    starterForms,
    stylePressing: stylePoint(styleRow?.style_pressing),
    styleTempo: stylePoint(styleRow?.style_tempo),
    styleWidth: stylePoint(styleRow?.style_width),
  };
}

async function rivalLinesFor(clubId: string, opponentClubId: string): Promise<readonly string[]> {
  const fixtures = await listClubFixtures(clubId);
  const opponent = await readOpponentFacts(opponentClubId);
  return buildRivalCardLines({
    last: lastRivalResult(fixtures, opponentClubId),
    ...opponent,
  });
}

/**
 * Shared resolve for Match Path stages (tunnel / vs / pre).
 */
export async function loadMatchPathContext(matchId: string): Promise<MatchPathContext> {
  if (matchId === FIRST_MATCH_ID) {
    const club = await getManagerClub();
    if (!club) redirect('/welcome');
    if (isFirstMatchCompleted(club)) redirect('/hub');
    return {
      matchId,
      opponentLabel: FIRST_MATCH_BOT.name,
      homeShort: club.shortName,
      homeName: club.name,
      awayShort: FIRST_MATCH_BOT.shortName,
      awayName: FIRST_MATCH_BOT.name,
      meta: 'Pierwszy mecz',
      firstMatch: true,
      rivalLines: buildRivalCardLines(NO_RIVAL_FACTS),
    };
  }

  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const dto = await getFixtureByIdForClub(club.id, matchId);
  if (!dto) notFound();
  if (dto.status === 'played') redirect('/hub');
  if (dto.status !== 'upcoming') redirect('/hub');

  const homeShort = dto.isHome ? club.shortName : dto.opponent.shortName;
  const homeName = dto.isHome ? club.name : dto.opponent.name;
  const awayShort = dto.isHome ? dto.opponent.shortName : club.shortName;
  const awayName = dto.isHome ? dto.opponent.name : club.name;

  return {
    matchId,
    opponentLabel: dto.opponent.name,
    homeShort,
    homeName,
    awayShort,
    awayName,
    meta:
      dto.competition === 'cup'
        ? `Puchar · ${dto.matchday === 104 ? 'Neutralny' : dto.isHome ? 'U siebie' : 'Wyjazd'}`
        : dto.competition === 'human'
          ? `Liga ludzi · Kolejka ${humanRoundFromFixture(dto.matchday) ?? dto.matchday} · ${dto.isHome ? 'U siebie' : 'Wyjazd'}`
          : dto.competition === 'challenge'
            ? `Wyzwanie · ${dto.isHome ? 'U siebie' : 'Wyjazd'}`
            : `Kolejka ${dto.matchday} · ${dto.isHome ? 'U siebie' : 'Wyjazd'}`,
    firstMatch: false,
    rivalLines: await rivalLinesFor(club.id, dto.opponentClubId),
  };
}
