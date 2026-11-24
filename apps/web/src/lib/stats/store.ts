import { parseHumanAwards, type HumanAward } from '@/lib/league/human-awards';
import { fromClubMatchRow, type ClubMatch, type ClubMatchRow } from '@/lib/stats/records';
import type { StoredLine } from '@/lib/stats/scorers';
import { createClient } from '@/lib/supabase/server';

// Reads with the player's session: RLS limits every table here to the player's own club.

export type PlayerTotals = {
  readonly season: number;
  readonly competition: string;
  readonly playerId: string;
  readonly name: string;
  readonly matches: number;
  readonly goals: number;
  readonly assists: number;
};

/** Null = the read failed, so a page does not show zeros as facts. */
export async function loadPlayerTotals(
  clubId: string,
  filter: { readonly season?: number; readonly playerId?: string } = {},
): Promise<readonly PlayerTotals[] | null> {
  const supabase = await createClient();
  let query = supabase
    .from('player_season_stats' as never)
    .select('season_number, competition, player_id, player_name, matches, goals, assists')
    .eq('club_id', clubId)
    .eq('team', clubId);
  if (filter.season != null) query = query.eq('season_number', filter.season);
  if (filter.playerId != null) query = query.eq('player_id', filter.playerId);
  const { data, error } = await query.order('season_number', { ascending: false }).limit(1000);
  if (error || !data) return null;
  return (
    data as unknown as {
      season_number: number;
      competition: string;
      player_id: string;
      player_name: string;
      matches: number;
      goals: number;
      assists: number;
    }[]
  ).map((row) => ({
    season: row.season_number,
    competition: row.competition,
    playerId: row.player_id,
    name: row.player_name,
    matches: row.matches,
    goals: row.goals,
    assists: row.assists,
  }));
}

export async function loadStoredLines(
  clubId: string,
  matchIds: readonly string[],
): Promise<readonly StoredLine[] | null> {
  if (matchIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('match_player_stats' as never)
    .select('match_id, team, player_id, player_name, goals, assists')
    .eq('club_id', clubId)
    .in('match_id', [...matchIds])
    .limit(1000);
  if (error || !data) return null;
  return (
    data as unknown as {
      match_id: string;
      team: string;
      player_id: string;
      player_name: string;
      goals: number;
      assists: number;
    }[]
  ).map((row) => ({
    matchId: row.match_id,
    team: row.team,
    playerId: row.player_id,
    name: row.player_name,
    goals: row.goals,
    assists: row.assists,
  }));
}

/** The last 1000 matches: about twenty seasons. */
export async function loadClubMatches(clubId: string): Promise<readonly ClubMatch[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('club_matches' as never)
    .select(
      'season_number, competition, opponent_club_id, opponent_name, is_home, home_score, away_score, played_at',
    )
    .eq('club_id', clubId)
    .order('played_at', { ascending: false })
    .limit(1000);
  if (error || !data) return null;
  return (data as unknown as ClubMatchRow[]).map(fromClubMatchRow);
}

/** Most goals of one own player in one match. */
export async function loadBestMatch(
  clubId: string,
): Promise<{ readonly name: string; readonly goals: number } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('match_player_stats' as never)
    .select('player_name, goals')
    .eq('club_id', clubId)
    .eq('team', clubId)
    .gt('goals', 0)
    .order('goals', { ascending: false })
    .limit(1)
    .maybeSingle();
  const row = data as unknown as { player_name: string; goals: number } | null;
  return row ? { name: row.player_name, goals: row.goals } : null;
}

export type HumanSeasonAward = {
  readonly season: number;
  readonly closedAt: string;
  readonly award: HumanAward;
};

/** Awards of this club in closed seasons of the human league, newest first. */
export async function loadHumanAwards(clubId: string): Promise<readonly HumanSeasonAward[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('human_league_history')
    .select('season, closed_at, awards')
    .order('season', { ascending: false })
    .limit(100);
  const rows = (data ?? []) as unknown as { season: number; closed_at: string; awards: unknown }[];
  return rows.flatMap((row) => {
    const award = parseHumanAwards(row.awards).find((a) => a.club_id === clubId);
    return award ? [{ season: row.season, closedAt: row.closed_at, award }] : [];
  });
}
