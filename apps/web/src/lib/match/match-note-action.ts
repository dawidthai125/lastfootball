'use server';

import { z } from 'zod';

import { getAuthUser } from '@/lib/auth/session';
import { composeMatchNote, matchNoteProviders, type MatchNoteFacts } from '@/lib/match/match-note';

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
});

/** One note for a logged-in manager. Null keeps the template sentence on screen. */
export async function writeMatchNote(input: unknown): Promise<string | null> {
  const user = await getAuthUser();
  if (!user) return null;
  const parsed = factsSchema.safeParse(input);
  if (!parsed.success) return null;
  const facts: MatchNoteFacts = parsed.data;
  return composeMatchNote(facts, matchNoteProviders(process.env), fetch);
}
