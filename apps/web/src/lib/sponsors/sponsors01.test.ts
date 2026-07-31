import { describe, expect, it } from 'vitest';

import { ECONOMY_THIN } from '@/lib/finance/types';
import { formatMoney } from '@/lib/finance/format-money';
import {
  buildStarterSponsorContractInsert,
  resolveClubSponsors,
  SPONSOR_THIN_BRAND,
  type ClubSponsorContractRow,
} from '@/lib/sponsors/types';

function contract(overrides: Partial<ClubSponsorContractRow> = {}): ClubSponsorContractRow {
  return {
    id: 'sp-1',
    club_id: 'c1',
    brand_key: SPONSOR_THIN_BRAND.key,
    brand_name: SPONSOR_THIN_BRAND.name,
    season_number: 1,
    base_amount: ECONOMY_THIN.SPONSOR_BASE,
    bonus_amount: ECONOMY_THIN.SPONSOR_BONUS,
    goal_kind: 'top_half',
    goal_target: 6,
    bonus_claimed_at: null,
    base_paid_season_number: null,
    renewal_accepted_at: null,
    ...overrides,
  };
}

describe('ECONOMY_THIN sponsor constants', () => {
  it('matches GDD-SPONSORS-01 Thin amounts', () => {
    expect(ECONOMY_THIN.SPONSOR_BASE).toBe(15_000);
    expect(ECONOMY_THIN.SPONSOR_BONUS).toBe(10_000);
  });
});

describe('buildStarterSponsorContractInsert', () => {
  it('seeds Thin brand without base paid', () => {
    const row = buildStarterSponsorContractInsert('club-1', 1);
    expect(row.brand_key).toBe('local-partner');
    expect(row.base_amount).toBe(ECONOMY_THIN.SPONSOR_BASE);
    expect(row.bonus_amount).toBe(ECONOMY_THIN.SPONSOR_BONUS);
    expect(row.base_paid_season_number).toBeNull();
    expect(row.bonus_claimed_at).toBeNull();
  });
});

describe('resolveClubSponsors', () => {
  it('builds DTO with goal progress and locked bonus in-season', () => {
    const dto = resolveClubSponsors({
      contract: contract(),
      seasonPhase: 'in_season',
      playerPosition: 4,
      tableSize: 12,
    });
    expect(dto.brandName).toBe('Partner Lokalny');
    expect(dto.basePayoutLabel).toBe(formatMoney(ECONOMY_THIN.SPONSOR_BASE));
    expect(dto.goal.complete).toBe(true);
    expect(dto.bonusState).toBe('locked');
    expect(dto.renewal).toBeNull();
  });

  it('makes bonus claimable in offseason when top half', () => {
    const dto = resolveClubSponsors({
      contract: contract(),
      seasonPhase: 'offseason',
      playerPosition: 6,
      tableSize: 12,
    });
    expect(dto.goal.complete).toBe(true);
    expect(dto.bonusState).toBe('claimable');
    expect(dto.renewal?.available).toBe(true);
    expect(dto.renewal?.accepted).toBe(false);
  });

  it('keeps bonus locked when miss (position > 6)', () => {
    const dto = resolveClubSponsors({
      contract: contract(),
      seasonPhase: 'offseason',
      playerPosition: 7,
      tableSize: 12,
    });
    expect(dto.goal.complete).toBe(false);
    expect(dto.bonusState).toBe('locked');
  });

  it('marks claimed when bonus_claimed_at set', () => {
    const dto = resolveClubSponsors({
      contract: contract({ bonus_claimed_at: '2026-07-31T00:00:00.000Z' }),
      seasonPhase: 'offseason',
      playerPosition: 2,
      tableSize: 12,
    });
    expect(dto.bonusState).toBe('claimed');
  });

  it('shows renewal accepted when renewal_accepted_at set', () => {
    const dto = resolveClubSponsors({
      contract: contract({ renewal_accepted_at: '2026-07-31T00:00:00.000Z' }),
      seasonPhase: 'offseason',
      playerPosition: 8,
      tableSize: 12,
    });
    expect(dto.renewal?.accepted).toBe(true);
  });
});
