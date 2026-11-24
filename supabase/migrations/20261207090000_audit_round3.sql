-- D159: whole-game audit, round after the fixes.

do $mig$
declare
  d text;
  v_reset text := '  -- Nobody came to the first day: the league starts again.
  update public.human_league set season_key = p_start where not frozen and season_key < p_today;';
  v_open text := '  -- A new league from two waiting clubs, or from one when there is no league at all.';
  v_name text := '(select o.name from public.clubs o where o.id::text = new.opponent_club_id)';
begin
  -- 1. One match a Warsaw day also after a season start, which deletes the played fixtures. The
  --    archive keeps league, cup and human matches, rival_challenges keeps the challenges.
  d := pg_get_functiondef(
    'public.settle_fixture(uuid,uuid,integer,integer,integer,text,integer,integer,text,text,jsonb,text,text)'::regprocedure
  );
  if position('club_matches' in d) = 0 then
    if position('  ) then
    raise exception ''match day taken''' in d) = 0 then
      raise exception 'settle_fixture differs';
    end if;
    d := replace(d, '  ) then
    raise exception ''match day taken''', '  ) or exists (
    select 1 from public.club_matches m
    where m.club_id = p_club_id
      and case when m.competition = ''cup'' then ''league'' else m.competition end
        = case when v_competition = ''cup'' then ''league'' else v_competition end
      and (m.played_at at time zone ''Europe/Warsaw'')::date
        = (now() at time zone ''Europe/Warsaw'')::date
  ) or (v_competition = ''challenge'' and exists (
    select 1 from public.rival_challenges r
    where r.challenger_club_id = p_club_id and r.status = ''played''
      and (r.played_at at time zone ''Europe/Warsaw'')::date
        = (now() at time zone ''Europe/Warsaw'')::date
  )) then
    raise exception ''match day taken''');
    execute d;
  end if;

  -- 2. A league whose clubs play the game starts on its day, also when nobody opened it after
  --    18:00: the first visit closes the seats and the rounds so far are late ones. The three
  --    free days after round 22 (D138) are enough for them, so a later visit starts it again.
  d := pg_get_functiondef('public.human_league_sync(timestamptz,date,date,jsonb)'::regprocedure);
  if position('lf_first_day' in d) = 0 then
    if position(v_reset in d) = 0 or position(v_open in d) = 0 then
      raise exception 'human_league_sync differs';
    end if;
    d := replace(d, v_reset, '  -- lf_first_day: nobody came to it, or too long ago. The league starts again.
  update public.human_league l set season_key = p_start
  where not l.frozen and l.season_key < p_today and (
    l.season_key < p_today - 3
    or not exists (
      select 1 from public.human_league_seats s
      join public.human_active_clubs(
        -- The day the start was announced.
        (l.season_key - 1)::timestamp at time zone ''utc''
      ) a on a.id::text = s.ref_id
      where s.league_id = l.id and s.kind = ''human''
    )
  );');
    d := replace(d, v_open, '  -- The others started on their day.
  update public.human_league set frozen = true where not frozen and season_key < p_today;

' || v_open);
    execute d;
  end if;

  -- 3. A rival who is gone has no name to copy.
  d := pg_get_functiondef('public.archive_club_match()'::regprocedure);
  if position('Klub usunięty' in d) = 0 then
    if position(v_name in d) = 0 then
      raise exception 'archive_club_match differs';
    end if;
    d := replace(d, v_name, 'coalesce(
      ' || v_name || ',
      case when new.opponent_club_id ~ ''^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$''
        then ''Klub usunięty'' end
    )');
    execute d;
  end if;

  -- 4. A report on an own or a listed player only: others are private (D156).
  d := pg_get_functiondef('public.buy_scout_report(text)'::regprocedure);
  if position('transfer_listed_at' in d) = 0 then
    if position('  if not found or v_player.departed_at is not null then' in d) = 0 then
      raise exception 'buy_scout_report differs';
    end if;
    d := replace(d, '  if not found or v_player.departed_at is not null then',
      '  if not found or v_player.departed_at is not null
    or (v_player.club_id <> v_club.id and v_player.transfer_listed_at is null)
  then');
    execute d;
  end if;
end;
$mig$;

update public.club_matches m
set opponent_name = 'Klub usunięty'
where m.opponent_name is null
  and m.opponent_club_id ~ '^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$'
  and not exists (select 1 from public.clubs c where c.id::text = m.opponent_club_id);

notify pgrst, 'reload schema';
