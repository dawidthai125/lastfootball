import type { PlayerTotals } from '@/lib/stats/store';

export type PlayerLine = {
  readonly playerId: string;
  readonly name: string;
  readonly matches: number;
  readonly goals: number;
  readonly assists: number;
  readonly leagueGoals: number;
};

/** One line per player over all competitions, best scorer first. */
export function sumByPlayer(totals: readonly PlayerTotals[]): readonly PlayerLine[] {
  const byId = new Map<string, PlayerLine>();
  for (const row of totals) {
    const old = byId.get(row.playerId);
    byId.set(row.playerId, {
      playerId: row.playerId,
      name: old?.name ?? row.name,
      matches: (old?.matches ?? 0) + row.matches,
      goals: (old?.goals ?? 0) + row.goals,
      assists: (old?.assists ?? 0) + row.assists,
      leagueGoals: (old?.leagueGoals ?? 0) + (row.competition === 'league' ? row.goals : 0),
    });
  }
  return [...byId.values()].sort(
    (a, b) =>
      b.goals - a.goals ||
      b.assists - a.assists ||
      b.matches - a.matches ||
      a.name.localeCompare(b.name, 'pl'),
  );
}
