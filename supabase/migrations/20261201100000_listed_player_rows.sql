-- Applied after the deploy that reads listed players on the server (D156). The policy showed every
-- column of a listed player, also the potential a scout report is sold for.
drop policy if exists "players_select_transfer_listed" on public.players;
