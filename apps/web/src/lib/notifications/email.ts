/** Server only. E-mail adapter: Resend's HTTP API. Without both settings the channel is off. */

import { env } from '@/config/env';
import type { EmailLetter } from '@/lib/notifications/content';

const SEND_URL = 'https://api.resend.com/emails';
const TIMEOUT_MS = 5_000;
/** A longer pause would eat the whole run. Such a letter waits for the next one. */
const MAX_RETRY_AFTER_MS = 5_000;
/** Two letters a second. */
export const EMAIL_GAP_MS = 500;

/**
 * sent: accepted. rejected: this letter will never pass, keep the claim.
 * retry: not now, release the claim. stop: bad key or used-up quota, no more letters in this run.
 */
export type EmailOutcome = 'sent' | 'rejected' | 'retry' | 'stop';

export type EmailProvider = { readonly apiKey: string; readonly from: string };

export function emailProvider(
  config: { resendApiKey: string | null; notifyFrom: string | null } = env,
): EmailProvider | null {
  if (!config.resendApiKey || !config.notifyFrom) return null;
  return { apiKey: config.resendApiKey, from: config.notifyFrom };
}

export type EmailIo = {
  readonly fetch: typeof fetch;
  readonly now: () => number;
  readonly sleep: (ms: number) => Promise<void>;
};

const REAL_IO: EmailIo = {
  fetch: (input, init) => fetch(input, init),
  now: () => Date.now(),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

/** Seconds only: that is what the provider sends. */
export function retryAfterMs(header: string | null): number | null {
  if (!header || !/^\d{1,6}$/.test(header.trim())) return null;
  const ms = Number(header) * 1000;
  return ms <= MAX_RETRY_AFTER_MS ? ms : null;
}

async function errorName(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { name?: unknown };
    return typeof body.name === 'string' ? body.name : '';
  } catch {
    return '';
  }
}

function outcomeFor(status: number, name: string): EmailOutcome {
  if (status === 401 || status === 403 || /quota/i.test(name)) return 'stop';
  if (status === 429 || status === 408 || status >= 500) return 'retry';
  if (status === 409 && /concurrent/i.test(name)) return 'retry';
  return 'rejected';
}

export type EmailInput = {
  readonly to: string;
  readonly letter: EmailLetter;
  readonly unsubscribeUrl: string;
  /** Same claim, same key: a retry after a timeout cannot send the letter twice. */
  readonly idempotencyKey: string;
};

/** One sender per run. Letters go one after another, never faster than two a second. */
export function createEmailSender(provider: EmailProvider, io: EmailIo = REAL_IO) {
  let nextAt = 0;

  async function request(input: EmailInput): Promise<Response | null> {
    const wait = nextAt - io.now();
    if (wait > 0) await io.sleep(wait);
    nextAt = io.now() + EMAIL_GAP_MS;
    try {
      return await io.fetch(SEND_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': input.idempotencyKey,
        },
        body: JSON.stringify({
          from: provider.from,
          to: [input.to],
          subject: input.letter.subject,
          text: input.letter.text,
          html: input.letter.html,
          headers: {
            'List-Unsubscribe': `<${input.unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      return null;
    }
  }

  return async function send(input: EmailInput): Promise<EmailOutcome> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await request(input);
      if (!response) return 'retry';
      if (response.ok) return 'sent';
      const outcome = outcomeFor(response.status, await errorName(response));
      if (response.status !== 429 || outcome === 'stop' || attempt > 0) return outcome;
      const pause = retryAfterMs(response.headers.get('retry-after'));
      if (pause === null) return outcome;
      await io.sleep(pause);
    }
    return 'retry';
  };
}
