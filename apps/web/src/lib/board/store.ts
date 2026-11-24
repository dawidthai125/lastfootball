import {
  fromSeasonHistoryRow,
  type SeasonHistory,
  type SeasonHistoryRow,
} from '@/lib/board/season-history';
import { boardTaskLedgerLabel, type BoardTaskClaim, type BoardTaskDto } from '@/lib/board/tasks';
import { tryAdminClient } from '@/lib/supabase/admin';

// Not a 'use server' module on purpose: it takes a club id. Callers authorise the owner first.

type AdminDb = NonNullable<ReturnType<typeof tryAdminClient>>;
/** Session or service-role client: reads are limited to one club either way. */
export type BoardReadDb = Pick<AdminDb, 'from'>;
export type BoardWriteDb = Pick<AdminDb, 'from' | 'rpc'>;

export type BoardRecords =
  | {
      readonly status: 'ok';
      readonly history: readonly SeasonHistory[];
      readonly claims: readonly BoardTaskClaim[];
    }
  /** The migration did not run yet: pages hide the feature, a season start waits. */
  | { readonly status: 'missing' }
  | { readonly status: 'error' };

/** Older seasons weigh under 4% in prestige. */
const HISTORY_SEASONS = 16;

const MISSING_CODES = new Set(['42P01', '42883', 'PGRST202', 'PGRST205']);

function failure(error: { readonly code?: string }): 'missing' | 'error' {
  return MISSING_CODES.has(error.code ?? '') ? 'missing' : 'error';
}

export async function loadBoardRecords(db: BoardReadDb, clubId: string): Promise<BoardRecords> {
  const [history, claims] = await Promise.all([
    db
      .from('club_season_history' as never)
      .select(
        'season_number, league_tier, position, table_size, points, won, drawn, lost, goals_for, goals_against, cup_round_reached, outcome',
      )
      .eq('club_id', clubId)
      .order('season_number', { ascending: false })
      .limit(HISTORY_SEASONS),
    db
      .from('club_board_task_claims' as never)
      .select('season_number, block, amount')
      .eq('club_id', clubId)
      .order('season_number', { ascending: false })
      .limit(HISTORY_SEASONS * 4),
  ]);
  const error = history.error ?? claims.error;
  if (error) return { status: failure(error) };
  return {
    status: 'ok',
    history: ((history.data ?? []) as unknown as SeasonHistoryRow[]).map(fromSeasonHistoryRow),
    claims: (
      (claims.data ?? []) as unknown as { season_number: number; block: number; amount: number }[]
    ).map((row) => ({ seasonNumber: row.season_number, block: row.block, amount: row.amount })),
  };
}

/**
 * Claim, cash and ledger in one transaction (`claim_board_task`). False when nothing is
 * known to be paid. A repeat of a paid task is true and pays nothing.
 */
export async function payBoardTask(
  db: BoardWriteDb,
  input: { readonly clubId: string; readonly seasonNumber: number; readonly task: BoardTaskDto },
): Promise<boolean> {
  const { data, error } = await db.rpc(
    'claim_board_task' as never,
    {
      p_club_id: input.clubId,
      p_season: input.seasonNumber,
      p_block: input.task.block,
      p_kind: input.task.kind,
      p_amount: input.task.reward,
      p_label: boardTaskLedgerLabel(input.task),
    } as never,
  );
  if (error || !data) {
    console.error('payBoardTask failed', { block: input.task.block, code: error?.code });
    return false;
  }
  return true;
}
