-- One accepted post-match sentence. Empty until the note action fills it once.

alter table public.fixtures
  add column if not exists match_note text;

alter table public.fixtures
  drop constraint if exists fixtures_match_note_len;

alter table public.fixtures
  add constraint fixtures_match_note_len
  check (match_note is null or char_length(match_note) between 20 and 420);
