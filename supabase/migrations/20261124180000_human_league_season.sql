-- The human league runs on its own calendar. A new club season deleted its matches, so a played
-- round came back unplayed and could be played, and paid, again.
do $do$
declare
  v_def text := pg_get_functiondef('public.clear_season_fixtures'::regproc);
  v_old text := 'and not (competition = ''challenge'' and status <> ''played'')';
begin
  if position('competition = ''human''' in v_def) > 0 then
    return;
  end if;
  if position(v_old in v_def) = 0 then
    raise exception 'clear_season_fixtures differs';
  end if;
  execute replace(
    v_def,
    v_old,
    'and competition <> ''human'' ' || v_old
  );
end;
$do$;

-- Pitch and style of the home club, frozen with the line-ups. Both clubs and the saved score
-- then use the same numbers, also when the second club watches days later.
alter table public.human_broadcasts add column if not exists home_setup jsonb;
