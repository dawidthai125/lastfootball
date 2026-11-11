import { createHash, randomUUID } from 'node:crypto';

import { env } from '@/config/env';
import { createLocalSignupGuard, SIGNUP_LIMITS, type SignupBlock } from '@/lib/auth/signup-gate';

const localFlood = createLocalSignupGuard(30, 10_000);

export function signupBucket(ip: string): string {
  return createHash('sha256').update(`lf-signup:${ip}`).digest('hex').slice(0, 32);
}

/**
 * Reserves a signup slot. Fails open when the brake table is unreachable,
 * so a migration lag cannot lock every new player out.
 */
export async function takeSignupSlot(ip: string): Promise<SignupBlock | null> {
  if (localFlood(Date.now())) return 'global';
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return null;

  const bucket = ip === 'unknown' ? `once-${randomUUID()}` : signupBucket(ip);

  try {
    const response = await fetch(`${env.supabaseUrl}/rest/v1/rpc/consume_signup_slot`, {
      method: 'POST',
      headers: {
        apikey: env.supabaseServiceRoleKey,
        Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_bucket: bucket,
        p_ip_window: SIGNUP_LIMITS.perIpWindow,
        p_ip_day: SIGNUP_LIMITS.perIpDay,
        p_global: SIGNUP_LIMITS.globalWindow,
      }),
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const reason = (await response.json()) as unknown;
    if (reason === 'ip' || reason === 'global') return reason;
    return null;
  } catch {
    return null;
  }
}
