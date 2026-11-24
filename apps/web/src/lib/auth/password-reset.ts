/** Server only. Sends the reset letter and uses its token (D149). */

import { createHash } from 'node:crypto';

import { env } from '@/config/env';
import { resetLetter, sendAccountLetter } from '@/lib/auth/account-mail';
import { signupBucket } from '@/lib/auth/signup-throttle';
import { createAdminClient } from '@/lib/supabase/admin';

/** The game shares 100 letters a day with everything else it sends. */
export const RESET_LIMITS = { perIpHour: 5, perMailDay: 3, globalDay: 30 } as const;

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,128}$/;

export function isResetToken(value: string): boolean {
  return TOKEN_PATTERN.test(value);
}

function mailBucket(email: string): string {
  const hash = createHash('sha256').update(`lf-reset:${email.trim().toLowerCase()}`).digest('hex');
  return hash.slice(0, 32);
}

/** Closed when the brake cannot answer: the mail quota is shared. */
export async function takeResetSlot(ip: string, email: string): Promise<boolean> {
  try {
    const { data, error } = await createAdminClient().rpc(
      'consume_reset_slot' as never,
      {
        p_ip: signupBucket(ip),
        p_mail: mailBucket(email),
        p_ip_hour: RESET_LIMITS.perIpHour,
        p_mail_day: RESET_LIMITS.perMailDay,
        p_global_day: RESET_LIMITS.globalDay,
      } as never,
    );
    return !error && (data as unknown) === true;
  } catch {
    return false;
  }
}

/** Nothing happens for an unknown address, and the caller never learns which it was. */
export async function sendResetLetter(email: string): Promise<void> {
  try {
    const { data, error } = await createAdminClient().auth.admin.generateLink({
      type: 'recovery',
      email,
    });
    const token = data?.properties?.hashed_token;
    const to = data?.user?.email;
    if (error || !token || !to || !isResetToken(token)) return;
    const origin = env.appUrl ?? 'https://www.lastfootball.pl';
    const key = createHash('sha256').update(token).digest('hex').slice(0, 40);
    await sendAccountLetter(to, resetLetter(origin, token), `reset-${key}`);
  } catch {
    console.error('reset letter failed');
  }
}
