import { hashPlayerId, resolvePlayerPotential } from '@/lib/squad/potential';
import type { PlayerRowDto } from '@/lib/squad/types';
import { ACADEMY_THIN } from '@/lib/academy/types';

const YOUTH_TEMPLATES = [
  { pos: 'ŚP', role: 'CM', names: ['J. Kowalik', 'T. Lis', 'M. Drozd'] },
  { pos: 'N', role: 'ST', names: ['R. Biały', 'K. Wilk', 'A. Sobek'] },
  { pos: 'ŚO', role: 'CB', names: ['M. Sowa', 'P. Dąb', 'L. Kruk'] },
  { pos: 'PO', role: 'RB', names: ['O. Jeleń', 'S. Borsuk', 'W. Ryś'] },
  { pos: 'PN', role: 'RW', names: ['E. Sokół', 'D. Orzeł', 'I. Czajka'] },
  { pos: 'BR', role: 'GK', names: ['U. Brama', 'Y. Mur', 'N. Bastion'] },
] as const;

export type AcademyIntakeDraft = {
  readonly id: string;
  readonly name: string;
  readonly shirtNumber: number;
  readonly pos: string;
  readonly role: string;
  readonly age: number;
  readonly skill: number;
  readonly potential: number;
};

/** Free shirt 90–99 preferred, then any 1–99 unused. */
export function allocateAcademyShirt(used: ReadonlySet<number>): number | null {
  for (let n = 90; n <= 99; n++) {
    if (!used.has(n)) return n;
  }
  for (let n = 1; n <= 89; n++) {
    if (!used.has(n)) return n;
  }
  return null;
}

export function clubTagFromId(clubId: string): string {
  const raw = clubId.replace(/-/g, '').slice(0, 8);
  return raw.length > 0 ? raw : 'club';
}

/**
 * Pure Intake draft — REUSE resolvePlayerPotential (D22).
 * No second OVR. Caller persists to players with academy_track=true.
 */
export function buildAcademyIntakeDraft(
  clubId: string,
  existing: readonly PlayerRowDto[],
  salt = Date.now(),
): AcademyIntakeDraft | { error: string } {
  const prospects = existing.filter((p) => p.academyTrack && p.departedAt == null);
  if (prospects.length >= ACADEMY_THIN.MAX_PROSPECTS) {
    return { error: 'Limit perspektyw akademii wyczerpany (3).' };
  }

  const usedShirts = new Set(
    existing.filter((p) => p.departedAt == null).map((p) => p.shirtNumber),
  );
  const shirt = allocateAcademyShirt(usedShirts);
  if (shirt == null) return { error: 'Brak wolnego numeru koszulki.' };

  const tag = clubTagFromId(clubId);
  const id = `${ACADEMY_THIN.ID_PREFIX}-${tag}-${salt.toString(36)}`;
  const h = hashPlayerId(id);
  const template = YOUTH_TEMPLATES[h % YOUTH_TEMPLATES.length]!;
  const name = template.names[h % template.names.length]!;
  const age = 16 + (h % 3); // 16–18
  const skill = 40 + (h % 13); // 40–52
  const potential = resolvePlayerPotential(skill, id, age);

  return {
    id,
    name,
    shirtNumber: shirt,
    pos: template.pos,
    role: template.role,
    age,
    skill,
    potential,
  };
}

/** Pure Promote guards — no skill/potential mutation. */
export function canPromoteProspect(
  rows: readonly PlayerRowDto[],
  playerId: string,
  clubId: string,
): { ok: true; player: PlayerRowDto } | { ok: false; error: string } {
  const player = rows.find((p) => p.id === playerId);
  if (!player || player.clubId !== clubId) {
    return { ok: false, error: 'Nie znaleziono perspektywy.' };
  }
  if (player.departedAt != null || player.status === 'DEPARTED') {
    return { ok: false, error: 'Zawodnik niedostępny.' };
  }
  if (!player.academyTrack) {
    return { ok: false, error: 'Zawodnik nie jest w torze akademii.' };
  }
  return { ok: true, player };
}
