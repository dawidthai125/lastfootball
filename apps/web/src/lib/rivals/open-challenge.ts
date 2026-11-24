import { nextChallengeMatchday } from '@/lib/rivals/matchday';
import type { createAdminClient } from '@/lib/supabase/admin';

// Not a 'use server' module on purpose: it takes club ids. Callers authorise the challenger first.

type ChallengeClub = { readonly id: string; readonly name: string; readonly shortName: string };

/** Fixture and challenge row, or nothing. Returns the fixture id. */
export async function openChallenge(
  admin: ReturnType<typeof createAdminClient>,
  challenger: ChallengeClub,
  rival: ChallengeClub,
): Promise<string | null> {
  const { data: days, error: daysErr } = await admin
    .from('fixtures')
    .select('matchday')
    .eq('club_id', challenger.id)
    .eq('competition', 'challenge');
  if (daysErr) return null;
  const { data: fixture, error: fixtureErr } = await admin
    .from('fixtures')
    .insert({
      club_id: challenger.id,
      matchday: nextChallengeMatchday(
        ((days ?? []) as { matchday: number }[]).map((row) => row.matchday),
      ),
      competition: 'challenge',
      opponent_club_id: rival.id,
      is_home: true,
      status: 'upcoming',
    } as never)
    .select('id')
    .single();
  const created = fixture as { id: string } | null;
  if (fixtureErr || !created) return null;

  const { error } = await admin.from('rival_challenges').insert({
    fixture_id: created.id,
    challenger_club_id: challenger.id,
    challenger_name: challenger.name,
    challenger_short: challenger.shortName,
    rival_club_id: rival.id,
    rival_name: rival.name,
    rival_short: rival.shortName,
    status: 'open',
  } as never);
  if (error) {
    await admin.from('fixtures').delete().eq('id', created.id).eq('club_id', challenger.id);
    return null;
  }
  return created.id;
}
