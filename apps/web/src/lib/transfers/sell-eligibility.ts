import { saleBlock } from '@/lib/transfers/fair-sale';
import type { PlayerRowDto } from '@/lib/squad/types';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { TRANSFERS_THIN } from '@/lib/transfers/types';

/** Seniors the sale limits count. An emergency junior stands in for nobody (D160). */
export function saleRoster(players: readonly PlayerRowDto[]): PlayerRowDto[] {
  return filterSeniorPlayers(players).filter((p) => p.origin !== 'emergency');
}

/**
 * Shared sell-side qualification (LFE-TRANSFERS-04).
 * Used by List, Instant Sell, Incoming Offers (and Unlist when eligibility applies).
 * Filters academy_track only — prospects are never sell-eligible.
 */
export function isTransferSellEligible(input: {
  readonly transferWindowOpen: boolean;
  readonly activePlayers: readonly PlayerRowDto[];
  readonly playerId: string;
}): boolean {
  if (!input.transferWindowOpen) return false;

  const active = saleRoster(input.activePlayers);
  if (active.length <= TRANSFERS_THIN.MIN_ROSTER) return false;

  const player = active.find((p) => p.id === input.playerId);
  if (!player || saleBlock(player)) return false;

  const isGk = player.pos === 'BR' || player.role === 'GK';
  const gkCount = active.filter((p) => p.pos === 'BR' || p.role === 'GK').length;
  if (isGk && gkCount <= 1) return false;

  return true;
}

/** Active senior roster players that pass sell eligibility (window + roster + GK). */
export function listTransferSellEligiblePlayers(input: {
  readonly transferWindowOpen: boolean;
  readonly activePlayers: readonly PlayerRowDto[];
}): readonly PlayerRowDto[] {
  if (!input.transferWindowOpen) return [];
  const active = saleRoster(input.activePlayers);
  if (active.length <= TRANSFERS_THIN.MIN_ROSTER) return [];

  return active.filter((p) =>
    isTransferSellEligible({
      transferWindowOpen: input.transferWindowOpen,
      activePlayers: active,
      playerId: p.id,
    }),
  );
}
