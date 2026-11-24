import { describe, expect, it } from 'vitest';

import { EMAIL_PATTERN } from '@/lib/account/email-change';
import { passwordProblem } from '@/lib/auth/password-policy';
import { isReportReason } from '@/lib/moderation/types';

describe('account rules (D150)', () => {
  it('new passwords have 8 to 72 characters and match', () => {
    expect(passwordProblem('1234567')).toContain('8');
    expect(passwordProblem('12345678')).toBeNull();
    expect(passwordProblem('x'.repeat(73))).toContain('72');
    expect(passwordProblem('12345678', '12345679')).toContain('takie same');
  });

  it('an address is an address', () => {
    expect(EMAIL_PATTERN.test('a.b@c.pl')).toBe(true);
    for (const bad of ['a@b', 'a b@c.pl', '<a@c.pl>', 'a@c.pl\nBcc: x@y.pl', '']) {
      expect(EMAIL_PATTERN.test(bad), bad).toBe(false);
    }
  });

  it('only known reasons', () => {
    expect(isReportReason('name')).toBe(true);
    expect(isReportReason('toString')).toBe(false);
  });
});
