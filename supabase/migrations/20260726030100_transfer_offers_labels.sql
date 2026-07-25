-- Display labels for H2H offers (no clubs cross-read needed).
alter table public.transfer_offers
  add column if not exists buyer_label text not null default 'Kupujący',
  add column if not exists seller_label text not null default 'Sprzedawca';
