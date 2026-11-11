export type TurnstileResult = 'skipped' | 'ok' | 'missing' | 'rejected' | 'misconfigured';

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function configuredKeys(): { siteKey: string; secret: string } | 'off' | 'half' {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? '';
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim() ?? '';
  if (!siteKey && !secret) return 'off';
  if (!siteKey || !secret) return 'half';
  return { siteKey, secret };
}

/** Both keys or neither. A site key alone must not let signups skip the check. */
export async function verifyTurnstileToken(token: string, ip: string): Promise<TurnstileResult> {
  const keys = configuredKeys();
  if (keys === 'off') return 'skipped';
  if (keys === 'half') return 'misconfigured';
  if (!token.trim()) return 'missing';

  const body = new URLSearchParams({
    secret: keys.secret,
    response: token.trim(),
    remoteip: ip,
  });

  try {
    const response = await fetch(SITEVERIFY, { method: 'POST', body, cache: 'no-store' });
    if (!response.ok) return 'rejected';
    const json = (await response.json()) as { success?: boolean };
    return json.success ? 'ok' : 'rejected';
  } catch {
    return 'rejected';
  }
}

export function turnstileMessage(result: Exclude<TurnstileResult, 'ok' | 'skipped'>): string {
  if (result === 'misconfigured') {
    return 'Zabezpieczenie rejestracji jest niekompletne. Spróbuj później.';
  }
  if (result === 'missing') return 'Potwierdź, że nie jesteś botem.';
  return 'Nie udało się potwierdzić, że to nie bot. Odśwież stronę i spróbuj jeszcze raz.';
}
