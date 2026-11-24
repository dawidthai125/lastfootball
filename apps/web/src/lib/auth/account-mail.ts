/** Server only. Account letters (address, password) through the mail provider of the game (D149). */

import { escapeHtml } from '@/lib/notifications/content';
import { emailProvider } from '@/lib/notifications/email';

const SEND_URL = 'https://api.resend.com/emails';
const TIMEOUT_MS = 8_000;

export type AccountLetter = {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
};

function letter(input: {
  readonly title: string;
  readonly body: string;
  readonly button: string;
  readonly link: string;
  readonly note: string;
}): AccountLetter {
  return {
    subject: `${input.title} · Last Football`,
    text: [input.title, '', input.body, input.link, '', input.note].join('\n'),
    html: [
      '<!doctype html><html lang="pl"><body style="font-family:Arial,sans-serif;line-height:1.5">',
      `<h1 style="font-size:18px">${escapeHtml(input.title)}</h1>`,
      `<p>${escapeHtml(input.body)}</p>`,
      `<p><a href="${escapeHtml(input.link)}">${escapeHtml(input.button)}</a></p>`,
      `<p style="font-size:12px;color:#666">${escapeHtml(input.note)}</p>`,
      '</body></html>',
    ].join(''),
  };
}

export function confirmLetter(origin: string, token: string): AccountLetter {
  return letter({
    title: 'Potwierdź e-mail',
    body: 'Otwórz link i potwierdź adres. Link działa 24 godziny.',
    button: 'Potwierdź e-mail',
    link: `${origin}/auth/email-confirmed?token=${encodeURIComponent(token)}`,
    note: 'Jeśli to nie Ty zakładasz konto w Last Football, nic nie rób.',
  });
}

export function resetLetter(origin: string, token: string): AccountLetter {
  return letter({
    title: 'Nowe hasło',
    body: 'Otwórz link i ustaw nowe hasło. Link działa krótko i tylko raz.',
    button: 'Ustaw nowe hasło',
    link: `${origin}/reset-password?token=${encodeURIComponent(token)}`,
    note: 'Jeśli to nie Ty prosisz o nowe hasło, nic nie rób. Stare hasło działa dalej.',
  });
}

export function accountMailReady(): boolean {
  return emailProvider() !== null;
}

/** False when the provider did not take the letter. Never logs the address or the link. */
export async function sendAccountLetter(
  to: string,
  content: AccountLetter,
  idempotencyKey: string,
): Promise<boolean> {
  const provider = emailProvider();
  if (!provider) return false;
  try {
    const response = await fetch(SEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({ from: provider.from, to: [to], ...content }),
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) console.error('account letter refused', { status: response.status });
    return response.ok;
  } catch {
    console.error('account letter failed');
    return false;
  }
}
