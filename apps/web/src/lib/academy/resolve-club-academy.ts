import type { ClubDto } from '@/lib/club/types';
import type { HubPhase } from '@/lib/hub/types';
import { academyCeilingView } from '@/lib/academy/ceiling';
import { isCandidateId } from '@/lib/academy/intake';
import {
  academyLevel,
  academyUpgrade,
  ACADEMY_MAX_LEVEL,
  isLastAcademySeason,
  juniorTrainingBlock,
} from '@/lib/academy/levels';
import { formatMoney } from '@/lib/finance/format-money';
import { careerPhaseLabel, resolveCareerPhase } from '@/lib/squad/career-phase';
import { potentialBandLabel, resolvePotentialBand } from '@/lib/squad/potential';
import { isAcademyProspect, type PlayerRowDto } from '@/lib/squad/types';
import {
  type AcademyDto,
  type AcademyIntakeBlockedReason,
  type AcademyProspectDto,
  type AcademyState,
} from '@/lib/academy/types';

function displayPos(pos: string): string {
  if (pos === 'ŚO' || pos === 'LO') return 'OB';
  return pos;
}

/** The academy without D134: level 0 and nothing to choose or train. */
const OLD_ACADEMY: AcademyState = {
  levels: false,
  level: 0,
  offer: null,
  waitDays: 0,
  cash: 0,
  seasonNumber: 1,
  today: '',
};

function levelSummary(level: number): string {
  const rules = academyLevel(level);
  const choice =
    rules.candidates === 1 ? '1 kandydat' : `1 z ${rules.candidates} kandydatów do wyboru`;
  return `Miejsca: ${rules.slots}. Nabór co ${rules.intakeEveryDays} dni, ${choice}. Start: ${rules.skill[0]}–${rules.skill[1]}. Utrzymanie: ${formatMoney(rules.upkeep)} za mecz.`;
}

function toProspect(
  row: PlayerRowDto,
  revealed: boolean | null,
  state: AcademyState,
  trainedToday: boolean,
): AcademyProspectDto {
  const seasonGain = row.academyGainSeason === state.seasonNumber ? (row.academyGain ?? 0) : 0;
  const careerPhase = resolveCareerPhase({ age: row.age });
  const bandLabel = potentialBandLabel(row.potential);
  const ceiling =
    revealed === null
      ? { label: bandLabel, hidden: false }
      : academyCeilingView({ revealed, bandLabel });
  return {
    id: row.id,
    name: row.name,
    pos: displayPos(row.pos),
    age: row.age,
    potentialBand: ceiling.hidden ? 'low' : resolvePotentialBand(row.potential),
    potentialLabel: ceiling.label,
    careerPhase,
    careerPhaseLabel: careerPhaseLabel({ age: row.age }),
    lastSeason: isLastAcademySeason(row.age),
    seasonGain,
    trainingBlock: juniorTrainingBlock({
      age: row.age,
      seasonGain,
      trainedToday,
      cash: state.cash,
    }),
  };
}

/**
 * Sole Academy UI SSOT (LFE-ACADEMY-01 Thin A).
 * Pure — no Supabase. Prospects only; no academy OVR. Levels and training: D134.
 */
export function resolveClubAcademy(
  club: Pick<ClubDto, 'id'>,
  rows: readonly PlayerRowDto[],
  phase: HubPhase,
  revealedIds?: { has(id: string): boolean },
  state: AcademyState = OLD_ACADEMY,
): AcademyDto {
  const unlocked = phase === 'SEASON' || phase === 'PLAYOFF' || phase === 'OFFSEASON';
  const rules = academyLevel(state.level);
  const trainedToday = rows.some((row) => row.academyTrainedOn === state.today);
  const prospects = rows.filter(isAcademyProspect).map((row) => {
    const revealed =
      revealedIds == null ? null : revealedIds.has(row.id) || isCandidateId(row.id, club.id);
    return toProspect(row, revealed, state, trainedToday);
  });
  const prospectCount = prospects.length;
  const slotsFull = prospectCount >= rules.slots;

  let intakeBlockedReason: AcademyIntakeBlockedReason = null;
  if (!unlocked) intakeBlockedReason = 'not_season';
  else if (state.offer) intakeBlockedReason = 'offer_open';
  else if (slotsFull) intakeBlockedReason = 'slots_full';
  else if (state.waitDays > 0) intakeBlockedReason = 'waiting';

  const canIntake = intakeBlockedReason === null;

  return {
    clubId: club.id,
    phase,
    unlocked,
    prospects,
    prospectCount,
    maxProspects: rules.slots,
    canIntake,
    intakeBlockedReason,
    canPromote: unlocked && prospectCount > 0,
    hasLevels: state.levels,
    level: state.level,
    upkeep: rules.upkeep,
    summary: levelSummary(state.level),
    upgrade:
      state.level >= ACADEMY_MAX_LEVEL
        ? null
        : {
            cost: academyLevel(state.level + 1).cost,
            affordable: academyUpgrade({ level: state.level, cash: state.cash }).ok,
            effects: levelSummary(state.level + 1),
          },
    offer: state.offer
      ? {
          seq: state.offer.seq,
          candidates: state.offer.candidates.map((candidate, index) => ({
            index,
            name: candidate.name,
            pos: displayPos(candidate.pos),
            age: candidate.age,
            potentialLabel: potentialBandLabel(candidate.potential),
          })),
        }
      : null,
    waitDays: state.waitDays,
  };
}
