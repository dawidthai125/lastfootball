import { hashPlayerId, resolvePlayerPotential } from '@/lib/squad/potential';
import type { PlayerRowDto } from '@/lib/squad/types';
import { academyLevel } from '@/lib/academy/levels';
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
  takenShirts: readonly number[] = [],
): AcademyIntakeDraft | { error: string } {
  const prospects = existing.filter((p) => p.academyTrack && p.departedAt == null);
  if (prospects.length >= ACADEMY_THIN.MAX_PROSPECTS) {
    return { error: 'Limit perspektyw akademii wyczerpany (3).' };
  }

  const usedShirts = new Set([
    ...existing.filter((p) => p.departedAt == null).map((p) => p.shirtNumber),
    ...takenShirts,
  ]);
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

/** One candidate of a stored intake. The potential number never leaves the server. */
export type AcademyCandidate = {
  readonly id: string;
  readonly name: string;
  readonly pos: string;
  readonly role: string;
  readonly age: number;
  readonly skill: number;
  readonly potential: number;
};

/** Id of a junior from a stored intake. The intake number keeps it unique for good. */
function candidateId(clubId: string, seq: number, index: number): string {
  return `${ACADEMY_THIN.ID_PREFIX}-${clubTagFromId(clubId)}-n${seq}-${index}`;
}

/** Such a junior was chosen by his potential band, so the band stays known. */
export function isCandidateId(playerId: string, clubId: string): boolean {
  return (
    isAcademyId(playerId, clubId) &&
    /^n[0-9]+-[0-9]$/.test(playerId.slice(playerId.indexOf('-', 2) + 1))
  );
}

/** Same club, number and level: same candidates. Positions within one intake differ. */
export function generateAcademyCandidates(
  clubId: string,
  seq: number,
  level: number,
): AcademyCandidate[] {
  const rules = academyLevel(level);
  const [low, high] = rules.skill;
  const roll = (index: number, part: string) =>
    hashPlayerId(`${part}:${clubId}:${seq}:${index}`) >>> 8;
  const first = roll(0, 'pos');
  return Array.from({ length: rules.candidates }, (_, index) => {
    const template = YOUTH_TEMPLATES[(first + index) % YOUTH_TEMPLATES.length]!;
    const id = candidateId(clubId, seq, index);
    const age = 16 + (roll(index, 'age') % 3);
    const skill = low + (roll(index, 'skill') % (high - low + 1));
    return {
      id,
      name: template.names[roll(index, 'name') % template.names.length]!,
      pos: template.pos,
      role: template.role,
      age,
      skill,
      potential: resolvePlayerPotential(skill, id, age),
    };
  });
}

/** Level 0 rhythm, about three intakes in a league season (D133). Higher levels wait less. */
export const INTAKE_EVERY_DAYS = academyLevel(0).intakeEveryDays;

export function isAcademyId(playerId: string, clubId: string): boolean {
  return playerId.startsWith(`${ACADEMY_THIN.ID_PREFIX}-${clubTagFromId(clubId)}-`);
}

/** Full days until the next intake; 0 = now. */
export function intakeWaitDays(
  intakes: readonly string[],
  now: Date,
  everyDays: number = INTAKE_EVERY_DAYS,
): number {
  const last = Math.max(...intakes.map((at) => Date.parse(at)).filter(Number.isFinite), 0);
  if (last === 0) return 0;
  return Math.max(0, Math.ceil((last + everyDays * 86_400_000 - now.getTime()) / 86_400_000));
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
