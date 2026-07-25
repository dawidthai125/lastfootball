import type { createClient } from '@/lib/supabase/server';
import { resolveTransferEnvelope } from '@/lib/finance/resolve-transfer-envelope';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { isAllowedAgreedAmount } from '@/lib/transfers/resolve-negotiation';
import { seedTransferCatalogue } from '@/lib/transfers/seed-catalogue';
import { TRANSFERS_THIN } from '@/lib/transfers/types';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

function clubTag(clubId: string): string {
  return clubId.replace(/-/g, '').slice(0, 8) || 'club';
}

function nextBoughtId(clubId: string, existingIds: readonly string[]): string {
  const tag = clubTag(clubId);
  const prefix = `t-${tag}-`;
  let max = -1;
  for (const id of existingIds) {
    if (!id.startsWith(prefix)) continue;
    const n = Number(id.slice(prefix.length));
    if (Number.isFinite(n)) max = Math.max(max, n);
  }
  return `${prefix}${max + 1}`;
}

function nextShirt(used: readonly number[]): number {
  for (let n = 1; n <= 99; n++) {
    if (!used.includes(n)) return n;
  }
  return 99;
}

export type CompleteBuyResult =
  { ok: true; playerId: string; amount: number } | { ok: false; error: string };

export type CompleteSellResult =
  { ok: true; playerId: string; amount: number } | { ok: false; error: string };

type ActivePlayer = {
  id: string;
  name: string;
  shirt_number: number;
  pos: string;
  role: string;
  starter: boolean;
  age: number;
  skill: number;
  status: string;
  departed_at: string | null;
};

/**
 * Atomic buy: insert t-{tag}- player + debit cash + finance_movements + transfer_deals.
 * Settles only `agreedAmount` after full revalidation (ask / envelope / window / roster / funds).
 */
export async function completeTransferBuy(
  supabase: AppSupabase,
  input: {
    clubId: string;
    cashBalance: number;
    transferWindowOpen: boolean;
    marketId: string;
    /** Negotiated settlement amount — must be in allowed set vs ask. */
    agreedAmount: number;
    activePlayers: readonly ActivePlayer[];
  },
): Promise<CompleteBuyResult> {
  if (!input.transferWindowOpen) {
    return { ok: false, error: 'Okno transferowe jest zamknięte.' };
  }
  if (input.activePlayers.length >= TRANSFERS_THIN.MAX_ROSTER) {
    return { ok: false, error: 'Kadra jest pełna (max 22).' };
  }

  const listing = seedTransferCatalogue(input.clubId).find((l) => l.marketId === input.marketId);
  if (!listing) {
    return { ok: false, error: 'Nie znaleziono oferty rynkowej.' };
  }

  const ask = deriveTransferFee(listing.skill, listing.age);
  if (!isAllowedAgreedAmount(ask, input.agreedAmount)) {
    return { ok: false, error: 'Nieprawidłowa kwota negocjacji.' };
  }

  const agreedAmount = input.agreedAmount;
  const envelope = resolveTransferEnvelope(input.cashBalance);
  if (input.cashBalance < agreedAmount || envelope.envelopeBalance < agreedAmount) {
    return { ok: false, error: 'Za mało środków w budżecie transferowym / kasie.' };
  }

  const idempotencyKey = `buy:${input.marketId}`;
  const { data: existing } = await supabase
    .from('transfer_deals')
    .select('id, player_id, amount')
    .eq('club_id', input.clubId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existing) {
    const row = existing as { player_id: string; amount: number };
    return { ok: true, playerId: row.player_id, amount: row.amount };
  }

  const allIds = input.activePlayers.map((p) => p.id);
  const { data: departedRows } = await supabase
    .from('players')
    .select('id')
    .eq('club_id', input.clubId);

  const departedIds = ((departedRows as { id: string }[] | null) ?? []).map((r) => r.id);
  const playerId = nextBoughtId(input.clubId, [...allIds, ...departedIds]);
  const shirt = nextShirt(input.activePlayers.map((p) => p.shirt_number));
  const nextCash = input.cashBalance - agreedAmount;

  const { error: playerErr } = await supabase.from('players').insert({
    id: playerId,
    club_id: input.clubId,
    name: listing.name,
    shirt_number: shirt,
    pos: listing.pos,
    role: listing.role,
    starter: false,
    captain: false,
    age: listing.age,
    skill: listing.skill,
    status: 'READY',
    nationality: 'POL',
    version: 1,
    departed_at: null,
  } as never);

  if (playerErr) {
    return { ok: false, error: 'Nie udało się dodać zawodnika.' };
  }

  const { error: cashErr } = await supabase
    .from('clubs')
    .update({ cash_balance: nextCash } as never)
    .eq('id', input.clubId);

  if (cashErr) {
    await supabase
      .from('players')
      .update({
        status: 'DEPARTED',
        departed_at: new Date().toISOString(),
        starter: false,
      } as never)
      .eq('id', playerId)
      .eq('club_id', input.clubId);
    return { ok: false, error: 'Nie udało się zaktualizować kasy.' };
  }

  const { error: movErr } = await supabase.from('finance_movements').insert({
    club_id: input.clubId,
    category: 'transfer_buy',
    label: `Transfer: ${listing.name}`,
    amount: -agreedAmount,
    fixture_id: null,
  } as never);

  if (movErr) {
    return { ok: false, error: 'Zawodnik dodany, ale wpis finansowy nieudany — odśwież Finanse.' };
  }

  const { error: dealErr } = await supabase.from('transfer_deals').insert({
    club_id: input.clubId,
    kind: 'buy',
    player_id: playerId,
    market_id: input.marketId,
    amount: agreedAmount,
    idempotency_key: idempotencyKey,
    completed_at: new Date().toISOString(),
  } as never);

  if (dealErr && dealErr.code !== '23505') {
    return { ok: false, error: 'Transfer zapisany częściowo — sprawdź kadrę i finanse.' };
  }

  return { ok: true, playerId, amount: agreedAmount };
}

/**
 * Atomic sell: mark DEPARTED + credit cash + finance_movements + transfer_deals.
 */
export async function completeTransferSell(
  supabase: AppSupabase,
  input: {
    clubId: string;
    cashBalance: number;
    transferWindowOpen: boolean;
    playerId: string;
    activePlayers: readonly ActivePlayer[];
  },
): Promise<CompleteSellResult> {
  if (!input.transferWindowOpen) {
    return { ok: false, error: 'Okno transferowe jest zamknięte.' };
  }
  if (input.activePlayers.length <= TRANSFERS_THIN.MIN_ROSTER) {
    return { ok: false, error: 'Nie można zejść poniżej 18 zawodników.' };
  }

  const player = input.activePlayers.find((p) => p.id === input.playerId);
  if (!player || player.departed_at) {
    return { ok: false, error: 'Nie znaleziono zawodnika w kadrze.' };
  }

  const isGk = player.pos === 'BR' || player.role === 'GK';
  const gkCount = input.activePlayers.filter((p) => p.pos === 'BR' || p.role === 'GK').length;
  if (isGk && gkCount <= 1) {
    return { ok: false, error: 'Nie możesz sprzedać ostatniego bramkarza.' };
  }

  const fee = deriveTransferFee(player.skill, player.age);
  const idempotencyKey = `sell:${input.playerId}`;

  const { data: existing } = await supabase
    .from('transfer_deals')
    .select('id, player_id, amount')
    .eq('club_id', input.clubId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existing) {
    const row = existing as { player_id: string; amount: number };
    return { ok: true, playerId: row.player_id, amount: row.amount };
  }

  const departedAt = new Date().toISOString();
  const { error: updErr } = await supabase
    .from('players')
    .update({
      status: 'DEPARTED',
      departed_at: departedAt,
      starter: false,
      captain: false,
    } as never)
    .eq('id', input.playerId)
    .eq('club_id', input.clubId)
    .is('departed_at', null);

  if (updErr) {
    return { ok: false, error: 'Nie udało się oznaczyć odejścia zawodnika.' };
  }

  const nextCash = input.cashBalance + fee;
  const { error: cashErr } = await supabase
    .from('clubs')
    .update({ cash_balance: nextCash } as never)
    .eq('id', input.clubId);

  if (cashErr) {
    return { ok: false, error: 'Odejście zapisane, ale kasa nie zaktualizowana — odśwież.' };
  }

  await supabase.from('finance_movements').insert({
    club_id: input.clubId,
    category: 'transfer_sell',
    label: `Sprzedaż: ${player.name}`,
    amount: fee,
    fixture_id: null,
  } as never);

  const { error: dealErr } = await supabase.from('transfer_deals').insert({
    club_id: input.clubId,
    kind: 'sell',
    player_id: input.playerId,
    market_id: null,
    amount: fee,
    idempotency_key: idempotencyKey,
    completed_at: departedAt,
  } as never);

  if (dealErr && dealErr.code !== '23505') {
    return { ok: false, error: 'Sprzedaż częściowa — sprawdź kadrę i finanse.' };
  }

  return { ok: true, playerId: input.playerId, amount: fee };
}
