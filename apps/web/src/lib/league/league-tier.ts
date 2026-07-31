/**
 * LFE-PROMOTION-01 — League tier SSOT + promotion outcome (D88–D94).
 * Pure domain only — no I/O.
 */

export type LeagueTier = 'iv' | 'iii' | 'ii' | 'i';

export const LEAGUE_TIERS_ASC: readonly LeagueTier[] = ['iv', 'iii', 'ii', 'i'] as const;

export type PromotionOutcomeKind = 'promote' | 'stay' | 'relegate';

export type PromotionOutcome = {
  readonly kind: PromotionOutcomeKind;
  /** Deterministic UI label from facts (Information Thin). */
  readonly label: string;
};

const TIER_LABEL: Record<LeagueTier, string> = {
  iv: 'IV liga',
  iii: 'III liga',
  ii: 'II liga',
  i: 'I liga',
};

/** Sole runtime SSOT for league display labels (D88 · Runtime SSOT Migration). */
export function resolveLeagueTierLabel(tier: LeagueTier): string {
  return TIER_LABEL[tier];
}

export function parseLeagueTier(raw: string | null | undefined): LeagueTier {
  if (raw === 'iii' || raw === 'ii' || raw === 'i' || raw === 'iv') return raw;
  return 'iv';
}

function tierIndex(tier: LeagueTier): number {
  return LEAGUE_TIERS_ASC.indexOf(tier);
}

/**
 * Pure derive: final table position + current tier → outcome (D89 · D93).
 * Does not mutate — report / Confirm consume separately (D91 · D90).
 */
export function resolvePromotionOutcome(
  position: number,
  tableSize: number,
  tier: LeagueTier,
): PromotionOutcome {
  const size = Math.max(1, Math.trunc(tableSize));
  const pos = Math.max(1, Math.min(size, Math.trunc(position)));
  const promoteCut = Math.min(2, size);
  const relegateCut = Math.max(1, size - 1);

  if (pos <= promoteCut) {
    if (tier === 'i') {
      return {
        kind: 'stay',
        label:
          pos === 1 ? 'Mistrz Ligii I — bez awansu wyżej' : 'Wicemistrz Ligii I — bez awansu wyżej',
      };
    }
    const next = applyLeagueTierOutcome(tier, 'promote');
    return {
      kind: 'promote',
      label: `Awans do ${resolveLeagueTierLabel(next)}`,
    };
  }

  if (pos >= relegateCut) {
    if (tier === 'iv') {
      return {
        kind: 'stay',
        label: 'Podłoga Ligii IV — bez spadku',
      };
    }
    const next = applyLeagueTierOutcome(tier, 'relegate');
    return {
      kind: 'relegate',
      label: `Spadek do ${resolveLeagueTierLabel(next)}`,
    };
  }

  return {
    kind: 'stay',
    label: `Utrzymanie w ${resolveLeagueTierLabel(tier)}`,
  };
}

/**
 * Sole pure applicator for next tier (D90 consumer uses this before persist).
 * Floor IV / ceiling I (D93).
 */
export function applyLeagueTierOutcome(tier: LeagueTier, kind: PromotionOutcomeKind): LeagueTier {
  const i = tierIndex(tier);
  if (kind === 'promote') {
    return LEAGUE_TIERS_ASC[Math.min(LEAGUE_TIERS_ASC.length - 1, i + 1)]!;
  }
  if (kind === 'relegate') {
    return LEAGUE_TIERS_ASC[Math.max(0, i - 1)]!;
  }
  return tier;
}
