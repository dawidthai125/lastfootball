import type { ClubDto } from '@/lib/club/types';
import { STARTER_PACKAGE } from '@/lib/club/types';
import { FIRST_MATCH_BOT } from '@/lib/first-match/constants';
import type { FixtureDto } from '@/lib/fixtures/types';

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
  /** One-line position chip (LFE-LEAGUE-02); null = omit. */
  readonly leaguePositionLabel: string | null;
  /** One-line cash chip (LFE-ECONOMY-01); null = omit. No trend. */
  readonly cashLabel: string | null;
};

/** Qualitative / scored last-match strip from fixtures SSOT when available. */
export function buildLastMatchStrip(
  club: ClubDto,
  lastPlayed: FixtureDto | null = null,
): LastMatchStripModel {
  if (lastPlayed && lastPlayed.homeScore != null && lastPlayed.awayScore != null) {
    const us = lastPlayed.isHome ? lastPlayed.homeScore : lastPlayed.awayScore;
    const them = lastPlayed.isHome ? lastPlayed.awayScore : lastPlayed.homeScore;
    return {
      title: 'Ostatni mecz',
      detail: `Kolejka ${lastPlayed.matchday} · ${club.name} ${us}:${them} ${lastPlayed.opponent.name}`,
    };
  }
  return {
    title: 'Ostatni mecz',
    detail: `Pierwszy mecz · ${club.name} vs ${FIRST_MATCH_BOT.name} · za tobą`,
  };
}

export function buildWelcomeMessage(
  club: ClubDto,
  nextFixture: FixtureDto | null = null,
): HubWelcomeMessage {
  if (nextFixture) {
    return {
      from: 'Zarząd',
      subject: `Kolejka ${nextFixture.matchday} czeka`,
      body: `Następny rywal: ${nextFixture.opponent.name}. Przygotuj skład i wyjdź na boisko — to Twoja sprawa dnia.`,
    };
  }
  return {
    from: 'Zarząd',
    subject: `Witaj w ${club.name}`,
    body: `Pierwszy mecz masz za sobą. Skład to Twój następny krok — poznaj zawodników i wróć, gdy będziesz gotów na kolejne wyzwanie.`,
  };
}

export function buildLightStatus(
  club: ClubDto,
  nextFixture: FixtureDto | null = null,
  leaguePositionLabel: string | null = null,
  cashLabel: string | null = null,
): HubLightStatus {
  const dayLabel = nextFixture ? `Kolejka ${nextFixture.matchday}` : 'Dzień 1';
  return {
    league: STARTER_PACKAGE.league,
    stadium: STARTER_PACKAGE.stadiumLabel(club.name),
    dayLabel,
    seasonLabel: 'Sezon 1',
    clubLevelLabel: 'Klub startowy',
    leaguePositionLabel,
    cashLabel,
  };
}
