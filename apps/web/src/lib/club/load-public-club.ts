import { parseHumanAwards } from '@/lib/league/human-awards';
import { parseLeagueTier, type LeagueTier } from '@/lib/league/league-tier';
import { loadSeasonHistory } from '@/lib/board/store';
import {
  fromClubMatchRow,
  resolveClubRecords,
  type ClubMatch,
  type ClubMatchRow,
  type ClubRecords,
} from '@/lib/stats/records';
import { resolveTrophies, type TrophyDto } from '@/lib/stats/trophies';
import { tryAdminClient } from '@/lib/supabase/admin';
import { polishDay } from '@/lib/ui/polish-day';

/**
 * What any signed-in player may see of another club (D152, privacy policy section 4):
 * name, crest, squad names, results and trophies. No cash, tactics, skills or owner.
 */
export type PublicClub = {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly primaryColor: string;
  readonly crestTemplateId: string;
  readonly leagueTier: LeagueTier;
  readonly season: number;
  readonly since: string;
  readonly records: ClubRecords;
  readonly last: readonly ClubMatch[];
  readonly trophies: readonly TrophyDto[];
  readonly starters: readonly {
    readonly id: string;
    readonly name: string;
    readonly number: number;
    readonly pos: string;
    readonly age: number;
    readonly captain: boolean;
  }[];
};

const CLUB_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const POS_ORDER = ['BR', 'PO', 'ŚO', 'LO', 'ŚP', 'PN', 'N'];

export async function loadPublicClub(clubId: string): Promise<PublicClub | null | 'error'> {
  if (!CLUB_ID.test(clubId)) return null;
  const admin = tryAdminClient();
  if (!admin) return 'error';
  const [club, matches, players, human, history] = await Promise.all([
    admin
      .from('clubs')
      .select(
        'id, name, short_name, primary_color, crest_template_id, league_tier, season_number, created_at',
      )
      .eq('id', clubId)
      .maybeSingle(),
    admin
      .from('club_matches' as never)
      .select(
        'season_number, competition, opponent_club_id, opponent_name, is_home, home_score, away_score, played_at',
      )
      .eq('club_id', clubId)
      .neq('competition', 'challenge')
      .order('played_at', { ascending: false })
      .limit(1000),
    admin
      .from('players')
      .select('id, name, shirt_number, pos, age, captain')
      .eq('club_id', clubId)
      .eq('starter', true)
      .is('departed_at', null)
      .eq('academy_track', false),
    admin
      .from('human_league_history' as never)
      .select('league_id, cycle, awards')
      .contains('awards', JSON.stringify([{ club_id: clubId }]))
      .order('season', { ascending: false })
      .limit(1000),
    loadSeasonHistory(admin, clubId),
  ]);
  if (club.error || matches.error || players.error) return 'error';
  if (!club.data) return null;
  const row = club.data as unknown as {
    id: string;
    name: string;
    short_name: string;
    primary_color: string;
    crest_template_id: string;
    league_tier: string | null;
    season_number: number | null;
    created_at: string;
  };
  const played = (matches.data as unknown as ClubMatchRow[]).map(fromClubMatchRow);
  const awards = (
    (human.data ?? []) as unknown as { league_id: number; cycle: number; awards: unknown }[]
  ).flatMap(({ league_id: league, cycle: season, awards: raw }) => {
    const award = parseHumanAwards(raw).find((a) => a.club_id === clubId);
    return award ? [{ league, season, award }] : [];
  });
  const order = (pos: string) => {
    const i = POS_ORDER.indexOf(pos);
    return i < 0 ? POS_ORDER.length : i;
  };
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    primaryColor: row.primary_color,
    crestTemplateId: row.crest_template_id,
    leagueTier: parseLeagueTier(row.league_tier),
    season: row.season_number ?? 1,
    since: polishDay(row.created_at),
    records: resolveClubRecords(played),
    last: played.slice(0, 5),
    trophies: resolveTrophies({
      history: history ?? [],
      human: awards,
    }),
    starters: (
      players.data as unknown as {
        id: string;
        name: string;
        shirt_number: number;
        pos: string;
        age: number;
        captain: boolean;
      }[]
    )
      .map((p) => ({
        id: p.id,
        name: p.name,
        number: p.shirt_number,
        pos: p.pos,
        age: p.age,
        captain: p.captain,
      }))
      .sort((a, b) => order(a.pos) - order(b.pos) || a.number - b.number),
  };
}
