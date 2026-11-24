import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { generateVAPIDKeys } from 'web-push';
import { describe, expect, it, vi } from 'vitest';

import { emailHash, emailTokenPart, isProvenEmail, tokenProvesEmail } from '@/lib/auth/email-proof';
import { emailLetter, pushPayload } from '@/lib/notifications/content';
import { createEmailSender, emailProvider, retryAfterMs } from '@/lib/notifications/email';
import { bearerToken, isSchedulerRequest, sameSecret } from '@/lib/notifications/notify-token';
import { forgetPushDevice } from '@/lib/notifications/devices';
import { combineOutcomes, outcomeFromStatus } from '@/lib/notifications/push';
import { isPushEndpoint, parsePushDevice } from '@/lib/notifications/push-endpoint';
import { ensureSecret, loadVapidKeys, parseVapid } from '@/lib/notifications/server-secrets';
import { loadNotificationSettings } from '@/lib/notifications/settings';
import { createNotifyDeps } from '@/lib/notifications/store';
import { changedPrefs, NOTIFICATION_KINDS, NO_KINDS } from '@/lib/notifications/types';
import {
  hashUnsubscribeToken,
  isUnsubscribeToken,
  makeUnsubscribeToken,
  unsubscribeByToken,
} from '@/lib/notifications/unsubscribe';

const SRC = path.resolve(__dirname, '../..');
const ROOT = path.resolve(SRC, '../../..');
const TOKEN = 'a'.repeat(64);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) return sourceFiles(file);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [file] : [];
  });
}

describe('scheduler token', () => {
  const stored = async () => TOKEN;
  const none = async () => null;

  it('accepts the database token and the cron secret only', async () => {
    expect(await isSchedulerRequest(`Bearer ${TOKEN}`, null, stored)).toBe(true);
    expect(await isSchedulerRequest(`Bearer ${'c'.repeat(20)}`, 'c'.repeat(20), none)).toBe(true);
    expect(await isSchedulerRequest(`Bearer ${'b'.repeat(64)}`, 'c'.repeat(20), stored)).toBe(
      false,
    );
    expect(await isSchedulerRequest(null, null, stored)).toBe(false);
    expect(await isSchedulerRequest(TOKEN, null, stored)).toBe(false);
  });

  it('stays closed when nothing is configured', async () => {
    expect(await isSchedulerRequest(`Bearer ${TOKEN}`, null, none)).toBe(false);
    expect(sameSecret('', null)).toBe(false);
    expect(sameSecret('', '')).toBe(false);
  });

  it('does not read the database for a malformed header', async () => {
    const read = vi.fn(stored);
    await isSchedulerRequest('Bearer short', null, read);
    await isSchedulerRequest(`Bearer ${'x'.repeat(5000)}`, null, read);
    expect(read).not.toHaveBeenCalled();
    expect(bearerToken('Basic abc')).toBeNull();
  });
});

describe('push endpoint', () => {
  it('accepts the known push services', () => {
    for (const url of [
      'https://fcm.googleapis.com/fcm/send/abc:def',
      'https://updates.push.services.mozilla.com/wpush/v2/abc',
      'https://wns2-par02p.notify.windows.com/w/?token=abc',
      'https://web.push.apple.com/QabC',
    ]) {
      expect(isPushEndpoint(url)).toBe(true);
    }
  });

  it('refuses inward, lookalike and odd addresses', () => {
    for (const url of [
      'http://fcm.googleapis.com/fcm/send/a',
      'https://localhost/a',
      'https://127.0.0.1/a',
      'https://169.254.169.254/latest/meta-data',
      'https://[::1]/a',
      'https://10.0.0.5/a',
      'https://evil.example/a',
      'https://fcm.googleapis.com.evil.example/a',
      'https://evilpush.apple.com.example/a',
      'https://xpush.apple.com/a',
      'https://fcm.googleapis.com:8443/a',
      'https://user:pw@fcm.googleapis.com/a',
      'https://evil.example\\@fcm.googleapis.com/a',
      'https://fcm.googleapis.com/a b',
      `https://fcm.googleapis.com/${'a'.repeat(1100)}`,
      '',
      null,
      {},
    ]) {
      expect(isPushEndpoint(url)).toBe(false);
    }
  });

  it('checks both browser keys', () => {
    const endpoint = 'https://fcm.googleapis.com/fcm/send/abc';
    const p256dh = generateVAPIDKeys().publicKey;
    const auth = Buffer.alloc(16, 7).toString('base64url');
    expect(parsePushDevice({ endpoint, p256dh, auth })).toEqual({ endpoint, p256dh, auth });
    expect(parsePushDevice({ endpoint, p256dh, auth: 'abc' })).toBeNull();
    expect(parsePushDevice({ endpoint, p256dh: 'abc', auth })).toBeNull();
    expect(parsePushDevice({ endpoint: 'https://localhost/', p256dh, auth })).toBeNull();
    expect(parsePushDevice(null)).toBeNull();
  });
});

describe('push outcomes', () => {
  it('drops a gone device and forgives an outage', () => {
    expect(outcomeFromStatus(404)).toBe('gone');
    expect(outcomeFromStatus(410)).toBe('gone');
    expect(outcomeFromStatus(400)).toBe('refused');
    // Our key, a limit or an outage: never counted against the device.
    for (const status of [401, 403, 408, 429, 500, 503]) {
      expect(outcomeFromStatus(status)).toBe('busy');
    }
    expect(outcomeFromStatus(undefined)).toBe('unknown');
  });

  it('repeats only what surely did not arrive', () => {
    expect(combineOutcomes(['gone', 'accepted'])).toBe('sent');
    expect(combineOutcomes(['busy', 'gone'])).toBe('retry');
    expect(combineOutcomes(['busy', 'unknown'])).toBe('lost');
    expect(combineOutcomes([])).toBe('lost');
  });
});

type UpdateCall = { values: unknown; column: string; value: unknown };

function fakeAdmin(hash: string, calls: UpdateCall[]) {
  return {
    from: () => ({
      update: (values: unknown) => ({
        eq: (column: string, value: unknown) => ({
          select: async () => {
            calls.push({ values, column, value });
            return { data: value === hash ? [{ user_id: 'u1' }] : [], error: null };
          },
        }),
      }),
    }),
  } as unknown as Parameters<typeof unsubscribeByToken>[1];
}

describe('unsubscribe', () => {
  const token = makeUnsubscribeToken('key', 'user-1');

  it('is stable per user, unguessable without the key and stored as a hash', () => {
    expect(isUnsubscribeToken(token)).toBe(true);
    expect(makeUnsubscribeToken('key', 'user-1')).toBe(token);
    expect(makeUnsubscribeToken('key', 'user-2')).not.toBe(token);
    expect(makeUnsubscribeToken('other', 'user-1')).not.toBe(token);
    expect(hashUnsubscribeToken(token)).not.toContain(token);
  });

  it('turns e-mail off by hash and changes nothing else', async () => {
    const calls: UpdateCall[] = [];
    const admin = fakeAdmin(hashUnsubscribeToken(token), calls);
    expect(await unsubscribeByToken(token, admin)).toBe('ok');
    expect(calls).toEqual([
      {
        values: { email_enabled: false, updated_at: expect.any(String) },
        column: 'unsubscribe_token_hash',
        value: hashUnsubscribeToken(token),
      },
    ]);
    expect(await unsubscribeByToken(makeUnsubscribeToken('x', 'y'), admin)).toBe('bad');
    expect(await unsubscribeByToken('../../etc', admin)).toBe('bad');
    expect(await unsubscribeByToken(token, null)).toBe('unavailable');
    expect(calls).toHaveLength(2);
  });

  it('a GET only shows the form, the POST does the work', async () => {
    const route = await import('@/app/api/notify/unsubscribe/route');
    const url = `https://www.lastfootball.pl/api/notify/unsubscribe?t=${token}`;
    const page = route.GET(new Request(url));
    const html = await page.text();
    expect(page.status).toBe(200);
    expect(html).toContain('method="post"');
    expect(page.headers.get('cache-control')).toBe('no-store');
    expect(page.headers.get('referrer-policy')).toBe('no-referrer');
    const bad = route.GET(new Request(`${url}"><script>`));
    expect(bad.status).toBe(400);
    expect(await bad.text()).not.toContain('<script>');
    // No service key in tests: the write is refused quietly.
    expect((await route.POST(new Request(url, { method: 'POST' }))).status).toBe(503);
  });
});

describe('letters and payloads', () => {
  it('escapes names and keeps them on one line', () => {
    const letter = emailLetter({
      kind: 'offer',
      ref: 'p:b',
      clubName: '<b>"A&B"</b>\r\nBcc: x@y.z',
      origin: 'https://www.lastfootball.pl',
      unsubscribeUrl: 'https://www.lastfootball.pl/api/notify/unsubscribe?t=abc',
    });
    expect(letter.html).not.toContain('<b>');
    expect(letter.html).toContain('&lt;b&gt;&quot;A&amp;B&quot;');
    expect(letter.text).not.toMatch(/^Bcc:/m);
    expect(letter.subject).not.toContain('Bcc');
    expect(letter.text).toContain('/api/notify/unsubscribe?t=abc');
  });

  it('keeps push small and impersonal, with a same-origin path', () => {
    for (const kind of NOTIFICATION_KINDS) {
      const payload = pushPayload(kind, 'x');
      expect(Object.keys(payload).sort()).toEqual(['body', 'path', 'tag', 'title']);
      expect(payload.path).toMatch(/^\/[a-z]+$/);
      expect(payload.tag).toMatch(/^[A-Za-z0-9_-]{1,32}$/);
      expect(JSON.stringify(payload).length).toBeLessThan(400);
    }
  });

  it('an overdue round does not talk about 18:00', () => {
    expect(pushPayload('human_round', '2026-11-24').title).toContain('18:00');
    expect(JSON.stringify(pushPayload('human_round', 'overdue:2026-11-24'))).not.toContain('18:00');
  });

  const input = {
    to: 'x@y.z',
    letter: { subject: 's', text: 't', html: 'h' },
    unsubscribeUrl: 'https://e.x/u?t=1',
    idempotencyKey: 'k',
  };

  function sender(replies: readonly (Response | Error)[]) {
    const queue = [...replies];
    const calls: { at: number; body: { headers: Record<string, string> } }[] = [];
    let time = 0;
    const send = createEmailSender(
      { apiKey: 'key', from: 'a@b.c' },
      {
        now: () => time,
        sleep: async (ms) => {
          time += ms;
        },
        fetch: (async (_url: unknown, init: { body: string }) => {
          calls.push({ at: time, body: JSON.parse(init.body) });
          const reply = queue.shift() ?? new Response('{}');
          if (reply instanceof Error) throw reply;
          return reply;
        }) as unknown as typeof fetch,
      },
    );
    return { send, calls };
  }

  const reply = (status: number, name = '', headers: Record<string, string> = {}) =>
    new Response(JSON.stringify({ name }), { status, headers });

  it('sends both one-click headers, never faster than two a second', async () => {
    const { send, calls } = sender([]);
    for (let i = 0; i < 3; i += 1) expect(await send(input)).toBe('sent');
    expect(calls.map((call) => call.at)).toEqual([0, 500, 1000]);
    expect(calls[0]!.body.headers).toEqual({
      'List-Unsubscribe': '<https://e.x/u?t=1>',
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    });
  });

  it('honours Retry-After once', async () => {
    const limited = () => reply(429, 'rate_limit_exceeded', { 'retry-after': '2' });
    const once = sender([limited()]);
    expect(await once.send(input)).toBe('sent');
    expect(once.calls.map((call) => call.at)).toEqual([0, 2000]);
    const twice = sender([limited(), limited()]);
    expect(await twice.send(input)).toBe('retry');
    expect(twice.calls).toHaveLength(2);
    expect(retryAfterMs('3600')).toBeNull();
    expect(retryAfterMs('Wed, 21 Oct 2026 07:28:00 GMT')).toBeNull();
  });

  it('stops only for a bad key or a used-up quota', async () => {
    const result = async (answer: Response | Error) => sender([answer]).send(input);
    expect(await result(new Error('timeout'))).toBe('retry');
    expect(await result(reply(503))).toBe('retry');
    expect(await result(reply(409, 'concurrent_idempotent_requests'))).toBe('retry');
    expect(await result(reply(422))).toBe('rejected');
    expect(await result(reply(401))).toBe('stop');
    expect(await result(reply(403))).toBe('stop');
    expect(await result(reply(429, 'daily_quota_exceeded', { 'retry-after': '1' }))).toBe('stop');
  });
});

describe('proven address', () => {
  it('needs a stored hash of the current address', () => {
    expect(isProvenEmail(emailHash('A@b.c '), 'a@B.c')).toBe(true);
    expect(isProvenEmail(emailHash('a@b.c'), 'other@b.c')).toBe(false);
    expect(isProvenEmail(null, 'a@b.c')).toBe(false);
    expect(isProvenEmail(emailHash('a@b.c'), null)).toBe(false);
  });

  it('binds the link to the address it was sent to', () => {
    const token = 'r'.repeat(43) + emailTokenPart('a@b.c');
    expect(token).toMatch(/^[A-Za-z0-9_-]{20,80}$/);
    expect(tokenProvesEmail(token, 'a@b.c')).toBe(true);
    expect(tokenProvesEmail(token, 'victim@b.c')).toBe(false);
    expect(tokenProvesEmail('r'.repeat(43), 'a@b.c')).toBe(false);
    expect(tokenProvesEmail(token, null)).toBe(false);
  });
});

describe('older settings tab', () => {
  const before = { push: true, email: true, kinds: { ...NO_KINDS, offer: true } };

  it('sends only what was changed in it', () => {
    expect(changedPrefs(before, before)).toEqual({});
    const kinds = { ...before.kinds, matchday: true };
    expect(changedPrefs(before, { email: true, kinds })).toEqual({ kinds: { matchday: true } });
    expect(changedPrefs(before, { email: false, kinds: before.kinds })).toEqual({ email: false });
  });
});

describe('signing out', () => {
  it('removes this device of this manager and turns push off with the last one', async () => {
    const steps: string[] = [];
    const chain = (name: string, answer: unknown) => {
      const self: Record<string, unknown> = {
        then: (resolve: (value: unknown) => unknown) => Promise.resolve(answer).then(resolve),
      };
      self.eq = (column: string, value: string) => {
        steps.push(`${name} ${column}=${value}`);
        return self;
      };
      self.select = () => self;
      return self;
    };
    const admin = {
      from: () => ({
        delete: () => chain('delete', { data: [{ id: '1' }], error: null }),
        select: () => chain('count', { count: 0, error: null }),
        update: (values: { push_enabled: boolean }) =>
          chain(`push=${values.push_enabled}`, { error: null }),
      }),
    } as unknown as Parameters<typeof forgetPushDevice>[2];
    expect(await forgetPushDevice('u1', 'https://x', admin)).toBe(true);
    expect(steps).toEqual([
      'delete user_id=u1',
      'delete endpoint=https://x',
      'count user_id=u1',
      'push=false user_id=u1',
    ]);
    expect(await forgetPushDevice('u1', 'https://x', null)).toBe(false);
  });

  it('every sign-out form takes the device along', () => {
    for (const file of sourceFiles(SRC)) {
      expect(readFileSync(file, 'utf8'), file).not.toContain('action={signOut}');
    }
  });
});

describe('missing configuration', () => {
  it('needs both e-mail settings', () => {
    expect(emailProvider({ resendApiKey: null, notifyFrom: null })).toBeNull();
    expect(emailProvider({ resendApiKey: 'k', notifyFrom: null })).toBeNull();
    expect(emailProvider({ resendApiKey: 'k', notifyFrom: 'a@b.c' })).not.toBeNull();
  });

  it('hides the feature without the service key', async () => {
    expect(await loadNotificationSettings('u1', null)).toBeNull();
    expect(await loadVapidKeys(null)).toBeNull();
    expect(await createNotifyDeps(null)).toBeNull();
  });

  it('hides the feature when a table is missing', async () => {
    const answer = { data: null, count: null, error: { message: 'missing', code: 'PGRST205' } };
    const chain: Record<string, unknown> = {
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(answer).then(resolve),
    };
    for (const name of ['select', 'eq', 'maybeSingle', 'upsert']) chain[name] = () => chain;
    const admin = { from: () => chain } as unknown as Parameters<
      typeof loadNotificationSettings
    >[1];
    expect(await loadNotificationSettings('u1', admin)).toBeNull();
    expect(await createNotifyDeps(admin ?? null)).toBeNull();
  });

  it('the scheduler route refuses without any token', async () => {
    const route = await import('@/app/api/notify/route');
    const response = await route.POST(
      new Request('https://x.test/api/notify', {
        method: 'POST',
        headers: { authorization: `Bearer ${TOKEN}` },
      }),
    );
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'unauthorized' });
  });
});

describe('key creation', () => {
  it('two servers end with the same value', async () => {
    let stored: string | null = null;
    const admin = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: stored ? { value: stored } : null, error: null }),
          }),
        }),
        upsert: async (row: { value: string }, options: { ignoreDuplicates: boolean }) => {
          expect(options.ignoreDuplicates).toBe(true);
          stored ??= row.value;
          return { error: null };
        },
      }),
    } as unknown as Parameters<typeof ensureSecret>[0];
    const [a, b] = await Promise.all([
      ensureSecret(admin, 'vapid', () => 'one'),
      ensureSecret(admin, 'vapid', () => 'two'),
    ]);
    expect(a).toBe(b);
  });

  it('refuses a damaged pair', () => {
    expect(parseVapid(JSON.stringify(generateVAPIDKeys()))).not.toBeNull();
    expect(parseVapid('{"publicKey":"a","privateKey":"b"}')).toBeNull();
    expect(parseVapid('nope')).toBeNull();
  });
});

describe('secrets stay on the server', () => {
  const SERVER_ONLY = [
    'lib/notifications/server-secrets',
    'lib/notifications/push',
    'lib/notifications/devices',
    'lib/auth/email-proof',
    'lib/notifications/email',
    'lib/notifications/store',
    'lib/notifications/settings',
    'lib/notifications/unsubscribe',
    'lib/notifications/notify-token',
    'lib/supabase/admin',
  ];

  function resolveImport(from: string, spec: string): string | null {
    const base = spec.startsWith('@/')
      ? path.join(SRC, spec.slice(2))
      : spec.startsWith('.')
        ? path.resolve(path.dirname(from), spec)
        : null;
    if (!base) return null;
    return (
      ['.ts', '.tsx', '/index.ts', '/index.tsx'].map((end) => base + end).find(existsSync) ?? null
    );
  }

  const read = (file: string) => readFileSync(file, 'utf8');
  const isServerAction = (code: string) => /^\s*['"]use server['"]/.test(code);

  it('no client component reaches a server module or web-push', () => {
    const queue = [
      path.join(SRC, 'components/notifications/NotificationSettingsPanel.tsx'),
      path.join(SRC, 'components/auth/SignOutForm.tsx'),
    ];
    const seen = new Set<string>();
    while (queue.length > 0) {
      const file = queue.pop()!;
      if (seen.has(file)) continue;
      seen.add(file);
      const code = read(file);
      // Next replaces a 'use server' module with remote calls in the browser.
      if (isServerAction(code)) continue;
      const name = path.relative(SRC, file).replace(/\.tsx?$/, '');
      expect(SERVER_ONLY).not.toContain(name);
      for (const match of code.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
        expect(match[1]).not.toBe('web-push');
        const next = resolveImport(file, match[1]!);
        if (next) queue.push(next);
      }
    }
    expect(seen.size).toBeGreaterThan(3);
  });

  it('only server modules of this feature use web-push, the keys table or the provider key', () => {
    const allowed = new Set([
      'lib/notifications/server-secrets.ts',
      'lib/notifications/push.ts',
      'lib/notifications/email.ts',
      'config/env.ts',
      'types/database.ts',
    ]);
    for (const file of sourceFiles(SRC)) {
      const name = path.relative(SRC, file);
      if (allowed.has(name)) continue;
      const code = read(file);
      expect(code, name).not.toMatch(/['"]web-push['"]|['"]server_secrets['"]|resendApiKey/);
    }
  });

  it('server actions take no user or club id', () => {
    const code = read(path.join(SRC, 'lib/notifications/actions.ts'));
    const exported = [...code.matchAll(/export (?:async )?function \w+\(([^)]*)\)/g)];
    expect(exported.length).toBeGreaterThan(3);
    for (const match of exported) expect(match[1]).not.toMatch(/user|club/i);
  });

  it('players get no grants on the new tables', () => {
    const sql = read(path.join(ROOT, 'supabase/migrations/20261124150000_notifications.sql'));
    for (const table of [
      'notification_prefs',
      'push_subscriptions',
      'notification_log',
      'server_secrets',
    ]) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
      expect(sql).toMatch(new RegExp(`revoke all on public\\.${table} from public, anon, authent`));
    }
    expect(sql).not.toMatch(/to (anon|authenticated)/);
    expect(sql).not.toMatch(/create policy/i);
  });

  it('the schedule names no address and does nothing without the URL row', () => {
    const sql = read(path.join(ROOT, 'supabase/migrations/20261124151000_notify_schedule.sql'));
    expect(sql).not.toMatch(/https:\/\/[a-z]/);
    expect(sql).toContain("u.name = 'notify_url'");
    expect(sql).not.toMatch(/insert into/i);
  });

  it('the offer guard checks sessions only and cannot be called by one', () => {
    const sql = read(
      path.join(ROOT, 'supabase/migrations/20261124152000_guard_transfer_offers.sql'),
    );
    expect(sql).toContain("when (current_user in ('authenticated', 'anon'))");
    expect(sql).toContain('new.created_at := now()');
    expect(sql).toMatch(/revoke all on function public\.lf_guard_transfer_offer\(\) from public/);
  });

  it('the worker and the scheduler skip the session middleware', () => {
    const code = read(path.join(SRC, 'middleware.ts'));
    const source = /'(\/\(\(\?!.*)',/.exec(code)![1]!.replace(/\\\\/g, '\\');
    const matcher = new RegExp(`^${source}$`);
    expect(matcher.test('/sw.js')).toBe(false);
    expect(matcher.test('/api/notify')).toBe(false);
    expect(matcher.test('/api/notify/unsubscribe')).toBe(false);
    expect(matcher.test('/settings')).toBe(true);
  });

  it('the service worker opens same-origin paths only and caches nothing', () => {
    const code = read(path.join(ROOT, 'apps/web/public/sw.js'));
    expect(code).not.toContain("addEventListener('fetch'");
    const safePath = new Function(
      'self',
      `${/function safePath[\s\S]*?\n}\n/.exec(code)![0]}; return safePath;`,
    )({ location: { origin: 'https://www.lastfootball.pl' } }) as (value: unknown) => string;
    expect(safePath('/matches')).toBe('/matches');
    for (const bad of ['//evil.example', '/\\evil.example', 'https://evil.example', 'x', null]) {
      expect(safePath(bad)).toBe('/hub');
    }
  });
});
