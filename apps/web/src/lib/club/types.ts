export type ClubDto = {
  id: string;
  ownerId: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  crestTemplateId: string;
  createdAt: string;
  /** SSOT — set once after first match Post Match confirm. */
  firstMatchCompletedAt: string | null;
  /** Club cash SSOT (LFE-ECONOMY-01). */
  cashBalance: number;
  /** Transfer window SSOT (LFE-TRANSFERS-01). */
  transferWindowOpen: boolean;
  /**
   * UTC calendar date (`YYYY-MM-DD`) of last team training session,
   * or null if never trained (LFE-TRAINING-01).
   */
  lastTrainingOn: string | null;
  /** Current season index, 1-based (LFE-SEASON-END-01). */
  seasonNumber: number;
  /**
   * Season lifecycle phase SSOT (LFE-SEASON-END-01 · AC-10).
   * `offseason` persists until Confirm N+1 (D85).
   */
  seasonPhase: 'in_season' | 'offseason';
};

export function isFirstMatchCompleted(club: ClubDto | null | undefined): boolean {
  return Boolean(club?.firstMatchCompletedAt);
}

export type ClubWizardDraft = {
  step: 1 | 2 | 3 | 4;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  crestTemplateId: string;
};

export const CLUB_WIZARD_DRAFT_KEY = 'lf.club.wizard.draft.v1';

export const STARTER_PACKAGE = {
  league: 'IV liga',
  stadiumLabel: (clubName: string) => `Arena ${clubName}`,
  stadiumCapacity: '4 200 miejsc',
  squad: 'XI + ławka (skład startowy)',
  coach: 'Trener: Marek Nowak · zrównoważony',
} as const;
