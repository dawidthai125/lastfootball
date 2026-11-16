'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { env } from '@/config/env';
import { getAuthUser } from '@/lib/auth/session';
import { getManagerClub } from '@/lib/club/get-manager-club';
import {
  composeMatchNote,
  MATCH_NOTE_SAVE_GAP_MS,
  MATCH_NOTE_SAVE_TRIES,
  matchNoteProviders,
  matchNoteSaveStillWaiting,
  type MatchNoteFacts,
} from '@/lib/match/match-note';
import { createClient } from '@/lib/supabase/server';

const factsSchema = z.object({
  homeName: z.string().trim().min(1).max(80),
  awayName: z.string().trim().min(1).max(80),
  homeScore: z.number().int().min(0).max(30),
  awayScore: z.number().int().min(0).max(30),
  homeShots: z.number().int().min(0).max(80),
  awayShots: z.number().int().min(0).max(80),
  homePasses: z.number().int().min(0).max(2000),
  awayPasses: z.number().int().min(0).max(2000),
  goals: z
    .array(
      z.object({
        minute: z.string().max(8),
        side: z.enum(['home', 'away', 'unknown']),
        text: z.string().max(80),
      }),
    )
    .max(12),
  why: z.string().max(240),
  fixtureId: z.string().uuid().optional(),
});

async function rememberMatchNote(
  fixtureId: string,
  note: string,
  homeScore: number,
  awayScore: number,
): Promise<void> {
  if (!env.isSupabaseConfigured) return;
  const club = await getManagerClub();
  if (!club) return;
  const supabase = await createClient();
  for (let attempt = 0; attempt < MATCH_NOTE_SAVE_TRIES; attempt += 1) {
    const { data, error } = await supabase
      .from('fixtures')
      .update({ match_note: note } as never)
      .eq('id', fixtureId)
      .eq('club_id', club.id)
      .eq('status', 'played')
      .eq('home_score', homeScore)
      .eq('away_score', awayScore)
      .is('match_note', null)
      .select('id');
    if (error || (data && data.length > 0)) {
      if (data && data.length > 0) revalidatePath(`/match/${fixtureId}`);
      return;
    }
    const { data: row } = await supabase
      .from('fixtures')
      .select('status, match_note, home_score, away_score')
      .eq('id', fixtureId)
      .eq('club_id', club.id)
      .maybeSingle();
    if (!matchNoteSaveStillWaiting(row, homeScore, awayScore)) return;
    await new Promise((resolve) => setTimeout(resolve, MATCH_NOTE_SAVE_GAP_MS));
  }
}

/** One note for a logged-in manager. Null keeps the template sentence on screen. */
export async function writeMatchNote(input: unknown): Promise<string | null> {
  const user = await getAuthUser();
  if (!user) return null;
  const parsed = factsSchema.safeParse(input);
  if (!parsed.success) return null;
  const facts: MatchNoteFacts = parsed.data;
  const note = await composeMatchNote(facts, matchNoteProviders(process.env), fetch);
  if (note && parsed.data.fixtureId) {
    try {
      await rememberMatchNote(parsed.data.fixtureId, note, facts.homeScore, facts.awayScore);
    } catch {
      // The summary still shows the note when the row is not ready.
    }
  }
  return note;
}
