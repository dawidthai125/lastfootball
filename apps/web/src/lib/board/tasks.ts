/**
 * Board tasks (D131): one per five league matchdays, derived from stored league fixtures.
 * Pure. Not a daily system and never the Hub primary action (GDD §20).
 */

import { formatMoney } from '@/lib/finance/format-money';
import { ECONOMY_THIN } from '@/lib/finance/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import { unitHash } from '@/lib/match/hash-seed';
import { rewardForLeagueRung } from '@/lib/sponsors/crowd';

export const BOARD_TASK_BLOCKS = [1, 2, 3, 4] as const;
export type BoardTaskBlock = (typeof BOARD_TASK_BLOCKS)[number];

const BLOCK_SIZE = 5;

const BOARD_TASK_KINDS = ['points', 'goals', 'clean_sheets', 'home_unbeaten', 'wins'] as const;
export type BoardTaskKind = (typeof BOARD_TASK_KINDS)[number];

/** Fixed per five matches, so a mid-table club of any league completes about half. */
const TARGET: Record<Exclude<BoardTaskKind, 'home_unbeaten'>, number> = {
  points: 7,
  goals: 7,
  clean_sheets: 2,
  wins: 2,
};

const TITLE: Record<BoardTaskKind, string> = {
  points: `Zdobądź ${TARGET.points} punktów`,
  goals: `Strzel ${TARGET.goals} goli`,
  clean_sheets: `Zagraj ${TARGET.clean_sheets} mecze bez straty gola`,
  home_unbeaten: 'Nie przegraj meczu u siebie',
  wins: `Wygraj ${TARGET.wins} mecze`,
};

export type BoardTaskState = 'upcoming' | 'active' | 'done' | 'failed' | 'claimed';

export type BoardTaskDto = {
  readonly block: BoardTaskBlock;
  readonly kind: BoardTaskKind;
  readonly title: string;
  readonly matchdaysLabel: string;
  readonly state: BoardTaskState;
  readonly progress: number;
  readonly target: number;
  readonly reward: number;
  readonly rewardLabel: string;
};

export type BoardTaskClaim = {
  readonly seasonNumber: number;
  readonly block: number;
  readonly amount: number;
};

type BoardTaskFixture = Pick<
  FixtureDto,
  'matchday' | 'competition' | 'isHome' | 'status' | 'homeScore' | 'awayScore'
>;

/** No kind repeats inside a season. */
export function pickBoardTaskKind(
  clubId: string,
  seasonNumber: number,
  block: BoardTaskBlock,
): BoardTaskKind {
  const order = [...BOARD_TASK_KINDS]
    .map((kind) => ({ kind, key: unitHash(`board-task|${clubId}|s${seasonNumber}|${kind}`) }))
    .sort((a, b) => a.key - b.key);
  return order[block - 1]!.kind;
}

export function boardTaskReward(leagueTier: string): number {
  return rewardForLeagueRung(ECONOMY_THIN.BOARD_TASK_REWARD, leagueTier);
}

export function parseBoardTaskBlock(raw: unknown): BoardTaskBlock | null {
  return BOARD_TASK_BLOCKS.find((block) => String(block) === String(raw)) ?? null;
}

export function boardTaskLedgerLabel(task: BoardTaskDto): string {
  return `Zadanie zarządu · ${task.matchdaysLabel}`;
}

export function resolveBoardTasks(input: {
  readonly clubId: string;
  readonly seasonNumber: number;
  readonly leagueTier: string;
  readonly fixtures: readonly BoardTaskFixture[];
  readonly claims: readonly BoardTaskClaim[];
}): readonly BoardTaskDto[] {
  const league = input.fixtures.filter((f) => f.competition === 'league');
  const nextMatchday = Math.min(...league.filter((f) => !isPlayed(f)).map((f) => f.matchday));

  return BOARD_TASK_BLOCKS.map((block) => {
    const to = block * BLOCK_SIZE;
    const from = to - BLOCK_SIZE + 1;
    const kind = pickBoardTaskKind(input.clubId, input.seasonNumber, block);
    const claim = input.claims.find(
      (c) => c.seasonNumber === input.seasonNumber && c.block === block,
    );
    const fixtures = league.filter((f) => f.matchday >= from && f.matchday <= to);
    const started = fixtures.some(isPlayed) || (nextMatchday >= from && nextMatchday <= to);
    const score = scoreBlock(kind, fixtures);
    const reward = claim?.amount ?? boardTaskReward(input.leagueTier);
    const state: BoardTaskState = claim
      ? 'claimed'
      : score.done
        ? 'done'
        : score.lost
          ? 'failed'
          : started
            ? 'active'
            : 'upcoming';
    return {
      block,
      kind,
      title: TITLE[kind],
      matchdaysLabel: `kolejki ${from}–${to}`,
      state,
      progress: Math.min(score.progress, score.target),
      target: score.target,
      reward,
      rewardLabel: formatMoney(reward),
    };
  });
}

/** One line for the messages list. Null when there is nothing to collect. */
export function resolveBoardTaskNote(tasks: readonly BoardTaskDto[]): string | null {
  const done = tasks.filter((task) => task.state === 'done');
  if (done.length === 0) return null;
  const total = formatMoney(done.reduce((sum, task) => sum + task.reward, 0));
  return done.length === 1
    ? `Zadanie zarządu wykonane. Do odbioru ${total}.`
    : `Wykonane zadania zarządu: ${done.length}. Do odbioru ${total}.`;
}

function isPlayed(f: BoardTaskFixture): boolean {
  return f.status === 'played' && f.homeScore != null && f.awayScore != null;
}

function scoreBlock(
  kind: BoardTaskKind,
  fixtures: readonly BoardTaskFixture[],
): { progress: number; target: number; done: boolean; lost: boolean } {
  const played = fixtures.filter(isPlayed).map((f) => ({
    isHome: f.isHome,
    ours: (f.isHome ? f.homeScore : f.awayScore) ?? 0,
    theirs: (f.isHome ? f.awayScore : f.homeScore) ?? 0,
  }));
  const left = BLOCK_SIZE - played.length;

  if (kind === 'home_unbeaten') {
    const home = played.filter((m) => m.isHome);
    const held = home.filter((m) => m.ours >= m.theirs).length;
    const target = fixtures.filter((f) => f.isHome).length;
    const lost = held < home.length;
    return { progress: held, target, done: !lost && left <= 0 && target > 0, lost };
  }

  const won = played.filter((m) => m.ours > m.theirs).length;
  const drawn = played.filter((m) => m.ours === m.theirs).length;
  const target = TARGET[kind];
  const progress = {
    points: 3 * won + drawn,
    goals: played.reduce((sum, m) => sum + m.ours, 0),
    clean_sheets: played.filter((m) => m.theirs === 0).length,
    wins: won,
  }[kind];
  const best = {
    points: 3 * left,
    goals: left > 0 ? Infinity : 0,
    clean_sheets: left,
    wins: left,
  }[kind];
  return {
    progress,
    target,
    done: progress >= target,
    lost: progress < target && progress + best < target,
  };
}
