import { describe, expect, it } from 'vitest';

import { generateAcademyCandidates } from '@/lib/academy/intake';
import { academyLevel } from '@/lib/academy/levels';
import { boardTaskReward } from '@/lib/board/tasks';
import { ECONOMY_THIN, type MatchRewardOutcome } from '@/lib/finance/types';
import { resolveFixtureReward } from '@/lib/finance/resolve-match-reward';
import { LEAGUE_TIERS_ASC, type LeagueTier } from '@/lib/league/league-tier';
import { sponsorFromCrowd } from '@/lib/sponsors/crowd';
import { matchWageDue, wageFromSkill } from '@/lib/squad/truth';
import { aiSaleAsk } from '@/lib/transfers/fair-sale';
import { STADIUM_UPGRADE_COST, ticketIncome } from '@/lib/stadium/levels';

/** Season results per side: wins, draws, losses. 11 home and 11 away. */
type Split = readonly [number, number, number];
type Profile = { readonly home: Split; readonly away: Split; readonly topHalf: boolean };

const CHAMPION: Profile = { home: [9, 2, 0], away: [7, 2, 2], topHalf: true };
const MID: Profile = { home: [5, 3, 3], away: [3, 3, 5], topHalf: false };
const BOTTOM: Profile = { home: [2, 3, 6], away: [1, 2, 8], topHalf: false };

const SCORES: Record<MatchRewardOutcome, readonly [number, number]> = {
  win: [1, 0],
  draw: [0, 0],
  loss: [0, 1],
};
const BAND = { win: 'lively', draw: 'steady', loss: 'quiet' } as const;
const OUTCOMES = ['win', 'draw', 'loss'] as const;

function matchWage(skill: number): number {
  return matchWageDue(
    Array.from({ length: 18 }, () => ({ skill, age: 27, wage: wageFromSkill(skill, 27) })),
  );
}

function gate(profile: Profile, stands: number): number {
  return OUTCOMES.reduce(
    (sum, outcome, i) =>
      sum + profile.home[i]! * ticketIncome({ standsLevel: stands, attendance: BAND[outcome] }),
    0,
  );
}

/** Season result without starter cash, transfers and the season goal bonus. */
function seasonResult(profile: Profile, tier: LeagueTier = 'iv', skill = 65, stands = 0): number {
  const rewards = OUTCOMES.reduce((sum, outcome, i) => {
    const [homeScore, awayScore] = SCORES[outcome];
    const reward = resolveFixtureReward({
      competition: 'league',
      matchday: 1,
      homeScore,
      awayScore,
      isHome: true,
      leagueTier: tier,
    })!;
    return sum + (profile.home[i]! + profile.away[i]!) * reward.amount;
  }, 0);
  const quote = sponsorFromCrowd({ attendance: 'steady', leagueTier: tier });
  const sponsor = quote.base + (profile.topHalf ? quote.bonus : 0);
  return rewards + gate(profile, stands) + sponsor - 22 * matchWage(skill);
}

describe('season projection (GDD §26.8)', () => {
  it('holds the IV-league targets with stands 0', () => {
    expect(seasonResult(MID)).toBeGreaterThanOrEqual(-15_000);
    expect(seasonResult(MID)).toBeLessThanOrEqual(10_000);
    // Sixth place also takes the sponsor bonus and must stay in the band.
    expect(seasonResult({ ...MID, topHalf: true })).toBeLessThanOrEqual(10_000);
    expect(seasonResult(CHAMPION)).toBeGreaterThanOrEqual(60_000);
    expect(seasonResult(CHAMPION)).toBeLessThanOrEqual(110_000);
    expect(seasonResult(BOTTOM)).toBeGreaterThanOrEqual(-70_000);
    expect(seasonResult(BOTTOM)).toBeLessThanOrEqual(-35_000);
  });

  it('adds about 10 000 EUR of board tasks for a mid-table club, and more on higher rungs', () => {
    // About two of four tasks: measured in board/tasks.test.ts.
    const withTasks = seasonResult(MID) + 2 * boardTaskReward('iv');
    expect(withTasks - seasonResult(MID)).toBe(10_000);
    expect(withTasks).toBeLessThanOrEqual(10_000);
    expect(LEAGUE_TIERS_ASC.map((tier) => 2 * boardTaskReward(tier))).toEqual([
      10_000, 11_000, 12_000, 13_000,
    ]);
    // All four tasks every season still leave a bottom club short.
    expect(seasonResult(BOTTOM) + 4 * boardTaskReward('iv')).toBeLessThan(-30_000);
  });

  it('keeps starter cash alive for a bottom club through one season, not two', () => {
    const afterOne = ECONOMY_THIN.STARTER_CASH + seasonResult(BOTTOM);
    expect(afterOne).toBeGreaterThan(0);
    expect(afterOne + seasonResult(BOTTOM)).toBeLessThan(0);
  });

  it('repays each stands upgrade in 1.5 to 2.5 seasons for a mid-table club', () => {
    for (const level of [0, 1, 2]) {
      const extra = gate(MID, level + 1) - gate(MID, level);
      const seasons = STADIUM_UPGRADE_COST.stands[level]! / extra;
      expect(seasons).toBeGreaterThanOrEqual(1.5);
      expect(seasons).toBeLessThanOrEqual(2.5);
    }
  });

  it('keeps a mid-table club solvent on every rung as skills rise', () => {
    // Middle of the rung's strength band, never below the starter squad.
    const skill: Record<LeagueTier, number> = { iv: 65, iii: 65, ii: 70, i: 78 };
    for (const tier of LEAGUE_TIERS_ASC) {
      expect(seasonResult(BOTTOM, tier, skill[tier])).toBeLessThan(-30_000);
      expect(seasonResult(CHAMPION, tier, skill[tier])).toBeGreaterThan(60_000);
      expect(seasonResult(CHAMPION, tier, skill[tier])).toBeLessThan(150_000);
    }
    const results = LEAGUE_TIERS_ASC.map((tier) => seasonResult(MID, tier, skill[tier]));
    for (const [i, result] of results.entries()) {
      expect(result).toBeGreaterThanOrEqual(-15_000);
      expect(result).toBeLessThanOrEqual(40_000);
      if (i > 0) expect(result).toBeGreaterThan(results[i - 1]!);
    }
  });
});

/**
 * One academy season: an intake as often as the level allows over 22 match days, every junior
 * sold at once to a computer club, upkeep with each match. First candidate: the average one.
 */
function academySeason(level: number): number {
  const rules = academyLevel(level);
  let fees = 0;
  let count = 0;
  for (let club = 0; club < 100; club += 1) {
    for (let seq = 1; seq <= 10; seq += 1) {
      fees += aiSaleAsk({
        ...generateAcademyCandidates(`club-${club}`, seq, level)[0]!,
        origin: 'academy',
      });
      count += 1;
    }
  }
  return (22 / rules.intakeEveryDays) * (fees / count) - 22 * rules.upkeep;
}

describe('academy projection (LFE-ACADEMY-02 plan, section 4)', () => {
  it('earns about the same on every level when all juniors are sold at once', () => {
    const planned = [33_000, 28_000, 29_000, 32_000];
    planned.forEach((plan, level) => {
      const result = academySeason(level);
      expect(result, `level ${level}`).toBeGreaterThanOrEqual(plan * 0.85);
      expect(result, `level ${level}`).toBeLessThanOrEqual(plan * 1.15);
    });
  });

  it('pays the academy back only with players who play', () => {
    const extra = academySeason(3) - academySeason(0);
    expect(extra).toBeLessThan(5_000);
    const played = { skill: 62, age: 19, origin: 'academy', seniorMatches: 22 };
    expect(aiSaleAsk(played)).toBeGreaterThan(55_000);
  });
});

describe('resolveFixtureReward', () => {
  const win = { homeScore: 1, awayScore: 0, isHome: true, matchday: 1 };

  it('scales league pay by rung and leaves the human league on the IV rung', () => {
    expect(resolveFixtureReward({ ...win, competition: 'league', leagueTier: 'i' })?.amount).toBe(
      17_000,
    );
    expect(resolveFixtureReward({ ...win, competition: 'human', leagueTier: 'i' })?.amount).toBe(
      ECONOMY_THIN.REWARD_WIN,
    );
  });

  it('pays the cup by round, also away and after elimination', () => {
    const cup = (round: number, home: number, away: number, isHome = true, leagueTier = 'iv') =>
      resolveFixtureReward({
        competition: 'cup',
        matchday: 100 + round,
        homeScore: home,
        awayScore: away,
        isHome,
        leagueTier,
      })?.amount;
    expect([1, 2, 3, 4].map((r) => cup(r, 1, 0))).toEqual([12_000, 14_000, 17_000, 30_000]);
    expect([1, 2, 3, 4].map((r) => cup(r, 0, 1))).toEqual([4_000, 4_000, 4_000, 10_000]);
    expect(cup(2, 0, 3, false)).toBe(14_000);
    expect(cup(1, 1, 0, true, 'i')).toBeGreaterThan(12_000);
  });

  it('pays nothing in challenges', () => {
    expect(resolveFixtureReward({ ...win, competition: 'challenge', leagueTier: 'iv' })).toBeNull();
  });
});
