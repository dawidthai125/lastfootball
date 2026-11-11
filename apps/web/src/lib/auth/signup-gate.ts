/** Shared signup brake. The database function receives these same numbers. */
export const SIGNUP_LIMITS = {
  perIpWindow: 4,
  perIpDay: 12,
  globalWindow: 80,
} as const;

export type SignupCounts = {
  ipWindow: number;
  ipDay: number;
  globalWindow: number;
};

export type SignupBlock = 'ip' | 'global';

/** Counts are attempts already stored, before this one is written. */
export function signupBlockReason(counts: SignupCounts): SignupBlock | null {
  if (counts.ipWindow >= SIGNUP_LIMITS.perIpWindow || counts.ipDay >= SIGNUP_LIMITS.perIpDay) {
    return 'ip';
  }
  if (counts.globalWindow >= SIGNUP_LIMITS.globalWindow) {
    return 'global';
  }
  return null;
}

export function signupBlockMessage(block: SignupBlock): string {
  if (block === 'ip') {
    return 'Z tego miejsca założono już kilka kont. Spróbuj później.';
  }
  return 'Za dużo nowych kont naraz. Spróbuj za kilka minut.';
}

/** Per-isolate guard. Stops a tight loop before it reaches the database. */
export function createLocalSignupGuard(limit: number, windowMs: number) {
  const hits: number[] = [];
  return (now: number) => {
    const cutoff = now - windowMs;
    while (hits.length > 0 && hits[0]! < cutoff) hits.shift();
    hits.push(now);
    return hits.length > limit;
  };
}

export function clientIpFromHeaders(headerList: { get(name: string): string | null }): string {
  const real = headerList.get('x-real-ip')?.trim();
  if (real) return real.slice(0, 64);
  const forwarded = headerList.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  if (first) return first.slice(0, 64);
  return 'unknown';
}

/** Session cookie only. A PKCE verifier is not a logged-in user. */
export function hasSupabaseSessionCookie(names: readonly string[]): boolean {
  return names.some((name) => /^sb-[a-z0-9]+-auth-token(\.\d+)?$/.test(name));
}
