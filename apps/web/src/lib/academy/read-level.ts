import { academyLevel, clampAcademyLevel } from '@/lib/academy/levels';
import type { AcademyReadDb } from '@/lib/academy/store';

// Not a 'use server' module on purpose: it takes a club id. Callers authorise the owner first.

/** Null when the column is missing or unreadable: the academy is the old one. */
export async function readAcademyLevel(db: AcademyReadDb, clubId: string): Promise<number | null> {
  const { data, error } = await db
    .from('clubs')
    .select('academy_level')
    .eq('id', clubId)
    .maybeSingle();
  if (error || !data) return null;
  return clampAcademyLevel((data as { academy_level?: number }).academy_level);
}

/** EUR one settled match costs. 0 for the old academy. */
export async function loadAcademyUpkeep(db: AcademyReadDb, clubId: string): Promise<number> {
  return academyLevel((await readAcademyLevel(db, clubId)) ?? 0).upkeep;
}
