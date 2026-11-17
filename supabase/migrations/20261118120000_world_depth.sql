-- Incoming loans, press shape, and national-team absence windows.

alter table public.players
  add column if not exists loaned_in boolean not null default false;

alter table public.players
  add column if not exists loan_partner_label text;

alter table public.players
  add column if not exists intl_absent_until date;

alter table public.players drop constraint if exists players_loan_direction_check;

alter table public.players
  add constraint players_loan_direction_check
  check (not (on_loan = true and loaned_in = true));

alter table public.clubs
  add column if not exists press_shape text not null default 'flat';

alter table public.clubs drop constraint if exists clubs_press_shape_check;

alter table public.clubs
  add constraint clubs_press_shape_check
  check (press_shape in ('flat', 'left_high', 'right_high', 'split'));
