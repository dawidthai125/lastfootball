/**
 * LFE-SPONSORS-01 — Thin sponsor domain (D95–D101).
 */

import { ECONOMY_THIN } from '@/lib/finance/types';
import { formatMoney } from '@/lib/finance/format-money';
import type { ClubSeasonPhase } from '@/lib/season/types';

export const SPONSOR_THIN_BRAND = {
  key: 'local-partner',
  name: 'Partner Lokalny',
} as const;

export type SponsorGoalKind = 'top_half';

export type SponsorBonusState = 'locked' | 'claimable' | 'claimed';

export type SponsorActionState = { error: string | null };

export const SPONSOR_ACTION_INITIAL: SponsorActionState = { error: null };

export type ClubSponsorContractRow = {
  readonly id: string;
  readonly club_id: string;
  readonly brand_key: string;
  readonly brand_name: string;
  readonly season_number: number;
  readonly base_amount: number;
  readonly bonus_amount: number;
  readonly goal_kind: string;
  readonly goal_target: number;
  readonly bonus_claimed_at: string | null;
  readonly base_paid_season_number: number | null;
  readonly renewal_accepted_at: string | null;
};

export type ClubSponsorsDto = {
  readonly brandKey: string;
  readonly brandName: string;
  readonly seasonNumber: number;
  readonly seasonLabel: string;
  readonly baseAmount: number;
  readonly basePayoutLabel: string;
  readonly bonusAmount: number;
  readonly bonusLabel: string;
  readonly goal: {
    readonly kind: SponsorGoalKind;
    readonly label: string;
    readonly target: number;
    readonly position: number | null;
    readonly complete: boolean;
    readonly progressLabel: string;
  };
  readonly bonusState: SponsorBonusState;
  readonly renewal: {
    readonly available: boolean;
    readonly accepted: boolean;
    readonly summaryLabel: string;
  } | null;
  readonly basePaidForCurrentSeason: boolean;
};

export type ResolveClubSponsorsInput = {
  readonly contract: ClubSponsorContractRow;
  readonly seasonPhase: ClubSeasonPhase;
  readonly playerPosition: number | null;
  readonly tableSize: number;
};

/** Pure sole UI DTO for Sponsors (D96). */
export function resolveClubSponsors(input: ResolveClubSponsorsInput): ClubSponsorsDto {
  const { contract, seasonPhase, playerPosition, tableSize } = input;
  const target = Math.max(1, Math.trunc(contract.goal_target));
  const size = Math.max(1, Math.trunc(tableSize));
  const complete =
    playerPosition != null && playerPosition >= 1 && playerPosition <= Math.min(target, size);

  let bonusState: SponsorBonusState = 'locked';
  if (contract.bonus_claimed_at) {
    bonusState = 'claimed';
  } else if (seasonPhase === 'offseason' && complete) {
    // Goal = finish season in top half — claim only after Season Closed.
    bonusState = 'claimable';
  }

  const progressLabel =
    playerPosition == null
      ? 'Pozycja: —'
      : complete
        ? `Cel spełniony (miejsce ${playerPosition})`
        : `Miejsce ${playerPosition} · cel: top ${target}`;

  const renewalAvailable = seasonPhase === 'offseason';
  const renewalAccepted = Boolean(contract.renewal_accepted_at);

  return {
    brandKey: contract.brand_key,
    brandName: contract.brand_name,
    seasonNumber: contract.season_number,
    seasonLabel: `Sezon ${contract.season_number}`,
    baseAmount: contract.base_amount,
    basePayoutLabel: formatMoney(contract.base_amount),
    bonusAmount: contract.bonus_amount,
    bonusLabel: formatMoney(contract.bonus_amount),
    goal: {
      kind: 'top_half',
      label: `Zakończ sezon w top ${target}`,
      target,
      position: playerPosition,
      complete,
      progressLabel,
    },
    bonusState,
    renewal: renewalAvailable
      ? {
          available: true,
          accepted: renewalAccepted,
          summaryLabel: renewalAccepted
            ? 'Odnowienie zaakceptowane — możesz przygotować sezon'
            : 'Zaakceptuj odnowienie (opcjonalnie) — Confirm nie jest zablokowany',
        }
      : null,
    basePaidForCurrentSeason: contract.base_paid_season_number === contract.season_number,
  };
}

export function buildStarterSponsorContractInsert(clubId: string, seasonNumber: number) {
  return {
    club_id: clubId,
    brand_key: SPONSOR_THIN_BRAND.key,
    brand_name: SPONSOR_THIN_BRAND.name,
    season_number: Math.max(1, Math.trunc(seasonNumber)),
    base_amount: ECONOMY_THIN.SPONSOR_BASE,
    bonus_amount: ECONOMY_THIN.SPONSOR_BONUS,
    goal_kind: 'top_half',
    goal_target: 6,
    bonus_claimed_at: null,
    base_paid_season_number: null,
    renewal_accepted_at: null,
  };
}
