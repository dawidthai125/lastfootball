import type { ClubDto } from '@/lib/club/types';
import { seedClubRoster, seedStarterSquad, type RosterPlayerSeed } from '@/lib/squad/seed-roster';
import type { SquadDto, SquadPlayerDto } from '@/lib/squad/types';

/** Display/filter position — group CBs/LB into OB for squad filters. */
function displayPosition(pos: string): string {
  if (pos === 'ŚO' || pos === 'LO') return 'OB';
  return pos;
}

function toShortName(name: string): string {
  return name;
}

function roleLabel(pos: string, captain: boolean): string {
  if (captain) return 'Kapitan';
  switch (pos) {
    case 'BR':
      return 'Bramkarz';
    case 'ŚO':
      return 'Stoper';
    case 'PO':
      return 'Prawy obrońca';
    case 'LO':
      return 'Lewy obrońca';
    case 'ŚP':
      return 'Pomocnik';
    case 'PN':
      return 'Skrzydłowy';
    case 'N':
      return 'Napastnik';
    default:
      return 'Zawodnik';
  }
}

function toDto(seed: RosterPlayerSeed, clubId: string): SquadPlayerDto {
  const skill = 55 + (seed.number % 20);
  return {
    id: seed.id,
    name: seed.name,
    shortName: toShortName(seed.name),
    position: displayPosition(seed.pos),
    age: 22 + (seed.number % 12),
    form: 60 + (seed.number % 25),
    energy: 70 + (seed.number % 20),
    skill,
    status: 'ready',
    nationality: 'POL',
    attributes: [
      { label: 'Tempo', value: skill - 4 },
      { label: 'Siła', value: skill - 2 },
      { label: 'Wytrzymałość', value: skill },
      { label: 'Podania', value: skill - 1 },
      { label: 'Strzały', value: skill - 6 },
      { label: 'Obrona', value: skill - 3 },
      { label: 'Technika', value: skill - 2 },
      { label: 'Głowa', value: skill - 5 },
    ],
    contract: {
      wage: 2000 + seed.number * 100,
      until: '30.06.2028',
      clause: 200_000 + seed.number * 10_000,
      role: roleLabel(seed.pos, Boolean(seed.captain)),
    },
    history: [`Skład startowy ${clubId.slice(0, 8)}`, seed.starter ? 'XI' : 'Ławka'],
    starter: seed.starter,
    captain: Boolean(seed.captain),
  };
}

/**
 * Sole squad SSOT for product path (Hub /squad / match lineups).
 * Deterministic seed — no @/data/squad.
 */
export function resolveClubSquad(club: Pick<ClubDto, 'id'>): SquadDto {
  const players = seedClubRoster(club.id).map((p) => toDto(p, club.id));
  return { clubId: club.id, players };
}

export function resolveStartingXi(clubId: string): readonly RosterPlayerSeed[] {
  return seedStarterSquad(clubId);
}

export function getSquadPlayerById(
  club: Pick<ClubDto, 'id'>,
  playerId: string,
): SquadPlayerDto | null {
  return resolveClubSquad(club).players.find((p) => p.id === playerId) ?? null;
}
