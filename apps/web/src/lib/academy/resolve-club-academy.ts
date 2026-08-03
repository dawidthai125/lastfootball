import type { ClubDto } from '@/lib/club/types';
import type { HubPhase } from '@/lib/hub/types';
import { careerPhaseLabel, resolveCareerPhase } from '@/lib/squad/career-phase';
import { potentialBandLabel, resolvePotentialBand } from '@/lib/squad/potential';
import { isAcademyProspect, type PlayerRowDto } from '@/lib/squad/types';
import {
  ACADEMY_THIN,
  type AcademyDto,
  type AcademyIntakeBlockedReason,
  type AcademyProspectDto,
} from '@/lib/academy/types';

function displayPos(pos: string): string {
  if (pos === 'ŚO' || pos === 'LO') return 'OB';
  return pos;
}

function toProspect(row: PlayerRowDto): AcademyProspectDto {
  const careerPhase = resolveCareerPhase({ age: row.age });
  return {
    id: row.id,
    name: row.name,
    pos: displayPos(row.pos),
    age: row.age,
    potentialBand: resolvePotentialBand(row.potential),
    potentialLabel: potentialBandLabel(row.potential),
    careerPhase,
    careerPhaseLabel: careerPhaseLabel({ age: row.age }),
  };
}

/**
 * Sole Academy UI SSOT (LFE-ACADEMY-01 Thin A).
 * Pure — no Supabase. Prospects only; no academy OVR / budget / levels.
 */
export function resolveClubAcademy(
  club: Pick<ClubDto, 'id'>,
  rows: readonly PlayerRowDto[],
  phase: HubPhase,
): AcademyDto {
  const unlocked = phase === 'SEASON' || phase === 'PLAYOFF' || phase === 'OFFSEASON';
  const prospects = rows.filter(isAcademyProspect).map(toProspect);
  const prospectCount = prospects.length;
  const slotsFull = prospectCount >= ACADEMY_THIN.MAX_PROSPECTS;

  let intakeBlockedReason: AcademyIntakeBlockedReason = null;
  if (!unlocked) intakeBlockedReason = 'not_season';
  else if (slotsFull) intakeBlockedReason = 'slots_full';

  const canIntake = intakeBlockedReason === null;

  return {
    clubId: club.id,
    phase,
    unlocked,
    prospects,
    prospectCount,
    maxProspects: ACADEMY_THIN.MAX_PROSPECTS,
    canIntake,
    intakeBlockedReason,
    canPromote: unlocked && prospectCount > 0,
  };
}
