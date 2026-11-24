import type { CareerPhaseId } from '@/lib/squad/career-phase';
import type { PotentialBandId } from '@/lib/squad/potential';

export type AttrGroups = {
  readonly attack: number;
  readonly passing: number;
  readonly defense: number;
  readonly physical: number;
  readonly goalkeeping: number;
};

/** Domain player readiness — stored in DB; localized in STATUS_LABEL / UI. */
export type PlayerStatus = 'READY' | 'INJURED' | 'SUSPENDED' | 'TIRED' | 'DEPARTED';

export type SquadPlayerDto = {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  /** Shirt number 1–99. Unique in the club. */
  readonly shirtNumber: number;
  readonly position: string;
  readonly age: number;
  readonly form: number;
  readonly energy: number;
  readonly skill: number;
  /** Presentation only — never expose raw potential number. */
  readonly potentialBand: PotentialBandId;
  readonly potentialLabel: string;
  /** Derived Career Phase (D124) — never persisted. */
  readonly careerPhase: CareerPhaseId;
  readonly careerPhaseLabel: string;
  readonly status: PlayerStatus;
  readonly suspensionMatches?: number;
  readonly injuryMatches?: number;
  readonly morale?: number;
  readonly personality?: string;
  readonly setPiece?: boolean;
  readonly onLoan?: boolean;
  readonly loanedIn?: boolean;
  readonly intlAbsentUntil?: string | null;
  readonly nationality: string;
  readonly attributes: readonly { label: string; value: number }[];
  readonly contract: {
    readonly wage: number;
    readonly until: string;
    readonly clause: number;
    readonly role: string;
  };
  readonly history: readonly string[];
  readonly starter: boolean;
  readonly captain: boolean;
  readonly version: number;
};

export type SquadDto = {
  readonly clubId: string;
  readonly players: readonly SquadPlayerDto[];
};

/** Persistence / list shape (DB → app). */
export type PlayerRowDto = {
  readonly id: string;
  readonly clubId: string;
  readonly name: string;
  readonly shirtNumber: number;
  readonly pos: string;
  readonly role: string;
  readonly starter: boolean;
  readonly captain: boolean;
  readonly age: number;
  readonly skill: number;
  /** Ceiling SSOT — skill never exceeds potential. */
  readonly potential: number;
  readonly status: PlayerStatus;
  readonly nationality: string;
  readonly version: number;
  readonly departedAt: string | null;
  /** When set — on club transfer list (LFE-TRANSFERS-04). */
  /** academy · free · bought · loan; null = starting squad (D133). */
  readonly origin?: string | null;
  readonly joinedAt?: string | null;
  /** Matches in the starting eleven since he joined the seniors (D134). */
  readonly seniorMatches?: number;
  /** Origin or matches could not be read, so his price is unknown: no sale now. */
  readonly saleUnknown?: boolean;
  /** UTC day of the last academy training. */
  readonly academyTrainedOn?: string | null;
  readonly academyGain?: number;
  readonly academyGainSeason?: number | null;
  readonly transferListedAt: string | null;
  /** LFE-ACADEMY-01: true = prospect before Promote (excluded from senior resolvers). */
  readonly academyTrack: boolean;
  /** Set when promoted from academy; null otherwise. */
  readonly promotedAt: string | null;
  /** Stored groups. Absent on old test fixtures — UI then derives from skill. */
  readonly groups?: AttrGroups;
  readonly energy?: number;
  readonly form?: number;
  readonly wage?: number;
  readonly recentRatings?: readonly number[];
  readonly suspensionMatches?: number;
  readonly injuryMatches?: number;
  readonly morale?: number;
  readonly personality?: string;
  readonly contractUntil?: string | null;
  readonly releaseClause?: number;
  readonly setPiece?: boolean;
  readonly lastIndividualOn?: string | null;
  readonly onLoan?: boolean;
  readonly loanUntil?: string | null;
  readonly wageBank?: number;
  readonly loanedIn?: boolean;
  readonly loanPartnerLabel?: string | null;
  readonly intlAbsentUntil?: string | null;
};

export const POSITION_FILTERS = ['ALL', 'BR', 'OB', 'ŚP', 'PO', 'PN', 'N'] as const;
export const STATUS_FILTERS = ['ALL', 'READY', 'INJURED', 'TIRED', 'SUSPENDED'] as const;
export const STATUS_LABEL: Record<PlayerStatus, string> = {
  READY: 'Gotowy',
  INJURED: 'Kontuzja',
  TIRED: 'Zmęczony',
  SUSPENDED: 'Zawieszony',
  DEPARTED: 'Odszedł',
};

/** Suspended and injured players say how many matches they sit. */
export function playerStatusLabel(
  status: PlayerStatus,
  suspensionMatches?: number,
  injuryMatches?: number,
): string {
  if (status === 'SUSPENDED' && suspensionMatches && suspensionMatches > 0) {
    const word = suspensionMatches === 1 ? 'mecz' : 'mecze';
    return `Zawieszony · ${suspensionMatches} ${word}`;
  }
  if (status === 'INJURED' && injuryMatches && injuryMatches > 0) {
    const word = injuryMatches === 1 ? 'mecz' : 'mecze';
    return `Kontuzja · ${injuryMatches} ${word}`;
  }
  return STATUS_LABEL[status];
}
export type SortKey = 'name' | 'position' | 'age' | 'form' | 'energy' | 'skill' | 'status';

export class SquadUnavailableError extends Error {
  readonly clubId: string;

  constructor(clubId: string, message?: string) {
    super(message ?? `Squad unavailable for club ${clubId}`);
    this.name = 'SquadUnavailableError';
    this.clubId = clubId;
  }
}

export function isActivePlayer(row: PlayerRowDto): boolean {
  return row.departedAt == null && row.status !== 'DEPARTED';
}

/** Active senior — excludes academy prospects (filter only; no academy logic). */
export function isSeniorPlayer(row: PlayerRowDto): boolean {
  return isActivePlayer(row) && !row.academyTrack;
}

/** Active academy prospect before Promote. */
export function isAcademyProspect(row: PlayerRowDto): boolean {
  return isActivePlayer(row) && row.academyTrack;
}

/** Senior roster slice — used by squad / training / transfers / match (filter only). */
export function filterSeniorPlayers(rows: readonly PlayerRowDto[]): PlayerRowDto[] {
  return rows.filter(isSeniorPlayer);
}
