import { beforeEach, describe, expect, it, vi } from 'vitest';

import { emailHash, emailTokenPart } from '@/lib/auth/email-proof';

const account = { email: 'a@b.c' };
const letters: string[] = [];

vi.mock('@/config/env', () => ({
  env: {
    supabaseUrl: 'https://db.test',
    supabaseServiceRoleKey: 'key',
    appUrl: 'https://app.test',
  },
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: {
      admin: { getUserById: async () => ({ data: { user: account }, error: null }) },
      signInWithOtp: async (input: { email: string }) => {
        letters.push(input.email);
        return { error: null };
      },
    },
  }),
}));

type Row = Record<string, unknown>;
let row: Row;
let columnMissing = false;

const { confirmEmailToken, hashConfirmToken, issueConfirmLink } =
  await import('@/lib/auth/email-confirm');

function pending(token: string, patch: Row = {}): Row {
  return {
    user_id: 'u1',
    confirmed_at: null,
    deadline_at: '2026-11-30T00:00:00Z',
    token_hash: hashConfirmToken(token),
    token_expires_at: new Date(Date.now() + 60_000).toISOString(),
    last_sent_at: null,
    sends_today: 0,
    sends_day: null,
    confirmed_email_hash: null,
    ...patch,
  };
}

beforeEach(() => {
  account.email = 'a@b.c';
  letters.length = 0;
  columnMissing = false;
  vi.stubGlobal('fetch', async (url: string, init?: { method?: string; body?: string }) => {
    const body = init?.body ? (JSON.parse(init.body) as Row) : {};
    const usesColumn = url.includes('confirmed_email_hash') || 'confirmed_email_hash' in body;
    if (columnMissing && usesColumn) return new Response('{}', { status: 400 });
    const wanted = /token_hash=eq\.([0-9a-f]+)/.exec(url)?.[1];
    const match =
      (!wanted || wanted === row.token_hash) &&
      (!url.includes('confirmed_at=is.null') || row.confirmed_at === null);
    if (init?.method === 'PATCH' && match) Object.assign(row, body);
    return new Response(JSON.stringify(match ? [row] : []), { status: 200 });
  });
});

const tokenFor = (email: string) => 'r'.repeat(43) + emailTokenPart(email);

describe('confirming stores which address was proven', () => {
  it('on the first confirmation', async () => {
    const token = tokenFor('a@b.c');
    row = pending(token);
    expect(await confirmEmailToken(token)).toBe('ok');
    expect(row.confirmed_at).not.toBeNull();
    expect(row.confirmed_email_hash).toBe(emailHash('a@b.c'));
    expect(await confirmEmailToken(token)).toBe('bad');
  });

  it('never for an address changed after the letter', async () => {
    const token = tokenFor('a@b.c');
    row = pending(token);
    account.email = 'victim@b.c';
    expect(await confirmEmailToken(token)).toBe('ok');
    expect(row.confirmed_email_hash).toBeNull();
  });

  it('for a backfilled account, without confirming it again', async () => {
    const token = tokenFor('a@b.c');
    row = pending(token, { confirmed_at: '2026-11-12T00:00:00Z' });
    expect(await confirmEmailToken(token)).toBe('proved');
    expect(row.confirmed_at).toBe('2026-11-12T00:00:00Z');
    expect(row.confirmed_email_hash).toBe(emailHash('a@b.c'));
  });

  it('keeps confirming when the column is not there yet', async () => {
    columnMissing = true;
    const token = tokenFor('a@b.c');
    row = pending(token);
    expect(await confirmEmailToken(token)).toBe('ok');
    row = pending(token, { confirmed_at: '2026-11-12T00:00:00Z' });
    expect(await issueConfirmLink('u1', 'a@b.c')).toBe('confirmed');
  });

  it('sends the link again only while the address is unproven', async () => {
    row = pending('old', { confirmed_at: '2026-11-12T00:00:00Z' });
    expect(await issueConfirmLink('u1', 'a@b.c')).toBe('sent');
    expect(letters).toEqual(['a@b.c']);
    row.confirmed_email_hash = emailHash('a@b.c');
    expect(await issueConfirmLink('u1', 'a@b.c')).toBe('confirmed');
  });
});
