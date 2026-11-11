/** Email confirm rules. Numbers live here so the database function receives the same bonus. */

export const EMAIL_CONFIRM = {
  /** League matches stay open this long. Rivalry waits for a confirmed email. */
  graceMs: 5 * 24 * 60 * 60 * 1000,
  /** Our token lifetime. Supabase's own letter may expire sooner (often 1 hour). */
  linkMs: 24 * 60 * 60 * 1000,
  resendCooldownMs: 15 * 60 * 1000,
  resendPerDay: 4,
  bonusEur: 10_000,
} as const;

export type EmailConfirmRow = {
  confirmedAt: string | null;
  deadlineAt: string;
  lastSentAt: string | null;
  sendsToday: number;
  sendsDay: string | null;
};

export type EmailGate = {
  confirmed: boolean;
  showBanner: boolean;
  rivalsBlocked: boolean;
  matchesBlocked: boolean;
  deadlineAt: string | null;
};

export type ResendBlock = 'cooldown' | 'daily';

const OPEN_GATE: EmailGate = {
  confirmed: true,
  showBanner: false,
  rivalsBlocked: false,
  matchesBlocked: false,
  deadlineAt: null,
};

export function deadlineFrom(nowMs: number): string {
  return new Date(nowMs + EMAIL_CONFIRM.graceMs).toISOString();
}

export function linkExpiryFrom(nowMs: number): string {
  return new Date(nowMs + EMAIL_CONFIRM.linkMs).toISOString();
}

export function utcDay(nowMs: number): string {
  return new Date(nowMs).toISOString().slice(0, 10);
}

/** Missing row fails open: a late migration must not lock every manager out. */
export function emailGate(row: EmailConfirmRow | null, nowMs: number): EmailGate {
  if (!row || row.confirmedAt) return OPEN_GATE;
  const deadline = Date.parse(row.deadlineAt);
  const matchesBlocked = Number.isFinite(deadline) && nowMs >= deadline;
  return {
    confirmed: false,
    showBanner: true,
    rivalsBlocked: true,
    matchesBlocked,
    deadlineAt: row.deadlineAt,
  };
}

export function resendBlock(row: EmailConfirmRow, nowMs: number): ResendBlock | null {
  if (row.lastSentAt) {
    const sent = Date.parse(row.lastSentAt);
    if (Number.isFinite(sent) && nowMs - sent < EMAIL_CONFIRM.resendCooldownMs) return 'cooldown';
  }
  const day = utcDay(nowMs);
  const count = row.sendsDay === day ? row.sendsToday : 0;
  if (count >= EMAIL_CONFIRM.resendPerDay) return 'daily';
  return null;
}

export function nextSendCount(
  row: EmailConfirmRow,
  nowMs: number,
): {
  sendsToday: number;
  sendsDay: string;
} {
  const day = utcDay(nowMs);
  const count = row.sendsDay === day ? row.sendsToday : 0;
  return { sendsToday: count + 1, sendsDay: day };
}
