import { createHash, randomBytes } from 'node:crypto';

import { env } from '@/config/env';
import {
  deadlineFrom,
  emailGate,
  linkExpiryFrom,
  nextSendCount,
  resendBlock,
  EMAIL_CONFIRM,
  type EmailConfirmRow,
  type EmailGate,
} from '@/lib/auth/email-confirm-policy';
import { emailHash, emailTokenPart, isProvenEmail, tokenProvesEmail } from '@/lib/auth/email-proof';
import { createAdminClient } from '@/lib/supabase/admin';

export type IssueLinkResult = 'sent' | 'confirmed' | 'cooldown' | 'daily' | 'failed';

type StatusJson = {
  user_id: string;
  confirmed_at: string | null;
  deadline_at: string;
  last_sent_at: string | null;
  sends_today: number;
  sends_day: string | null;
};

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,80}$/;

function mapRow(row: StatusJson): EmailConfirmRow {
  return {
    confirmedAt: row.confirmed_at,
    deadlineAt: row.deadline_at,
    lastSentAt: row.last_sent_at,
    sendsToday: row.sends_today ?? 0,
    sendsDay: row.sends_day,
  };
}

async function rest<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; data: T | null }> {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return { ok: false, data: null };
  try {
    const response = await fetch(`${env.supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: env.supabaseServiceRoleKey,
        Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });
    if (!response.ok) return { ok: false, data: null };
    if (response.status === 204) return { ok: true, data: null };
    const text = await response.text();
    if (!text) return { ok: true, data: null };
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false, data: null };
  }
}

async function readStatus(userId: string): Promise<EmailConfirmRow | null> {
  const { ok, data } = await rest<StatusJson[]>(
    `manager_email_status?user_id=eq.${encodeURIComponent(userId)}&select=user_id,confirmed_at,deadline_at,last_sent_at,sends_today,sends_day&limit=1`,
  );
  if (!ok || !data || data.length === 0) return null;
  return mapRow(data[0]!);
}

export async function loadEmailGate(userId: string): Promise<EmailGate> {
  try {
    const row = await readStatus(userId);
    if (!env.supabaseServiceRoleKey) return emailGate(null, Date.now());
    return emailGate(row, Date.now());
  } catch {
    return emailGate(null, Date.now());
  }
}

async function ensurePending(userId: string, nowMs: number): Promise<EmailConfirmRow | null> {
  await rest('manager_email_status', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify({
      user_id: userId,
      deadline_at: deadlineFrom(nowMs),
    }),
  });
  return readStatus(userId);
}

/** Random part first, then which address it goes to. The stored hash covers both. */
function newToken(email: string): string {
  return randomBytes(32).toString('base64url') + emailTokenPart(email);
}

/** Read apart from the gate: without the column (late migration) nothing else changes. */
async function readEmailProof(userId: string): Promise<string | null | 'unknown'> {
  const { ok, data } = await rest<{ confirmed_email_hash: string | null }[]>(
    `manager_email_status?user_id=eq.${encodeURIComponent(userId)}&select=confirmed_email_hash&limit=1`,
  );
  return ok && data && data.length > 0 ? data[0]!.confirmed_email_hash : 'unknown';
}

async function currentEmail(userId: string): Promise<string | null> {
  try {
    const { data, error } = await createAdminClient().auth.admin.getUserById(userId);
    return error ? null : (data.user.email ?? null);
  } catch {
    return null;
  }
}

/** Own request: it must not decide whether the confirmation itself is saved. */
async function saveEmailProof(userId: string, token: string): Promise<boolean> {
  const email = await currentEmail(userId);
  if (!email || !tokenProvesEmail(token, email)) return false;
  const saved = await rest('manager_email_status?user_id=eq.' + encodeURIComponent(userId), {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ confirmed_email_hash: emailHash(email) }),
  });
  return saved.ok;
}

export function hashConfirmToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

async function sendConfirmLetter(email: string, token: string): Promise<boolean> {
  const origin = env.appUrl ?? 'https://www.lastfootball.pl';
  const next = `/auth/email-confirmed?token=${token}`;
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.signInWithOtp({
      email,
      options: { emailRedirectTo, shouldCreateUser: false },
    });
    return !error;
  } catch {
    return false;
  }
}

/** One row, one letter. Cooldown and the daily cap keep this off the hot path. */
export async function issueConfirmLink(userId: string, email: string): Promise<IssueLinkResult> {
  if (!env.supabaseServiceRoleKey) return 'failed';
  const nowMs = Date.now();
  const row = await ensurePending(userId, nowMs);
  if (!row) return 'failed';
  if (row.confirmedAt) {
    // Older confirmations have no proof of the address. The same link adds it.
    const proof = await readEmailProof(userId);
    if (proof === 'unknown' || isProvenEmail(proof, email)) return 'confirmed';
  }

  const block = resendBlock(row, nowMs);
  if (block) return block;

  const token = newToken(email);
  const sent = await sendConfirmLetter(email, token);
  if (!sent) return 'failed';

  const count = nextSendCount(row, nowMs);
  const saved = await rest('manager_email_status?user_id=eq.' + encodeURIComponent(userId), {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      token_hash: hashConfirmToken(token),
      token_expires_at: linkExpiryFrom(nowMs),
      last_sent_at: new Date(nowMs).toISOString(),
      sends_today: count.sendsToday,
      sends_day: count.sendsDay,
    }),
  });
  return saved.ok ? 'sent' : 'failed';
}

/** ok: first confirmation. proved: an older confirmation now has its address proven. */
export async function confirmEmailToken(token: string): Promise<'ok' | 'proved' | 'bad'> {
  if (!TOKEN_PATTERN.test(token) || !env.supabaseServiceRoleKey) return 'bad';
  const hash = hashConfirmToken(token);
  const found = await rest<
    { user_id: string; confirmed_at: string | null; token_expires_at: string | null }[]
  >(
    `manager_email_status?token_hash=eq.${hash}&select=user_id,confirmed_at,token_expires_at&limit=1`,
  );
  const row = found.ok && found.data && found.data.length > 0 ? found.data[0] : null;
  const expires = row?.token_expires_at ? Date.parse(row.token_expires_at) : NaN;
  if (!row || !Number.isFinite(expires) || expires <= Date.now()) return 'bad';

  if (row.confirmed_at) {
    const used = await rest<{ user_id: string }[]>(
      `manager_email_status?user_id=eq.${encodeURIComponent(row.user_id)}&token_hash=eq.${hash}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ token_hash: null, token_expires_at: null }),
      },
    );
    if (!used.ok || !used.data || used.data.length === 0) return 'bad';
    return (await saveEmailProof(row.user_id, token)) ? 'proved' : 'bad';
  }

  const now = new Date().toISOString();
  const saved = await rest<{ user_id: string }[]>(
    `manager_email_status?user_id=eq.${encodeURIComponent(row.user_id)}&token_hash=eq.${hash}&confirmed_at=is.null`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        confirmed_at: now,
        token_hash: null,
        token_expires_at: null,
      }),
    },
  );
  if (!saved.ok || !saved.data || saved.data.length === 0) return 'bad';
  await grantEmailConfirmBonus(row.user_id);
  await saveEmailProof(row.user_id, token);
  return 'ok';
}

export async function grantEmailConfirmBonus(userId: string): Promise<void> {
  await rest('rpc/grant_email_confirm_bonus', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ p_user: userId, p_amount: EMAIL_CONFIRM.bonusEur }),
  });
}
