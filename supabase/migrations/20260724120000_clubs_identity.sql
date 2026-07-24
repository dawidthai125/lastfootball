-- P3 Club Wizard: identity columns + stricter short_name (GDD §5.3: 3–4).

alter table public.clubs
  add column if not exists primary_color text not null default '#1F5C38',
  add column if not exists secondary_color text not null default '#C4A35A',
  add column if not exists crest_template_id text not null default 'DEFAULT';

alter table public.clubs drop constraint if exists clubs_short_name_len;

alter table public.clubs
  add constraint clubs_short_name_len check (char_length(short_name) between 3 and 4);

create unique index if not exists clubs_name_lower_unique on public.clubs (lower(trim(name)));
