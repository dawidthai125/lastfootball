/** Server only. Passes letters sent to the contact address on to the owner (D144). */

import { env } from '@/config/env';
import { tryAdminClient } from '@/lib/supabase/admin';

const API = 'https://api.resend.com';
const TIMEOUT_MS = 4_000;

export const CONTACT = {
  address: 'kontakt@lastfootball.pl',
  domain: 'lastfootball.pl',
  /** Retries look this far back. Claims live longer, so nothing goes out twice. */
  windowMs: 2 * 86_400_000,
  keepClaimsMs: 7 * 86_400_000,
  perRun: 10,
  /** No new letter after this long: notifications of the same run need their time. */
  budgetMs: 4_000,
  /** Spam must not use up the shared daily quota of the provider. */
  perDay: 25,
  maxAttachmentBytes: 15 * 1024 * 1024,
} as const;

type Attachment = { filename?: string | null; size?: number; download_url?: string };

export type ReceivedLetter = {
  readonly id: string;
  readonly from: string;
  readonly to: readonly string[];
  readonly created_at: string;
  readonly subject?: string | null;
  readonly text?: string | null;
  readonly html?: string | null;
  readonly reply_to?: readonly string[] | null;
  readonly attachments?: readonly Attachment[];
  readonly authentication?: { readonly dmarc?: string } | null;
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const oneLine = (value: string) => value.replace(/[\r\n\t]+/g, ' ').trim();

/** Bare address of "Name <a@b>", or null. */
export function bareAddress(value: string): string | null {
  const found =
    /<([^<>\s]+@[^<>\s]+)>\s*$/.exec(value) ?? /^([^<>\s]+@[^<>\s]+)$/.exec(value.trim());
  return found ? found[1]! : null;
}

/** Own mail would come back here for ever. */
export function isLoop(from: string): boolean {
  const address = (bareAddress(from) ?? from).toLowerCase();
  return address.endsWith(`@${CONTACT.domain}`) || address.endsWith(`.${CONTACT.domain}`);
}

export function buildForward(letter: ReceivedLetter, to: string, files: readonly Attachment[]) {
  const sender = oneLine(letter.from);
  const subject = oneLine(letter.subject ?? '') || '(bez tematu)';
  const size = files.reduce((sum, file) => sum + (file.size ?? 0), 0);
  const ready = files.filter((file) => file.download_url);
  const attach = ready.length === files.length && size <= CONTACT.maxAttachmentBytes;
  const notes = [
    `Od: ${sender}`,
    `Data: ${letter.created_at}`,
    ...(letter.authentication?.dmarc === 'fail'
      ? ['Uwaga: nadawca nie przeszedł sprawdzenia, adres może być podrobiony.']
      : []),
    ...(files.length > 0 && !attach
      ? ['Załączniki nie zostały dołączone. Są w panelu poczty.']
      : []),
  ];
  const replyTo = [...(letter.reply_to ?? []), letter.from]
    .map(bareAddress)
    .find((address) => address !== null);
  const body = letter.html
    ? letter.html
    : `<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(letter.text ?? '')}</pre>`;
  return {
    from: `Last Football kontakt <${CONTACT.address}>`,
    to: [to],
    subject: `[Last Football] ${subject}`.slice(0, 200),
    ...(replyTo ? { reply_to: [replyTo] } : {}),
    text: `${notes.join('\n')}\n\n${letter.text ?? '(treść tylko w HTML)'}`,
    html: `<p>${notes.map(escapeHtml).join('<br>')}</p><hr>${body}`,
    ...(attach && ready.length > 0
      ? {
          attachments: ready.map((file) => ({
            filename: oneLine(file.filename ?? '') || 'zalacznik',
            path: file.download_url,
          })),
        }
      : {}),
  };
}

export type ContactDeps = {
  readonly list: (sinceIso: string) => Promise<readonly ReceivedLetter[] | null>;
  readonly read: (id: string) => Promise<ReceivedLetter | null>;
  readonly files: (id: string) => Promise<readonly Attachment[] | null>;
  readonly sentSince: (sinceIso: string) => Promise<number | null>;
  /** False when this letter was taken before, or the claim failed. */
  readonly claim: (id: string) => Promise<boolean>;
  readonly release: (id: string) => Promise<void>;
  readonly send: (id: string, body: ReturnType<typeof buildForward>) => Promise<boolean>;
};

export type ContactCounts = { readonly forwarded: number; readonly failed: number };

/** Oldest first. A letter that did not get through is tried again in the next run. */
export async function forwardContactMail(
  deps: ContactDeps,
  to: string,
  now: Date,
): Promise<ContactCounts | null> {
  const started = Date.now();
  const letters = await deps.list(new Date(now.getTime() - CONTACT.windowMs).toISOString());
  const used = await deps.sentSince(new Date(now.getTime() - 86_400_000).toISOString());
  if (!letters || used === null) return null;
  const wanted = [...letters]
    .filter((letter) => !isLoop(letter.from))
    .filter((letter) => letter.to.some((a) => bareAddress(a)?.toLowerCase() === CONTACT.address))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  let room = Math.min(CONTACT.perRun, CONTACT.perDay - used);
  let forwarded = 0;
  let failed = 0;
  for (const { id } of wanted) {
    if (room <= 0 || Date.now() - started > CONTACT.budgetMs) break;
    if (!(await deps.claim(id))) continue;
    room -= 1;
    const letter = await deps.read(id);
    const files = letter && (letter.attachments ?? []).length > 0 ? await deps.files(id) : [];
    const sent = letter && files ? await deps.send(id, buildForward(letter, to, files)) : false;
    if (sent) forwarded += 1;
    else {
      failed += 1;
      await deps.release(id);
    }
  }
  return { forwarded, failed };
}

async function call<T>(key: string, path: string, init: RequestInit = {}): Promise<T | null> {
  try {
    const response = await fetch(`${API}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${key}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (response.ok) return (await response.json()) as T;
    console.error('contact mail: provider refused', {
      status: response.status,
      step: path.split('?')[0]!.split('/').slice(1, 3).join('/'),
    });
    return null;
  } catch {
    return null;
  }
}

/** Null = the feature is off: no key, no destination or no database. */
export function contactDeps(): { readonly deps: ContactDeps; readonly to: string } | null {
  const key = env.resendApiKey;
  const to = env.contactForwardTo;
  const admin = tryAdminClient();
  if (!key || !to || !admin) return null;
  const table = () => admin.from('contact_forwards' as never);
  return {
    to,
    deps: {
      list: async (since) =>
        (
          await call<{ data: ReceivedLetter[] }>(
            key,
            `/emails/receiving?limit=100&to=${CONTACT.address}&start_date=${encodeURIComponent(since)}`,
          )
        )?.data ?? null,
      read: (id) => call<ReceivedLetter>(key, `/emails/receiving/${id}`),
      files: async (id) =>
        (await call<{ data: Attachment[] }>(key, `/emails/receiving/${id}/attachments`))?.data ??
        null,
      sentSince: async (since) => {
        const { count, error } = await table()
          .select('email_id', { count: 'exact', head: true })
          .gte('created_at', since);
        return error ? null : (count ?? 0);
      },
      claim: async (id) => {
        // A letter that was taken before returns no row, and no error in the database log.
        const { data, error } = await table()
          .upsert({ email_id: id } as never, { onConflict: 'email_id', ignoreDuplicates: true })
          .select('email_id');
        return !error && (data as unknown as unknown[] | null)?.length === 1;
      },
      release: async (id) => {
        await table().delete().eq('email_id', id);
      },
      send: async (id, body) =>
        (await call(key, '/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `contact-${id}` },
          body: JSON.stringify(body),
        })) !== null,
    },
  };
}

/** One run of the scheduler. Never throws: notifications must go out anyway. */
export async function runContactMail(now: Date): Promise<ContactCounts | null> {
  try {
    const ready = contactDeps();
    if (!ready) return null;
    const counts = await forwardContactMail(ready.deps, ready.to, now);
    const old = new Date(now.getTime() - CONTACT.keepClaimsMs).toISOString();
    await tryAdminClient()
      ?.from('contact_forwards' as never)
      .delete()
      .lt('created_at', old);
    return counts;
  } catch {
    console.error('contact mail failed');
    return null;
  }
}
