-- LFE-TRANSFERS-04: player transfer listing intent (club-local).

alter table public.players
  add column if not exists transfer_listed_at timestamptz null;

comment on column public.players.transfer_listed_at is
  'When set, player is on the club transfer list (LFE-TRANSFERS-04). Cleared on sell.';
