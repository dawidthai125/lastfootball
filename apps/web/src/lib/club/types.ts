export type ClubDto = {
  id: string;
  ownerId: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  crestTemplateId: string;
  createdAt: string;
};

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
