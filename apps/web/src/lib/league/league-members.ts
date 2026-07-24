import type { ClubDto } from '@/lib/club/types';
import { OPPONENT_CATALOG } from '@/lib/fixtures/opponent-catalog';
import type { LeagueMember } from '@/lib/league/types';

/**
 * IV-liga Thin membership: player club + all catalog AI (12 total).
 * No DB — catalog + ClubDto only.
 */
export function resolveLeagueMembers(
  club: Pick<ClubDto, 'id' | 'name' | 'shortName'>,
): readonly LeagueMember[] {
  const player: LeagueMember = {
    id: club.id,
    name: club.name,
    shortName: club.shortName,
    isPlayer: true,
  };
  const ai: LeagueMember[] = OPPONENT_CATALOG.map((o) => ({
    id: o.id,
    name: o.name,
    shortName: o.shortName,
    isPlayer: false,
  }));
  return [player, ...ai];
}

export const LEAGUE_SIZE = 12 as const;
