/** Server only. E-mail adapter: Resend's HTTP API. Without both settings the channel is off. */

import { env } from '@/config/env';
import type { EmailLetter } from '@/lib/notifications/content';

const SEND_URL = 'https://api.resend.com/emails';
const TIMEOUT_MS = 8_000;

/**
 * sent: accepted. rejected: this letter will never pass, keep the claim.
 * stop: limit, outage or bad settings; release the claim and send no more in this run.
 */
export type EmailOutcome = 'sent' | 'rejected' | 'stop';

export type EmailProvider = { readonly apiKey: string; readonly from: string };

export function emailProvider(
  config: { resendApiKey: string | null; notifyFrom: string | null } = env,
): EmailProvider | null {
  if (!config.resendApiKey || !config.notifyFrom) return null;
  return { apiKey: config.resendApiKey, from: config.notifyFrom };
}

export async function sendEmail(
  provider: EmailProvider,
  input: {
    readonly to: string;
    readonly letter: EmailLetter;
    readonly unsubscribeUrl: string;
    /** Same claim, same key: a retry after a timeout cannot send the letter twice. */
    readonly idempotencyKey: string;
  },
  fetchImpl: typeof fetch = fetch,
): Promise<EmailOutcome> {
  try {
    const response = await fetchImpl(SEND_URL, {
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
    if (response.ok) return 'sent';
    return response.status === 400 || response.status === 409 || response.status === 422
      ? 'rejected'
      : 'stop';
  } catch {
    return 'stop';
  }
}
