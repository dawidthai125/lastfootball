import type { LeagueTier } from '@/lib/league/league-tier';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { emergencyJunior, missingRole } from '@/lib/squad/emergency-junior';
import { resolveClubSquad } from '@/lib/squad/resolve-club-squad';
import { filterSeniorPlayers, type PlayerRowDto } from '@/lib/squad/types';
import {
  pickBestXi,
  replaceUnavailableStarters,
  validateStartingXi,
} from '@/lib/squad/validate-starting-xi';

/**
 * Full XI rules on stored rows: loans, call-ups, keeper, bans. The save action checks them
 * too, but `starter` is open to the player session, so every official match checks again.
 */
export function lineupProblem(
  clubId: string,
  rows: readonly PlayerRowDto[],
  today: string = utcDateString(),
): string | null {
  const starters = resolveClubSquad({ id: clubId }, rows).players.filter((p) => p.starter);
  return validateStartingXi(starters, today).errors[0] ?? null;
}

/**
 * The same squad with a line-up that may play: the manager's XI without the unavailable, or the
 * best eleven when that is not enough. For matches another club waits for; nothing is saved.
 */
export function repairLineup(
  clubId: string,
  rows: readonly PlayerRowDto[],
  today: string = utcDateString(),
): PlayerRowDto[] {
  if (!lineupProblem(clubId, rows, today)) return [...rows];
  const squad = resolveClubSquad({ id: clubId }, rows).players;
  for (const players of [replaceUnavailableStarters(squad, today), pickBestXi(squad, today)]) {
    const starters = new Set(players.filter((p) => p.starter).map((p) => p.id));
    const fixed = rows.map((row) => ({ ...row, starter: starters.has(row.id) }));
    if (!lineupProblem(clubId, fixed, today)) return fixed;
  }
  return [...rows];
}

const STAND_IN = 'j-';

/** A junior who plays one match for a squad too short for an eleven. Not a player of the club. */
export function isStandIn(id: string): boolean {
  return id.startsWith(STAND_IN);
}

/**
 * A line-up that may play, always: the fit players, and juniors of the level of the league in
 * the empty places. The other club must not wait for this one (D138.4). Nothing is saved.
 */
export function fillLineup(
  clubId: string,
  tier: LeagueTier,
  rows: readonly PlayerRowDto[],
  today: string = utcDateString(),
): PlayerRowDto[] {
  const squad = [...rows];
  const worn = new Set(rows.map((row) => row.shirtNumber));
  for (let i = 1; i <= 11; i += 1) {
    const seniors = filterSeniorPlayers(squad);
    const role = missingRole(
      seniors.length > 0 ? resolveClubSquad({ id: clubId }, seniors).players : [],
      today,
    );
    if (!role) break;
    const shirtNumber = Array.from({ length: 99 }, (_, n) => 99 - n).find((n) => !worn.has(n))!;
    worn.add(shirtNumber);
    squad.push({
      ...emergencyJunior(tier, `${clubId}:${STAND_IN}${i}`),
      ...role,
      id: `${STAND_IN}${clubId.replace(/-/g, '').slice(0, 8)}-${i}`,
      clubId,
      shirtNumber,
      starter: false,
      captain: false,
      status: 'READY',
      nationality: 'POL',
      version: 1,
      departedAt: null,
      transferListedAt: null,
      academyTrack: false,
      promotedAt: null,
      energy: 80,
      form: 60,
      morale: 60,
    });
  }
  return repairLineup(clubId, squad, today);
}
