/** Server only. The account address changes after the new one is proven (D150). */

import { createHash, randomBytes } from 'node:crypto';

import { env } from '@/config/env';
import { emailChangeLetter, noticeLetter, sendAccountLetter } from '@/lib/auth/account-mail';
import { grantEmailConfirmBonus } from '@/lib/auth/email-confirm';
import { emailHash } from '@/lib/auth/email-proof';
import { createAdminClient } from '@/lib/supabase/admin';

const LINK_MS = 24 * 60 * 60 * 1000;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{40,64}$/;
export const EMAIL_PATTERN = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[A-Za-z]{2,24}$/;

const origin = () => env.appUrl ?? 'https://www.lastfootball.pl';
const hashOf = (token: string) => createHash('sha256').update(token).digest('hex');

/** One pending address per account: a new request replaces the one before. */
export async function startEmailChange(userId: string, newEmail: string): Promise<boolean> {
  const token = randomBytes(32).toString('base64url');
  const saved = await createAdminClient()
    .from('email_changes' as never)
    .upsert(
      {
        user_id: userId,
        new_email: newEmail,
        token_hash: hashOf(token),
        expires_at: new Date(Date.now() + LINK_MS).toISOString(),
      } as never,
      { onConflict: 'user_id' },
    );
  if (saved.error) return false;
  return sendAccountLetter(
    newEmail,
    emailChangeLetter(origin(), token),
    `email-${hashOf(token).slice(0, 40)}`,
  );
}

export type EmailChangeResult = 'ok' | 'bad' | 'taken';

export async function finishEmailChange(token: string): Promise<EmailChangeResult> {
  if (!TOKEN_PATTERN.test(token)) return 'bad';
  const admin = createAdminClient();
  // Taking the row is the claim: a second click finds nothing.
  const claimed = await admin
    .from('email_changes' as never)
    .delete()
    .eq('token_hash', hashOf(token))
    .gt('expires_at', new Date().toISOString())
    .select('user_id, new_email')
    .maybeSingle();
  const row = claimed.data as unknown as { user_id: string; new_email: string } | null;
  if (claimed.error || !row) return 'bad';

  const before = await admin.auth.admin.getUserById(row.user_id);
  const changed = await admin.auth.admin.updateUserById(row.user_id, {
    email: row.new_email,
    email_confirm: true,
  });
  if (changed.error) return 'taken';

  // The click proved the new address: the same as a confirmation.
  const now = new Date().toISOString();
  await admin
    .from('manager_email_status' as never)
    .update({
      confirmed_email_hash: emailHash(row.new_email),
      token_hash: null,
      token_expires_at: null,
    } as never)
    .eq('user_id', row.user_id);
  await admin
    .from('manager_email_status' as never)
    .update({ confirmed_at: now } as never)
    .eq('user_id', row.user_id)
    .is('confirmed_at', null);
  await grantEmailConfirmBonus(row.user_id);

  const old = before.data?.user?.email;
  if (old) {
    await sendAccountLetter(
      old,
      noticeLetter(
        origin(),
        'Adres konta został zmieniony',
        'Konto Last Football ma teraz inny adres e-mail. Jeśli to nie Ty, odpisz jak najszybciej na kontakt@lastfootball.pl.',
      ),
      `email-changed-${hashOf(token).slice(0, 40)}`,
    );
  }
  return 'ok';
}
