-- D127: one transaction for a result, its money and the next fixture.
-- Service role only: the app checks the owner and replays the match first.

create or replace function public.settle_fixture(
  p_fixture_id uuid,
  p_club_id uuid,
  p_home integer,
  p_away integer,
  p_reward integer,
  p_reward_label text,
  p_tickets integer,
  p_wage_due integer,
  p_wage_label text,
  p_wage_short_label text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cash integer;
  v_status text;
  v_competition text;
  v_income integer := greatest(0, coalesce(p_reward, 0)) + greatest(0, coalesce(p_tickets, 0));
  v_due integer := greatest(0, coalesce(p_wage_due, 0));
  v_paid integer;
begin
  select cash_balance into v_cash from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'club not found';
  end if;

  select status, competition into v_status, v_competition
  from public.fixtures
  where id = p_fixture_id and club_id = p_club_id
  for update;
  if not found then
    raise exception 'fixture not found';
  end if;

  if v_status = 'played' then
    select -amount into v_paid
    from public.finance_movements
    where fixture_id = p_fixture_id and club_id = p_club_id and category = 'wages'
    limit 1;
    return jsonb_build_object('applied', false, 'paid', coalesce(v_paid, v_due));
  end if;
  if v_status <> 'upcoming' then
    raise exception 'fixture is not open';
  end if;

  update public.fixtures
  set status = 'played', home_score = p_home, away_score = p_away, played_at = now()
  where id = p_fixture_id;

  v_paid := least(v_due, v_cash + v_income);
  update public.clubs set cash_balance = v_cash + v_income - v_paid where id = p_club_id;

  if coalesce(p_reward, 0) > 0 then
    insert into public.finance_movements (club_id, category, label, amount, fixture_id)
    values (p_club_id, 'match_reward', p_reward_label, p_reward, p_fixture_id);
  end if;
  if v_due > 0 then
    insert into public.finance_movements (club_id, category, label, amount, fixture_id)
    values (
      p_club_id,
      'wages',
      case when v_paid < v_due
        then p_wage_short_label || ' ' || (v_due - v_paid)::text || ' €'
        else p_wage_label
      end,
      -v_paid,
      p_fixture_id
    );
  end if;
  if coalesce(p_tickets, 0) > 0 then
    insert into public.finance_movements (club_id, category, label, amount, fixture_id)
    values (p_club_id, 'ticket_income', 'Bilety', p_tickets, p_fixture_id);
  end if;

  if v_competition = 'league' then
    update public.fixtures
    set status = 'upcoming'
    where id = (
      select id from public.fixtures
      where club_id = p_club_id and competition = 'league' and status = 'scheduled'
      order by matchday
      limit 1
    );
  elsif v_competition = 'challenge' then
    update public.rival_challenges
    set status = 'played', home_score = p_home, away_score = p_away, played_at = now()
    where fixture_id = p_fixture_id and challenger_club_id = p_club_id;
  end if;

  return jsonb_build_object('applied', true, 'paid', v_paid);
end;
$$;

revoke all on function public.settle_fixture(
  uuid, uuid, integer, integer, integer, text, integer, integer, text, text
) from public, anon, authenticated;
grant execute on function public.settle_fixture(
  uuid, uuid, integer, integer, integer, text, integer, integer, text, text
) to service_role;
