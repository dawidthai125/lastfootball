import { isInviteCode, newInviteCode } from '@/lib/invites/code';
import { openChallenge } from '@/lib/rivals/open-challenge';
import { tryAdminClient } from '@/lib/supabase/admin';

// Not a 'use server' module on purpose: it takes club ids.

export type Inviter = { readonly id: string; readonly name: string; readonly shortName: string };

/** The invitation code of a club, made on first use, and how many clubs came with it. */
export async function loadInvite(clubId: string): Promise<{ code: string; used: number } | null> {
  const admin = tryAdminClient();
  if (!admin) return null;
  const read = () => admin.from('club_invites').select('code').eq('club_id', clubId).maybeSingle();
  let { data, error } = await read();
  if (error) return null;
  if (!data) {
    const code = newInviteCode();
    const made = await admin
      .from('club_invites')
      .insert({ club_id: clubId, code } as never)
      .select('code')
      .maybeSingle();
    // Another tab may have been first; the next visit shows its code.
    if (made.error) return null;
    ({ data, error } = made);
  }
  const code = (data as { code: string } | null)?.code;
  if (error || !isInviteCode(code)) return null;
  const uses = await admin
    .from('club_invite_uses')
    .select('invited_club_id', { count: 'exact', head: true })
    .eq('inviter_club_id', clubId);
  return { code, used: uses.count ?? 0 };
}

export async function findInviter(code: unknown): Promise<Inviter | null> {
  const admin = tryAdminClient();
  if (!admin || !isInviteCode(code)) return null;
  const { data, error } = await admin
    .from('club_invites')
    .select('clubs ( id, name, short_name )')
    .eq('code', code)
    .maybeSingle();
  const club = (
    data as unknown as { clubs: { id: string; name: string; short_name: string } | null }
  )?.clubs;
  if (error || !club) return null;
  return { id: club.id, name: club.name, shortName: club.short_name };
}

/** After the club exists: remember who invited it and open a challenge. Never blocks onboarding. */
export async function acceptInvite(code: unknown, club: Inviter): Promise<void> {
  try {
    const admin = tryAdminClient();
    const inviter = await findInviter(code);
    if (!admin || !inviter || inviter.id === club.id) return;
    const { error } = await admin
      .from('club_invite_uses')
      .insert({ invited_club_id: club.id, inviter_club_id: inviter.id } as never);
    if (error) return;
    await openChallenge(admin, club, inviter);
  } catch {
    console.error('acceptInvite failed');
  }
}
