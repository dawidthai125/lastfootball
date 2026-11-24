import { utcDateString } from '@/lib/fixtures/played-unlock';
import { restedEnergy, restedStatus } from '@/lib/squad/rest';
import { isPersonality } from '@/lib/squad/depth';
import { resolvePlayerPotential } from '@/lib/squad/potential';
import type { AttrGroups, PlayerRowDto, PlayerStatus } from '@/lib/squad/types';

export type PlayerDbRow = {
  id: string;
  club_id: string;
  name: string;
  shirt_number: number;
  pos: string;
  role: string;
  starter: boolean;
  captain: boolean;
  age: number;
  skill: number;
  /** Optional for older fixtures/tests — filled via resolvePlayerPotential when absent. */
  potential?: number | null;
  status: string;
  nationality: string;
  version: number;
  departed_at: string | null;
  /** Optional for older fixtures/tests — defaults to null. */
  transfer_listed_at?: string | null;
  /** Optional for older fixtures/tests — defaults to false (senior). */
  academy_track?: boolean | null;
  /** Optional for older fixtures/tests — defaults to null. */
  promoted_at?: string | null;
  attr_attack?: number | null;
  attr_passing?: number | null;
  attr_defense?: number | null;
  attr_physical?: number | null;
  attr_goalkeeping?: number | null;
  energy?: number | null;
  energy_on?: string | null;
  origin?: string | null;
  joined_at?: string | null;
  senior_matches?: number | null;
  /** Not a column: set when the sale facts failed to load. */
  sale_unknown?: boolean;
  academy_trained_on?: string | null;
  academy_gain?: number | null;
  academy_gain_season?: number | null;
  form?: number | null;
  wage?: number | null;
  suspension_matches?: number | null;
  injury_matches?: number | null;
  recent_ratings?: number[] | null;
  morale?: number | null;
  personality?: string | null;
  contract_until?: string | null;
  contract_season?: number | null;
  release_clause?: number | null;
  set_piece?: boolean | null;
  last_individual_on?: string | null;
  on_loan?: boolean | null;
  loan_until?: string | null;
  wage_bank?: number | null;
  loaned_in?: boolean | null;
  loan_partner_label?: string | null;
  intl_absent_until?: string | null;
};

const STATUSES: readonly PlayerStatus[] = ['READY', 'INJURED', 'SUSPENDED', 'TIRED', 'DEPARTED'];

function mapStatus(raw: string): PlayerStatus {
  if ((STATUSES as readonly string[]).includes(raw)) return raw as PlayerStatus;
  return 'READY';
}

export function mapPlayerRow(row: PlayerDbRow, today: string = utcDateString()): PlayerRowDto {
  const energy =
    typeof row.energy === 'number' ? restedEnergy(row.energy, row.energy_on, today) : undefined;
  const status = mapStatus(row.status);
  return {
    id: row.id,
    clubId: row.club_id,
    name: row.name,
    shirtNumber: row.shirt_number,
    pos: row.pos,
    role: row.role,
    starter: row.starter,
    captain: row.captain,
    age: row.age,
    skill: row.skill,
    potential:
      typeof row.potential === 'number' && row.potential >= 1
        ? Math.min(99, Math.max(row.skill, row.potential))
        : resolvePlayerPotential(row.skill, row.id, row.age),
    status: energy === undefined ? status : restedStatus(status, row.energy ?? energy, energy),
    nationality: row.nationality,
    version: row.version,
    departedAt: row.departed_at,
    transferListedAt: row.transfer_listed_at ?? null,
    academyTrack: Boolean(row.academy_track),
    promotedAt: row.promoted_at ?? null,
    origin: row.origin ?? null,
    joinedAt: row.joined_at ?? null,
    seniorMatches: row.senior_matches ?? 0,
    ...(row.sale_unknown === true ? { saleUnknown: true } : {}),
    academyTrainedOn: row.academy_trained_on ?? null,
    academyGain: row.academy_gain ?? 0,
    academyGainSeason: row.academy_gain_season ?? null,
    groups: groupsFromRow(row),
    energy,
    form: typeof row.form === 'number' ? row.form : undefined,
    wage: typeof row.wage === 'number' ? row.wage : undefined,
    suspensionMatches:
      typeof row.suspension_matches === 'number' ? row.suspension_matches : undefined,
    injuryMatches: typeof row.injury_matches === 'number' ? row.injury_matches : undefined,
    recentRatings: Array.isArray(row.recent_ratings) ? row.recent_ratings : undefined,
    morale: typeof row.morale === 'number' ? row.morale : undefined,
    personality: isPersonality(row.personality) ? row.personality : undefined,
    contractUntil: row.contract_until ?? null,
    contractSeason: row.contract_season ?? null,
    releaseClause: typeof row.release_clause === 'number' ? row.release_clause : undefined,
    setPiece: row.set_piece === true,
    lastIndividualOn: row.last_individual_on ?? null,
    onLoan: row.on_loan === true,
    loanUntil: row.loan_until ?? null,
    wageBank: typeof row.wage_bank === 'number' ? row.wage_bank : undefined,
    loanedIn: row.loaned_in === true,
    loanPartnerLabel: row.loan_partner_label ?? null,
    intlAbsentUntil: row.intl_absent_until ?? null,
  };
}

function groupsFromRow(row: PlayerDbRow): AttrGroups | undefined {
  const attack = row.attr_attack;
  const passing = row.attr_passing;
  const defense = row.attr_defense;
  const physical = row.attr_physical;
  const goalkeeping = row.attr_goalkeeping;
  if (
    typeof attack !== 'number' ||
    typeof passing !== 'number' ||
    typeof defense !== 'number' ||
    typeof physical !== 'number' ||
    typeof goalkeeping !== 'number'
  ) {
    return undefined;
  }
  return { attack, passing, defense, physical, goalkeeping };
}
