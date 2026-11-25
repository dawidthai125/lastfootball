import type { ClubDto } from '@/lib/club/types';
import { STARTER_PACKAGE } from '@/lib/club/types';
import { FIRST_MATCH_BOT } from '@/lib/first-match/constants';
import type { FixtureDto } from '@/lib/fixtures/types';
import { resolveLeagueTierLabel } from '@/lib/league/league-tier';
import { formatSeasonLabel } from '@/lib/season/types';

export type LastMatchStripModel = {
  readonly title: string;
  readonly detail: string;
  /** Played fixture opens on its match page. Null when there is no played fixture. */
  readonly href: string | null;
  /** Accepted note. Null when the fixture has none — never invented. */
  readonly note: string | null;
};

function noteLine(note: string | null | undefined): string | null {
  if (!note || note.trim().length === 0) return null;
  return note;
}

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

function matchLabel(fixture: FixtureDto): string {
  if (fixture.competition === 'human') return 'Liga ludzi';
  if (fixture.competition === 'cup') return 'Puchar';
  if (fixture.competition === 'challenge') return 'Wyzwanie';
  return `Kolejka ${fixture.matchday}`;
}

/** Newest played match of any competition. The league fixture is the fallback without dates. */
export function newestPlayed(
  fixtures: readonly FixtureDto[],
  fallback: FixtureDto | null,
): FixtureDto | null {
  let best = fallback;
  for (const fixture of fixtures) {
    if (fixture.status !== 'played' || !fixture.playedAt) continue;
    if (!best?.playedAt || Date.parse(fixture.playedAt) > Date.parse(best.playedAt)) best = fixture;
  }
  return best;
}

/** Qualitative / scored last-match strip from fixtures SSOT when available. */
export function buildLastMatchStrip(
  club: ClubDto,
  lastPlayed: FixtureDto | null = null,
): LastMatchStripModel {
  if (lastPlayed) {
    const href = `/match/${lastPlayed.id}`;
    const note = noteLine(lastPlayed.matchNote);
    if (lastPlayed.homeScore != null && lastPlayed.awayScore != null) {
      const us = lastPlayed.isHome ? lastPlayed.homeScore : lastPlayed.awayScore;
      const them = lastPlayed.isHome ? lastPlayed.awayScore : lastPlayed.homeScore;
      return {
        title: 'Ostatni mecz',
        detail: `${matchLabel(lastPlayed)} · ${club.name} ${us}:${them} ${lastPlayed.opponent.name}`,
        href,
        note,
      };
    }
    return {
      title: 'Ostatni mecz',
      detail: `${matchLabel(lastPlayed)} · ${club.name} vs ${lastPlayed.opponent.name}`,
      href,
      note,
    };
  }
  return {
    title: 'Ostatni mecz',
    detail: `Pierwszy mecz · ${club.name} vs ${FIRST_MATCH_BOT.name} · za tobą`,
    href: null,
    note: null,
  };
}

export function buildWelcomeMessage(
  club: ClubDto,
  nextFixture: FixtureDto | null = null,
  kickoffSentence: string | null = null,
): HubWelcomeMessage {
  if (nextFixture) {
    const block = kickoffSentence?.trim() ?? '';
    return {
      from: 'Zarząd',
      subject: `Kolejka ${nextFixture.matchday} czeka`,
      body:
        block.length > 0
          ? `${block} Następny rywal: ${nextFixture.opponent.name}.`
          : `Następny rywal: ${nextFixture.opponent.name}. Przygotuj skład i wyjdź na boisko — to Twoja sprawa dnia.`,
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
  const dayLabel = nextFixture
    ? `Kolejka ${nextFixture.matchday}`
    : club.seasonPhase === 'offseason'
      ? 'Przerwa'
      : club.firstMatchCompletedAt
        ? 'Sezon trwa'
        : 'Dzień 1';
  return {
    league: resolveLeagueTierLabel(club.leagueTier),
    stadium: STARTER_PACKAGE.stadiumLabel(club.name),
    dayLabel,
    seasonLabel: formatSeasonLabel(club.seasonNumber),
    clubLevelLabel: 'Klub startowy',
    leaguePositionLabel,
    cashLabel,
  };
}
