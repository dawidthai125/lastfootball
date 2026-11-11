import { describe, expect, it } from 'vitest';

import {
  clientIpFromHeaders,
  createLocalSignupGuard,
  hasSupabaseSessionCookie,
  SIGNUP_LIMITS,
  signupBlockReason,
} from '@/lib/auth/signup-gate';

describe('signup brake', () => {
  it('lets a first signup through', () => {
    expect(signupBlockReason({ ipWindow: 0, ipDay: 0, globalWindow: 0 })).toBeNull();
  });

  it('stops one address after the short window fills', () => {
    expect(
      signupBlockReason({
        ipWindow: SIGNUP_LIMITS.perIpWindow,
        ipDay: 1,
        globalWindow: 1,
      }),
    ).toBe('ip');
  });

  it('stops one address after a day of signups', () => {
    expect(
      signupBlockReason({
        ipWindow: 0,
        ipDay: SIGNUP_LIMITS.perIpDay,
        globalWindow: 1,
      }),
    ).toBe('ip');
  });

  it('stops everyone when the whole site is flooding', () => {
    expect(
      signupBlockReason({
        ipWindow: 0,
        ipDay: 0,
        globalWindow: SIGNUP_LIMITS.globalWindow,
      }),
    ).toBe('global');
  });
});

describe('local signup guard', () => {
  it('trips only after the isolate sees a burst', () => {
    const guard = createLocalSignupGuard(2, 10_000);
    expect(guard(1_000)).toBe(false);
    expect(guard(1_100)).toBe(false);
    expect(guard(1_200)).toBe(true);
    expect(guard(12_000)).toBe(false);
  });
});

describe('client ip', () => {
  it('prefers the platform real ip over a forwarded list', () => {
    const headers = new Headers({
      'x-real-ip': '203.0.113.8',
      'x-forwarded-for': '198.51.100.4, 203.0.113.8',
    });
    expect(clientIpFromHeaders(headers)).toBe('203.0.113.8');
  });

  it('uses the first forwarded address when real ip is absent', () => {
    const headers = new Headers({ 'x-forwarded-for': ' 198.51.100.4 , 10.0.0.1' });
    expect(clientIpFromHeaders(headers)).toBe('198.51.100.4');
  });
});

describe('supabase session cookie', () => {
  it('sees a session cookie and ignores the pkce verifier', () => {
    expect(hasSupabaseSessionCookie(['sb-abc123-auth-token'])).toBe(true);
    expect(hasSupabaseSessionCookie(['sb-abc123-auth-token.0'])).toBe(true);
    expect(hasSupabaseSessionCookie(['sb-abc123-auth-token-code-verifier'])).toBe(false);
    expect(hasSupabaseSessionCookie(['theme'])).toBe(false);
  });
});
