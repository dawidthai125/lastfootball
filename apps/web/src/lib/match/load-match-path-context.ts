import { notFound, redirect } from 'next/navigation';

import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { FIRST_MATCH_BOT, FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { getFixtureByIdForClub } from '@/lib/fixtures';

export type MatchPathContext = {
  matchId: string;
  opponentLabel: string;
  homeShort: string;
  homeName: string;
  awayShort: string;
  awayName: string;
  meta: string;
  firstMatch: boolean;
};

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
      meta: 'Pierwszy mecz · Kick-off',
      firstMatch: true,
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
    meta: `Kolejka ${dto.matchday} · ${dto.isHome ? 'U siebie' : 'Wyjazd'}`,
    firstMatch: false,
  };
}
