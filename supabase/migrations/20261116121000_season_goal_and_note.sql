-- One season goal payout and the sentence the hub shows after confirm.

alter table public.clubs
  add column if not exists season_goal_paid_for integer;

alter table public.clubs
  add column if not exists season_goal_note text;

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
      'email_confirm',
      'wages',
      'scout_report',
      'ticket_income',
      'stadium_build',
      'coach_hire',
      'season_goal'
    )
  );
