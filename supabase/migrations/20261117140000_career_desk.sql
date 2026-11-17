-- Contract talks use existing wage and contract_until.
-- Loan, fan mood, and press line are stored. Free-agent fee 0 needs no new category.

alter table public.players
  add column if not exists on_loan boolean not null default false;

alter table public.players
  add column if not exists loan_until date;

alter table public.players
  add column if not exists wage_bank integer;

alter table public.clubs
  add column if not exists fan_mood integer not null default 60;

alter table public.clubs drop constraint if exists clubs_fan_mood_check;

alter table public.clubs
  add constraint clubs_fan_mood_check check (fan_mood between 0 and 100);

alter table public.clubs
  add column if not exists press_line text not null default 'mid';

alter table public.clubs drop constraint if exists clubs_press_line_check;

alter table public.clubs
  add constraint clubs_press_line_check
  check (press_line in ('high', 'mid', 'low'));
