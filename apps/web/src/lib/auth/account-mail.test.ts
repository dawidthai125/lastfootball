import { beforeEach, describe, expect, it, vi } from 'vitest';

const provider: { value: { apiKey: string; from: string } | null } = { value: null };
vi.mock('@/lib/notifications/email', () => ({ emailProvider: () => provider.value }));
vi.mock('@/config/env', () => ({ env: {} }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({}) }));

const { accountMailReady, confirmLetter, resetLetter, sendAccountLetter } =
  await import('@/lib/auth/account-mail');
const { isResetToken, takeResetSlot } = await import('@/lib/auth/password-reset');

const calls: { url: string; body: Record<string, unknown> }[] = [];
let status = 200;

beforeEach(() => {
  calls.length = 0;
  status = 200;
  provider.value = { apiKey: 'k', from: 'Last Football <p@lastfootball.pl>' };
  vi.stubGlobal('fetch', async (url: string, init: { body: string }) => {
    calls.push({ url, body: JSON.parse(init.body) as Record<string, unknown> });
    return new Response('{}', { status });
  });
});

describe('account letters (D149)', () => {
  it('the links lead to the game, with the token only', () => {
    expect(confirmLetter('https://g.test', 'abc').text).toContain(
      'https://g.test/auth/email-confirmed?token=abc\n',
    );
    expect(resetLetter('https://g.test', 'abc').text).toContain(
      'https://g.test/reset-password?token=abc\n',
    );
    expect(resetLetter('https://g.test', '"><x').html).not.toContain('"><x');
  });

  it('sends from the game address and reports a refusal', async () => {
    const mail = confirmLetter('https://g.test', 'abc');
    expect(await sendAccountLetter('a@b.c', mail, 'k1')).toBe(true);
    expect(calls[0]!.body).toMatchObject({ to: ['a@b.c'], from: provider.value!.from });
    status = 403;
    expect(await sendAccountLetter('a@b.c', mail, 'k1')).toBe(false);
  });

  it('is off without the provider', async () => {
    provider.value = null;
    expect(accountMailReady()).toBe(false);
    expect(await sendAccountLetter('a@b.c', confirmLetter('https://g.test', 'a'), 'k')).toBe(false);
    expect(calls).toEqual([]);
  });

  it('a reset token has a strict shape, and a broken brake lets nothing out', async () => {
    expect(isResetToken('a'.repeat(56))).toBe(true);
    expect(isResetToken('short')).toBe(false);
    expect(isResetToken(`${'a'.repeat(56)}&x`)).toBe(false);
    expect(await takeResetSlot('1.2.3.4', 'a@b.c')).toBe(false);
  });
});
