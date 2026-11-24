import { ASSIST_SHARE, assistWeight, goalWeight, pickByWeight } from '@lastfootball/lfe';

import type { FixtureDto } from '@/lib/fixtures/types';
import { resolveLeagueMembers } from '@/lib/league/league-members';
import type { LeagueTier } from '@/lib/league/league-tier';
import { planAiMatchesForPlayedWeeks } from '@/lib/league/simulate-ai-results';
import { unitHash } from '@/lib/match/hash-seed';
import { seedOpponentSquad } from '@/lib/squad/seed-roster';

/** One player on a scorer list (D143). */
export type ScorerRow = {
  readonly teamId: string;
  readonly teamName: string;
  readonly playerId: string;
  readonly name: string;
  readonly goals: number;
  readonly assists: number;
  readonly yours: boolean;
};

export type StoredLine = {
  readonly matchId: string;
  readonly team: string;
  readonly playerId: string;
  readonly name: string;
  readonly goals: number;
  readonly assists: number;
};

/** Adds up goals and assists by team and player. Two AI clubs can share player ids. */
export class ScorerTally {
  private readonly rows = new Map<
    string,
    { teamId: string; playerId: string; name: string; goals: number; assists: number }
  >();

  add(teamId: string, playerId: string, name: string, goals: number, assists: number): void {
    if (goals + assists === 0) return;
    const key = `${teamId}|${playerId}`;
    const row = this.rows.get(key) ?? { teamId, playerId, name, goals: 0, assists: 0 };
    row.goals += goals;
    row.assists += assists;
    row.name = name;
    this.rows.set(key, row);
  }

  /** Goals of a match nobody played live: same score, shared out by role and skill. */
  addDerived(teamId: string, tier: LeagueTier, goals: number, seed: string): void {
    if (goals <= 0) return;
    const squad = seedOpponentSquad(teamId, tier);
    for (let k = 0; k < goals; k += 1) {
      const key = `${seed}|${teamId}|${k}`;
      const scorer =
        squad[
          pickByWeight(
            squad.map((p) => goalWeight(p.role, p.skill ?? 50)),
            unitHash(`${key}|goal`),
          )
        ]!;
      this.add(teamId, scorer.id, scorer.name, 1, 0);
      if (unitHash(`${key}|assisted`) >= ASSIST_SHARE) continue;
      const rest = squad.filter((p) => p.id !== scorer.id);
      const helper =
        rest[
          pickByWeight(
            rest.map((p) => assistWeight(p.role, p.skill ?? 50)),
            unitHash(`${key}|assist`),
          )
        ]!;
      this.add(teamId, helper.id, helper.name, 0, 1);
    }
  }

  /** Best first. Ties: assists, then name. */
  list(teamName: (id: string) => string, yourTeam: string): readonly ScorerRow[] {
    return [...this.rows.values()]
      .map((row) => ({
        ...row,
        teamName: teamName(row.teamId),
        yours: row.teamId === yourTeam,
      }))
      .sort(
        (a, b) => b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name, 'pl'),
      );
  }
}

/**
 * Scorers of the club's league season. Our matches from storage, the rest derived from the same
 * AI scores the table shows. A match from before the statistics counts for the opponent only.
 */
export function resolveLeagueScorers(
  club: {
    readonly id: string;
    readonly name: string;
    readonly shortName: string;
    readonly leagueTier: LeagueTier;
    readonly seasonNumber: number;
  },
  fixtures: readonly FixtureDto[],
  stored: readonly StoredLine[],
): readonly ScorerRow[] {
  const tally = new ScorerTally();
  const known = new Set(stored.map((line) => line.matchId));
  const played = fixtures.filter(
    (f) =>
      f.competition === 'league' &&
      f.status === 'played' &&
      f.homeScore != null &&
      f.awayScore != null,
  );
  const ids = new Set(played.map((f) => f.id));
  for (const line of stored) {
    if (!ids.has(line.matchId)) continue;
    tally.add(line.team, line.playerId, line.name, line.goals, line.assists);
  }
  for (const f of played) {
    if (known.has(f.id)) continue;
    const theirs = f.isHome ? f.awayScore! : f.homeScore!;
    tally.addDerived(f.opponentClubId, club.leagueTier, theirs, f.id);
  }
  const days = new Set(played.map((f) => f.matchday));
  const ctx = { seasonNumber: club.seasonNumber, tier: club.leagueTier };
  for (const m of planAiMatchesForPlayedWeeks(club.id, days, ctx)) {
    const seed = `${m.homeId}|${m.awayId}|s${club.seasonNumber}|${club.leagueTier}`;
    tally.addDerived(m.homeId, club.leagueTier, m.homeScore, seed);
    tally.addDerived(m.awayId, club.leagueTier, m.awayScore, seed);
  }
  const names = new Map(resolveLeagueMembers(club).map((m) => [m.id, m.name]));
  return tally.list((id) => names.get(id) ?? 'Rywal', club.id);
}
