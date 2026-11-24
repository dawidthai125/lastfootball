import { describe, expect, it } from 'vitest';

import {
  BOARD_TASK_BLOCKS,
  boardTaskReward,
  parseBoardTaskBlock,
  pickBoardTaskKind,
  resolveBoardTaskNote,
  resolveBoardTasks,
  type BoardTaskClaim,
  type BoardTaskKind,
} from '@/lib/board/tasks';
import type { FixtureDto } from '@/lib/fixtures/types';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import { aiTableStrength, scoreFromStrength } from '@/lib/league/simulate-ai-results';

type Fixture = Pick<
  FixtureDto,
  'matchday' | 'competition' | 'isHome' | 'status' | 'homeScore' | 'awayScore'
>;

/** 22 fixtures, home on odd days. `scores` are ours-theirs from matchday 1 on. */
function season(...scores: readonly string[]): Fixture[] {
  return Array.from({ length: 22 }, (_, i) => {
    const [ours, theirs] = (scores[i] ?? '').split('-').map(Number);
    const isHome = i % 2 === 0;
    const played = scores[i] !== undefined;
    return {
      matchday: i + 1,
      competition: 'league',
      isHome,
      status: played ? 'played' : i === scores.length ? 'upcoming' : 'scheduled',
      homeScore: played ? (isHome ? ours! : theirs!) : null,
      awayScore: played ? (isHome ? theirs! : ours!) : null,
    };
  });
}

/** A club whose first block of season 1 asks for this kind. */
function clubFor(kind: BoardTaskKind): string {
  for (let i = 0; ; i += 1) if (pickBoardTaskKind(`c${i}`, 1, 1) === kind) return `c${i}`;
}

function first(kind: BoardTaskKind, scores: readonly string[], claims: BoardTaskClaim[] = []) {
  return resolveBoardTasks({
    clubId: clubFor(kind),
    seasonNumber: 1,
    leagueTier: 'iv',
    fixtures: season(...scores),
    claims,
  })[0]!;
}

describe('board task pick', () => {
  it('is fixed per club, season and block, and no kind repeats in a season', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i += 1) {
      const kinds = BOARD_TASK_BLOCKS.map((block) => pickBoardTaskKind(`club-${i}`, 3, block));
      expect(kinds).toEqual(BOARD_TASK_BLOCKS.map((b) => pickBoardTaskKind(`club-${i}`, 3, b)));
      expect(new Set(kinds).size).toBe(4);
      seen.add(kinds.join());
    }
    expect(seen.size).toBeGreaterThan(60);
    const perSeason = [1, 2, 3, 4, 5, 6].map((s) => pickBoardTaskKind('club-1', s, 1));
    expect(new Set(perSeason).size).toBeGreaterThan(1);
  });
});

describe('board task state', () => {
  it('waits, runs and ends with its five matchdays', () => {
    const fresh = resolveBoardTasks({
      clubId: 'c',
      seasonNumber: 1,
      leagueTier: 'iv',
      fixtures: season(),
      claims: [],
    });
    expect(fresh.map((t) => t.state)).toEqual(['active', 'upcoming', 'upcoming', 'upcoming']);
    expect(fresh.map((t) => t.matchdaysLabel)).toEqual([
      'kolejki 1–5',
      'kolejki 6–10',
      'kolejki 11–15',
      'kolejki 16–20',
    ]);
    const none = resolveBoardTasks({
      clubId: 'c',
      seasonNumber: 1,
      leagueTier: 'iv',
      fixtures: [],
      claims: [],
    });
    expect(none.every((t) => t.state === 'upcoming')).toBe(true);
  });

  it('counts points, wins, goals and clean sheets from stored scores', () => {
    expect(first('points', ['1-0', '1-1', '0-0']).state).toBe('active');
    expect(first('points', ['1-0', '1-1', '1-0']).state).toBe('done');
    expect(first('points', ['1-0', '0-1', '0-1', '0-1', '2-0']).state).toBe('failed');
    expect(first('wins', ['1-0', '0-1', '2-1']).state).toBe('done');
    expect(first('goals', ['3-3', '3-4', '1-5'])).toMatchObject({ state: 'done', progress: 7 });
    expect(first('goals', ['1-0', '1-0', '1-0', '1-0', '1-0']).state).toBe('failed');
    expect(first('clean_sheets', ['0-0', '0-3', '1-0']).state).toBe('done');
  });

  it('fails as soon as the target is out of reach', () => {
    expect(first('points', ['0-1', '0-1', '0-1']).state).toBe('failed');
    expect(first('home_unbeaten', ['0-1']).state).toBe('failed');
  });

  it('needs the whole block for the home record', () => {
    expect(first('home_unbeaten', ['1-0', '0-9', '1-1', '0-9']).state).toBe('active');
    expect(first('home_unbeaten', ['1-0', '0-9', '1-1', '0-9', '2-0'])).toMatchObject({
      state: 'done',
      progress: 3,
      target: 3,
    });
  });

  it('ignores cup, challenge and human matches', () => {
    const fixtures = season('0-1').map((f) =>
      f.status === 'played' ? f : { ...f, status: 'played' as const, homeScore: 9, awayScore: 9 },
    );
    for (const competition of ['cup', 'challenge', 'human'] as const) {
      const tasks = resolveBoardTasks({
        clubId: 'c',
        seasonNumber: 1,
        leagueTier: 'iv',
        fixtures: fixtures.map((f) => ({ ...f, competition })),
        claims: [],
      });
      expect(tasks.every((t) => t.state === 'upcoming')).toBe(true);
    }
  });

  it('shows a claim only in its own season and keeps the paid amount', () => {
    const wins = ['1-0', '2-0'];
    const claim = { seasonNumber: 1, block: 1, amount: 4_321 };
    expect(first('wins', wins, [claim])).toMatchObject({ state: 'claimed', reward: 4_321 });
    expect(first('wins', wins, [{ ...claim, seasonNumber: 2 }]).state).toBe('done');
    expect(first('wins', wins, [{ ...claim, block: 2 }]).state).toBe('done');
  });

  it('tells the manager only about a reward to collect', () => {
    expect(resolveBoardTaskNote([first('wins', ['1-0'])])).toBeNull();
    expect(resolveBoardTaskNote([first('wins', ['1-0', '1-0'])])).toMatch(/Do odbioru 5\s?000\s€/);
  });
});

describe('board task reward and block', () => {
  it('follows the match reward scale', () => {
    expect(['iv', 'iii', 'ii', 'i'].map(boardTaskReward)).toEqual([5_000, 5_500, 6_000, 6_500]);
  });

  it('accepts only the four blocks', () => {
    expect(['1', '4'].map(parseBoardTaskBlock)).toEqual([1, 4]);
    for (const bad of [null, '', '0', '5', '1.5', '1 ', ' 1', '-1', 'x']) {
      expect(parseBoardTaskBlock(bad)).toBeNull();
    }
  });
});

/** Completed tasks per season for a club this much stronger than its rivals. */
function completedPerSeason(edge: number): { mean: number; byKind: Record<string, number> } {
  const CLUBS = 400;
  const done: Record<string, number> = {};
  const asked: Record<string, number> = {};
  let total = 0;
  for (let c = 0; c < CLUBS; c += 1) {
    const clubId = `sim-${c}`;
    const plan = planClubFixtures(clubId);
    const average =
      plan.reduce((sum, p) => sum + aiTableStrength(p.opponentClubId, 'iv'), 0) / plan.length;
    const fixtures = plan.map((p): Fixture => {
      const gap = average + edge - aiTableStrength(p.opponentClubId, 'iv');
      const score = scoreFromStrength({
        gap: p.isHome ? gap : -gap,
        seed: `${clubId}|${p.matchday}`,
      });
      return { ...p, competition: 'league', status: 'played', ...score };
    });
    const tasks = resolveBoardTasks({
      clubId,
      seasonNumber: 1,
      leagueTier: 'iv',
      fixtures,
      claims: [],
    });
    for (const task of tasks) {
      asked[task.kind] = (asked[task.kind] ?? 0) + 1;
      if (task.state !== 'done') continue;
      done[task.kind] = (done[task.kind] ?? 0) + 1;
      total += 1;
    }
  }
  const byKind = Object.fromEntries(Object.keys(asked).map((k) => [k, (done[k] ?? 0) / asked[k]!]));
  return { mean: total / CLUBS, byKind };
}

describe('board task balance (GDD §26.8)', () => {
  it('pays a mid-table club about 10 000 EUR a season', () => {
    const mid = completedPerSeason(0);
    expect(mid.mean * boardTaskReward('iv')).toBeGreaterThan(9_000);
    expect(mid.mean * boardTaskReward('iv')).toBeLessThan(11_500);
    for (const rate of Object.values(mid.byKind)) {
      expect(rate).toBeGreaterThan(0.35);
      expect(rate).toBeLessThan(0.7);
    }
  });

  it('gives a strong club more and a weak club less, never all or nothing', () => {
    const strong = completedPerSeason(6).mean;
    const weak = completedPerSeason(-6).mean;
    expect(strong).toBeGreaterThan(2.6);
    expect(strong).toBeLessThan(4);
    expect(weak).toBeGreaterThan(0.2);
    expect(weak).toBeLessThan(1.6);
  });
});
