'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';

/** Mark the cup tie as the match you can enter, then open its pre-match screen. */
export async function openCupTie(formData: FormData): Promise<void> {
  if (!env.isSupabaseConfigured) redirect('/league');

  const fixtureId = String(formData.get('fixtureId') ?? '');
  if (!fixtureId) redirect('/league');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: club } = await supabase
    .from('clubs')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!club) redirect('/welcome');

  const clubId = (club as { id: string }).id;
  const { data: fixture } = await supabase
    .from('fixtures')
    .select('id, status, competition')
    .eq('id', fixtureId)
    .eq('club_id', clubId)
    .maybeSingle();

  const row = fixture as { id: string; status: string; competition: string } | null;
  if (!row || row.competition !== 'cup') redirect('/league');
  if (row.status === 'played') redirect(`/match/${row.id}`);

  if (row.status === 'scheduled') {
    await supabase
      .from('fixtures')
      .update({ status: 'upcoming' } as never)
      .eq('id', row.id)
      .eq('club_id', clubId)
      .eq('status', 'scheduled');
  }

  revalidatePath('/', 'layout');
  redirect(`/match/${row.id}`);
}
