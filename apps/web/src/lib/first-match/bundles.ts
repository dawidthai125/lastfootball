import type { ClubDto } from '@/lib/club/types';
import { STARTER_PACKAGE } from '@/lib/club/types';
import type { Fixture, LiveMatchBundle, PreMatchBundle } from '@/data/fixtures';
import {
  emptyStadiumLevels,
  stadiumLook,
  stadiumSeatLabel,
  type StadiumLevels,
} from '@/lib/stadium/levels';
import { lineupFacts, teamCondition } from '@/lib/fixtures/to-ui-fixture';
import { FIRST_MATCH_BOT, FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { resolveLeagueTierLabel } from '@/lib/league/league-tier';
import { orderForFormation, pitchSlotsFor } from '@/lib/match/order-xi';
import { seedBotSquad, type RosterPlayerSeed } from '@/lib/squad';

const FIRST_ATTENDANCE = '2 100';

function firstStadiumName(club: ClubDto, levels: StadiumLevels): string {
  const base = STARTER_PACKAGE.stadiumLabel(club.name);
  if (levels.stands <= 0 && levels.pitch <= 0) return base;
  const look = stadiumLook(levels);
  return `${base} · ${look.stands} · ${look.pitch}`;
}

export function buildFirstFixture(
  club: ClubDto,
  levels: StadiumLevels = emptyStadiumLevels(),
): Fixture {
  const leagueLabel = resolveLeagueTierLabel(club.leagueTier);
  return {
    id: FIRST_MATCH_ID,
    day: 1,
    whenLabel: 'Dziś',
    dateLabel: 'Dzień 1',
    kickoff: 'Teraz',
    competition: 'friendly',
    competitionLabel: `${leagueLabel} · mecz inauguracyjny`,
    opponent: FIRST_MATCH_BOT.name,
    opponentShort: FIRST_MATCH_BOT.shortName,
    home: true,
    stadium: firstStadiumName(club, levels),
    status: 'upcoming',
  };
}

export function buildFirstPreMatchBundle(
  club: ClubDto,
  ourXi: readonly RosterPlayerSeed[],
  levels: StadiumLevels = emptyStadiumLevels(),
): PreMatchBundle {
  const fixture = buildFirstFixture(club, levels);
  const our = orderForFormation(ourXi, '4-4-2');
  const their = seedBotSquad();

  return {
    fixture,
    weather: 'Słonecznie',
    weatherDetail: 'Dobry dzień na inaugurację',
    weatherNote: 'Mecz inauguracyjny — pogoda nie wpływa na wynik',
    temperature: '18°C',
    attendance: FIRST_ATTENDANCE,
    referee: 'Adam Lewicki',
    countdown: 'Gotowy',
    ourTeam: {
      name: club.name,
      shortName: club.shortName,
      form: [],
      place: 0,
      points: 0,
    },
    theirTeam: {
      name: FIRST_MATCH_BOT.name,
      shortName: FIRST_MATCH_BOT.shortName,
      form: [],
      place: 0,
      points: 0,
    },
    stakes: [
      { id: 'first', label: 'Pierwszy mecz', value: 'Inauguracja klubu' },
      { id: 'league', label: 'Kontekst', value: resolveLeagueTierLabel(club.leagueTier) },
      { id: 'home', label: 'Stadion', value: STARTER_PACKAGE.stadiumLabel(club.name) },
    ],
    h2h: [],
    formation: '4-4-2',
    styleLabel: 'Zbilansowany',
    tactics: [
      { id: 'mentality', label: 'Mentalność', value: 50 },
      { id: 'possession', label: 'Posiadanie', value: 50 },
      { id: 'pressing', label: 'Pressing', value: 50 },
      { id: 'tempo', label: 'Tempo', value: 50 },
      { id: 'width', label: 'Szerokość', value: 50 },
      { id: 'density', label: 'Zagęszczenie', value: 50 },
    ],
    // No ids: player pages stay closed until the first match is over.
    ourLineup: our.map((p) => ({
      pos: p.pos,
      name: p.name,
      number: p.number,
      ...lineupFacts(p),
    })),
    theirLineup: their.map((p) => ({
      pos: p.pos,
      name: p.name,
      number: p.number,
    })),
    pitchSlots: pitchSlotsFor(our, '4-4-2'),
    teamCondition: teamCondition(our),
    ticker: `${club.name} — pierwszy gwizdek w historii klubu.`,
    decisions: [
      {
        id: 'lineup',
        label: 'Skład',
        hint: 'Skład startowy — potwierdź i wyjdź na boisko',
      },
      { id: 'tactics', label: 'Taktyka', hint: 'Ustawienie 4-4-2 (podgląd)' },
      { id: 'setpieces', label: 'Stałe fragmenty', hint: 'Domyślne na inaugurację' },
    ],
  };
}

export function buildFirstLiveBundle(
  club: ClubDto,
  levels: StadiumLevels = emptyStadiumLevels(),
): LiveMatchBundle {
  const fixture = buildFirstFixture(club, levels);
  return {
    fixture,
    clock: '00:00',
    period: 'Początek',
    homeScore: 0,
    awayScore: 0,
    viewers: FIRST_ATTENDANCE,
    weather: '18°C · słonecznie',
    stadiumCapacity: stadiumSeatLabel(levels.stands),
    groundStands: levels.stands,
    groundPitch: levels.pitch,
    possession: { home: 50, away: 50 },
    stats: [
      { label: 'Strzały', home: 0, away: 0 },
      { label: 'Na bramkę', home: 0, away: 0 },
      { label: 'Faule', home: 0, away: 0 },
      { label: 'Rożne', home: 0, away: 0 },
      { label: 'Żółte', home: 0, away: 0 },
    ],
    events: [
      {
        id: 'e0',
        minute: "0'",
        kind: 'info',
        text: `Pierwszy mecz ${club.name}. Powodzenia!`,
      },
    ],
    commands: [
      { id: 'attack', label: 'Atak agresywny' },
      { id: 'press', label: 'Pressing wysoki' },
      { id: 'tempo', label: 'Tempo szybkie' },
      { id: 'balance', label: 'Zbilansowany' },
      { id: 'defend', label: 'Blok niski' },
      { id: 'wide', label: 'Gra szeroka' },
      { id: 'form-442', label: 'Układ 4-4-2' },
      { id: 'form-433', label: 'Układ 4-3-3' },
    ],
    subs: {
      remaining: '3/3',
      bench: [
        { name: 'Rezerwowy A', pos: 'OB' },
        { name: 'Rezerwowy B', pos: 'PO' },
        { name: 'Rezerwowy C', pos: 'N' },
      ],
    },
    viewModes: [
      { id: 'tactical', label: 'Taktyczny' },
      { id: 'shape', label: 'Ustawienie' },
      { id: 'pressing', label: 'Pressing' },
      { id: 'balance', label: 'Balans' },
    ],
  };
}
