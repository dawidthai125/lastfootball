'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { CREST_TEMPLATES } from '@/lib/club/catalog';
import type { CreateClubState } from '@/lib/club/action-types';
import { validateClubIdentity } from '@/lib/club/validation';
import { env } from '@/config/env';
import { grantEmailConfirmBonus } from '@/lib/auth/email-confirm';
import { ECONOMY_THIN } from '@/lib/finance';
import { INVITE_COOKIE } from '@/lib/invites/code';
import { acceptInvite } from '@/lib/invites/store';
import { buildStarterSponsorContractInsert } from '@/lib/sponsors/types';
import { buildStarterPlayerInserts } from '@/lib/squad/build-player-inserts';
import { tryAdminClient, serverDb } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function createClub(
  _prev: CreateClubState,
  formData: FormData,
): Promise<CreateClubState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const parsed = validateClubIdentity({
    name: String(formData.get('name') ?? ''),
    shortName: String(formData.get('shortName') ?? ''),
    primaryColor: String(formData.get('primaryColor') ?? ''),
    secondaryColor: String(formData.get('secondaryColor') ?? ''),
    crestTemplateId: String(formData.get('crestTemplateId') ?? ''),
    allowedCrestIds: CREST_TEMPLATES.map((t) => t.id),
  });

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesja wygasła. Zaloguj się ponownie.' };
  }

  const { data: existing } = await supabase
    .from('clubs')
    .select('id, first_match_completed_at')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (existing) {
    const row = existing as { id: string; first_match_completed_at: string | null };
    redirect(row.first_match_completed_at ? '/hub' : '/onboarding/first-match');
  }

  if (!tryAdminClient()) {
    return { error: 'Tworzenie klubu nie jest skonfigurowane na serwerze.' };
  }

  // Database typings lag migrations in CI/local until regen — insert payload validated above.
  const { data: created, error } = await supabase
    .from('clubs')
    .insert({
      owner_id: user.id,
      name: parsed.value.name,
      short_name: parsed.value.shortName,
      primary_color: parsed.value.primaryColor,
      secondary_color: parsed.value.secondaryColor,
      crest_template_id: parsed.value.crestTemplateId,
      cash_balance: ECONOMY_THIN.STARTER_CASH,
    } as never)
    .select('id')
    .maybeSingle();

  if (error) {
    if (error.code === '23505') {
      return { error: 'Nazwa klubu jest już zajęta. Wybierz inną.' };
    }
    return { error: 'Nie udało się zapisać klubu. Spróbuj ponownie.' };
  }

  const clubId = (created as { id: string } | null)?.id;
  if (clubId) {
    const { error: squadErr } = await serverDb(supabase)
      .from('players')
      .insert(buildStarterPlayerInserts(clubId) as never);
    if (squadErr) {
      // A club without players cannot continue; the row cascades and the form can be sent again.
      await serverDb(supabase).from('clubs').delete().eq('id', clubId).eq('owner_id', user.id);
      return { error: 'Nie udało się przygotować kadry. Spróbuj ponownie.' };
    }
    await serverDb(supabase)
      .from('finance_movements')
      .insert({
        club_id: clubId,
        category: 'starter',
        label: 'Kapitał startowy',
        amount: ECONOMY_THIN.STARTER_CASH,
      } as never);
    // LFE-SPONSORS-01: seed Thin contract · no base payout at create (Owner LOCK 2).
    await tryAdminClient()
      ?.from('club_sponsor_contracts')
      .insert(buildStarterSponsorContractInsert(clubId, 1) as never);
    await grantEmailConfirmBonus(user.id);
    const jar = await cookies();
    const invite = jar.get(INVITE_COOKIE)?.value;
    if (invite) {
      await acceptInvite(invite, {
        id: clubId,
        name: parsed.value.name,
        shortName: parsed.value.shortName,
      });
      jar.delete(INVITE_COOKIE);
    }
  }

  // Clear legacy smoke/dev metadata flag if present
  if (user.user_metadata?.has_club === true) {
    await supabase.auth.updateUser({ data: { has_club: null } });
  }

  revalidatePath('/', 'layout');
  redirect('/onboarding/first-match');
}
