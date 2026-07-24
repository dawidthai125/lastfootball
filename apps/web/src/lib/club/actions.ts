'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { CREST_TEMPLATES } from '@/lib/club/catalog';
import type { CreateClubState } from '@/lib/club/action-types';
import { validateClubIdentity } from '@/lib/club/validation';
import { env } from '@/config/env';
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

  // Database typings lag migrations in CI/local until regen — insert payload validated above.
  const { error } = await supabase.from('clubs').insert({
    owner_id: user.id,
    name: parsed.value.name,
    short_name: parsed.value.shortName,
    primary_color: parsed.value.primaryColor,
    secondary_color: parsed.value.secondaryColor,
    crest_template_id: parsed.value.crestTemplateId,
  } as never);

  if (error) {
    if (error.code === '23505') {
      return { error: 'Nazwa klubu jest już zajęta. Wybierz inną.' };
    }
    return { error: 'Nie udało się zapisać klubu. Spróbuj ponownie.' };
  }

  // Clear legacy smoke/dev metadata flag if present
  if (user.user_metadata?.has_club === true) {
    await supabase.auth.updateUser({ data: { has_club: null } });
  }

  revalidatePath('/', 'layout');
  redirect('/onboarding/first-match');
}
