import type { ClubDto } from '@/lib/club/types';
import { STARTER_PACKAGE } from '@/lib/club/types';
import type { Fixture, LiveMatchBundle, PreMatchBundle } from '@/data/fixtures';
import { FIRST_MATCH_BOT, FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { resolveLeagueTierLabel } from '@/lib/league/league-tier';
import { orderForFormation, pitchSlotsFor } from '@/lib/match/order-xi';
import { seedBotSquad, type RosterPlayerSeed } from '@/lib/squad';

export function buildFirstFixture(club: ClubDto): Fixture {
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
    stadium: STARTER_PACKAGE.stadiumLabel(club.name),
    status: 'upcoming',
  };
}

export function buildFirstPreMatchBundle(
  club: ClubDto,
  ourXi: readonly RosterPlayerSeed[],
): PreMatchBundle {
  const fixture = buildFirstFixture(club);
  const our = orderForFormation(ourXi, '4-4-2');
  const their = seedBotSquad();

  return {
    fixture,
    weather: 'Słonecznie',
    weatherDetail: 'Dobry dzień na inaugurację',
    weatherNote: 'Mecz inauguracyjny — bez wpływu pogody na silnik',
    temperature: '18°C',
    attendance: '2 100',
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
      { id: 'width', label: 'Szerokość', value: 55 },
      { id: 'density', label: 'Zagęszczenie', value: 50 },
    ],
    ourLineup: our.map((p) => ({
      pos: p.pos,
      name: p.name,
      number: p.number,
      rating: 60,
      condition: 4,
      id: p.id,
      captain: p.captain,
    })),
    theirLineup: their.map((p) => ({
      pos: p.pos,
      name: p.name,
      number: p.number,
    })),
    pitchSlots: pitchSlotsFor(our, '4-4-2'),
    teamCondition: { label: 'Gotowa', value: 85 },
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

export function buildFirstLiveBundle(club: ClubDto): LiveMatchBundle {
  const fixture = buildFirstFixture(club);
  return {
    fixture,
    clock: '00:00',
    period: 'Kick-off',
    homeScore: 0,
    awayScore: 0,
    viewers: '—',
    weather: '18°C · słonecznie',
    stadiumCapacity: STARTER_PACKAGE.stadiumCapacity,
    possession: { home: 50, away: 50 },
    stats: [
      { label: 'Strzały', home: 0, away: 0 },
      { label: 'Na bramkę', home: 0, away: 0 },
      { label: 'Faule', home: 0, away: 0 },
      { label: 'Rożne', home: 0, away: 0 },
      { label: 'Żółte', home: 0, away: 0 },
    ],
    momentum: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
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
    instructions: [
      { id: 'focus', label: 'Focus gry', value: 'Środek' },
      { id: 'trap', label: 'Pułapka ofsajdowa', value: 'Wyłączona', on: false },
      { id: 'counter', label: 'Kontry', value: 'Średnie' },
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
