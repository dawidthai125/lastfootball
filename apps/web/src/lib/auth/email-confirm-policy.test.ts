import { describe, expect, it } from 'vitest';

import {
  EMAIL_CONFIRM,
  emailGate,
  nextSendCount,
  resendBlock,
  type EmailConfirmRow,
} from '@/lib/auth/email-confirm-policy';

const NOW = Date.parse('2026-11-11T12:00:00.000Z');

function row(patch: Partial<EmailConfirmRow> = {}): EmailConfirmRow {
  return {
    confirmedAt: null,
    deadlineAt: new Date(NOW + EMAIL_CONFIRM.graceMs).toISOString(),
    lastSentAt: null,
    sendsToday: 0,
    sendsDay: null,
    ...patch,
  };
}

describe('email gate', () => {
  it('lets a manager with no row play', () => {
    expect(emailGate(null, NOW).confirmed).toBe(true);
  });

  it('hides the banner once the email is confirmed', () => {
    expect(emailGate(row({ confirmedAt: new Date(NOW).toISOString() }), NOW).showBanner).toBe(
      false,
    );
  });

  it('blocks rivalry at once and league matches only after the grace', () => {
    const open = emailGate(row(), NOW);
    expect(open.rivalsBlocked).toBe(true);
    expect(open.matchesBlocked).toBe(false);

    const late = emailGate(row({ deadlineAt: new Date(NOW - 1000).toISOString() }), NOW);
    expect(late.matchesBlocked).toBe(true);
  });
});

describe('resend brake', () => {
  it('waits out the short pause between letters', () => {
    const recent = new Date(NOW - 5 * 60 * 1000).toISOString();
    expect(resendBlock(row({ lastSentAt: recent }), NOW)).toBe('cooldown');
    const ready = new Date(NOW - EMAIL_CONFIRM.resendCooldownMs - 1).toISOString();
    expect(resendBlock(row({ lastSentAt: ready }), NOW)).toBeNull();
  });

  it('stops after four letters on the same utc day and resets the next day', () => {
    const full = row({ sendsToday: EMAIL_CONFIRM.resendPerDay, sendsDay: '2026-11-11' });
    expect(resendBlock(full, NOW)).toBe('daily');
    const nextDay = Date.parse('2026-11-12T00:10:00.000Z');
    expect(resendBlock(full, nextDay)).toBeNull();
    expect(nextSendCount(full, nextDay)).toEqual({ sendsToday: 1, sendsDay: '2026-11-12' });
  });
});
