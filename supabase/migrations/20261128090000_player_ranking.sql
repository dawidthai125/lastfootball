-- Ranking of players (D152): results of clubs led by people, grouped for the server.
-- Accounts blocked by the operator are left out. Friendlies do not count.
create or replace function public.player_ranking(p_since timestamptz)
returns table (
  club_id uuid,
  name text,
  short_name text,
  league_tier text,
  competition text,
  match_tier text,
  won integer,
  drawn integer,
  lost integer,
  goals_for integer,
  goals_against integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id,
    c.name,
    c.short_name,
    c.league_tier,
    m.competition,
    m.league_tier,
    (count(*) filter (where m.ours > m.theirs))::integer,
    (count(*) filter (where m.ours = m.theirs))::integer,
    (count(*) filter (where m.ours < m.theirs))::integer,
    sum(m.ours)::integer,
    sum(m.theirs)::integer
  from (
    select
      cm.club_id, cm.competition, cm.league_tier,
      case when cm.is_home then cm.home_score else cm.away_score end as ours,
      case when cm.is_home then cm.away_score else cm.home_score end as theirs
    from public.club_matches cm
    where cm.played_at >= p_since
      and cm.competition in ('league', 'cup', 'human')
  ) m
  join public.clubs c on c.id = m.club_id
  where c.owner_id is not null
    and not exists (select 1 from public.blocked_accounts b where b.user_id = c.owner_id)
  group by c.id, c.name, c.short_name, c.league_tier, m.competition, m.league_tier;
$$;
revoke all on function public.player_ranking(timestamptz) from public, anon, authenticated;
grant execute on function public.player_ranking(timestamptz) to service_role;

create index if not exists club_matches_played_at_idx on public.club_matches (played_at);
