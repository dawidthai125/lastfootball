-- Soft email confirm. Play starts immediately. Rivalry and, after the grace, matches wait.
-- Existing accounts are marked confirmed and already bonused so nobody is paid twice.

alter table public.finance_movements
  drop constraint if exists finance_movements_category_check;

alter table public.finance_movements
  add constraint finance_movements_category_check check (
    category in (
      'starter',
      'match_reward',
      'transfer_buy',
      'transfer_sell',
      'sponsor_base',
      'sponsor_bonus',
      'email_confirm'
    )
  );

create unique index if not exists finance_movements_email_confirm_club_unique
  on public.finance_movements (club_id)
  where category = 'email_confirm';

create table if not exists public.manager_email_status (
  user_id uuid primary key references auth.users (id) on delete cascade,
  confirmed_at timestamptz,
  deadline_at timestamptz not null,
  token_hash text,
  token_expires_at timestamptz,
  last_sent_at timestamptz,
  sends_today integer not null default 0,
  sends_day date,
  bonus_at timestamptz
);

create unique index if not exists manager_email_status_token_hash_idx
  on public.manager_email_status (token_hash)
  where token_hash is not null;

alter table public.manager_email_status enable row level security;

drop policy if exists manager_email_status_select_own on public.manager_email_status;
create policy manager_email_status_select_own
  on public.manager_email_status
  for select
  to authenticated
  using (auth.uid() = user_id);

revoke insert, update, delete on public.manager_email_status from anon, authenticated;

create or replace function public.grant_email_confirm_bonus(p_user uuid, p_amount int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_club uuid;
begin
  if p_amount <> 10000 then
    return;
  end if;

  if not exists (
    select 1
    from public.manager_email_status
    where user_id = p_user
      and confirmed_at is not null
      and bonus_at is null
  ) then
    return;
  end if;

  select id into v_club from public.clubs where owner_id = p_user limit 1;
  if v_club is null then
    return;
  end if;

  begin
    insert into public.finance_movements (club_id, category, label, amount)
    values (v_club, 'email_confirm', 'Premia za potwierdzony email', p_amount);
  exception
    when unique_violation then
      update public.manager_email_status
      set bonus_at = now()
      where user_id = p_user
        and bonus_at is null;
      return;
  end;

  update public.clubs
  set cash_balance = cash_balance + p_amount
  where id = v_club;

  update public.manager_email_status
  set bonus_at = now()
  where user_id = p_user
    and bonus_at is null;
end;
$$;

revoke all on function public.grant_email_confirm_bonus(uuid, int) from public, anon, authenticated;
grant execute on function public.grant_email_confirm_bonus(uuid, int) to service_role;

insert into public.manager_email_status (user_id, confirmed_at, deadline_at, bonus_at)
select id, now(), now(), now()
from auth.users
on conflict (user_id) do nothing;
