import { intakeWaitDays, isOldIntakeId, type AcademyCandidate } from '@/lib/academy/intake';
import { academyLevel, clampAcademyLevel } from '@/lib/academy/levels';
import type { tryAdminClient } from '@/lib/supabase/admin';

// Not a 'use server' module on purpose: it takes a club id. Callers authorise the owner first.

type AdminDb = NonNullable<ReturnType<typeof tryAdminClient>>;
/** Session or service-role client: reads are limited to one club either way. */
export type AcademyReadDb = Pick<AdminDb, 'from'>;

export type AcademyRecords =
  | {
      readonly status: 'ok';
      readonly level: number;
      /** Number of the last intake, 0 before the first one. */
      readonly lastSeq: number;
      readonly open: {
        readonly seq: number;
        readonly candidates: readonly AcademyCandidate[];
      } | null;
      readonly waitDays: number;
    }
  /** The migration did not run yet: the old academy works. */
  | { readonly status: 'missing' }
  | { readonly status: 'error' };

const MISSING_CODES = new Set(['42703', '42P01', 'PGRST204', 'PGRST205']);

type IntakeRow = {
  readonly seq: number;
  readonly status: string;
  readonly candidates: readonly AcademyCandidate[];
  readonly created_at: string;
};

export async function loadAcademyRecords(
  db: AcademyReadDb,
  clubId: string,
  now: Date,
): Promise<AcademyRecords> {
  const [club, intakes, joined] = await Promise.all([
    db.from('clubs').select('academy_level').eq('id', clubId).maybeSingle(),
    // A new intake opens only after the last one closed, so one row says it all.
    db
      .from('academy_intakes' as never)
      .select('seq, status, candidates, created_at')
      .eq('club_id', clubId)
      .order('seq', { ascending: false })
      .limit(1),
    db.from('players').select('id, created_at').eq('club_id', clubId).like('id', 'a-%'),
  ]);
  const error = club.error ?? intakes.error ?? joined.error;
  if (error) return { status: MISSING_CODES.has(error.code ?? '') ? 'missing' : 'error' };
  if (!club.data) return { status: 'error' };

  const level = clampAcademyLevel((club.data as { academy_level?: number }).academy_level);
  const last = ((intakes.data ?? []) as unknown as IntakeRow[])[0] ?? null;
  // Juniors of the old academy count only until the first stored intake.
  const dates = last
    ? [last.created_at]
    : ((joined.data ?? []) as { id: string; created_at: string }[])
        .filter((p) => isOldIntakeId(p.id, clubId))
        .map((p) => p.created_at);
  return {
    status: 'ok',
    level,
    lastSeq: last?.seq ?? 0,
    open: last?.status === 'open' ? { seq: last.seq, candidates: last.candidates } : null,
    waitDays: intakeWaitDays(dates, now, academyLevel(level).intakeEveryDays),
  };
}
