import type { ClubDto } from '@/lib/club/types';
import { STARTER_PACKAGE } from '@/lib/club/types';
import { FIRST_MATCH_BOT } from '@/lib/first-match/constants';

export type LastMatchStripModel = {
  readonly title: string;
  readonly detail: string;
};

export type HubWelcomeMessage = {
  readonly from: string;
  readonly subject: string;
  readonly body: string;
};

export type HubLightStatus = {
  readonly league: string;
  readonly stadium: string;
  readonly dayLabel: string;
  readonly seasonLabel: string;
  readonly clubLevelLabel: string;
};

/** Qualitative last-match strip — no persisted score (LFE-MATCH-01 out of scope). */
export function buildLastMatchStrip(club: ClubDto): LastMatchStripModel {
  return {
    title: 'Ostatni mecz',
    detail: `Pierwszy mecz · ${club.name} vs ${FIRST_MATCH_BOT.name} · za tobą`,
  };
}

export function buildWelcomeMessage(club: ClubDto): HubWelcomeMessage {
  return {
    from: 'Zarząd',
    subject: `Witaj w ${club.name}`,
    body: `Pierwszy mecz masz za sobą. Skład to Twój następny krok — poznaj zawodników i wróć, gdy będziesz gotów na kolejne wyzwanie.`,
  };
}

export function buildLightStatus(club: ClubDto): HubLightStatus {
  return {
    league: STARTER_PACKAGE.league,
    stadium: STARTER_PACKAGE.stadiumLabel(club.name),
    dayLabel: 'Dzień 1',
    seasonLabel: 'Sezon 1',
    clubLevelLabel: 'Klub startowy',
  };
}
