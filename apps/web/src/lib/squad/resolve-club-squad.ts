import type { PitchRole } from '@lastfootball/lfe';

import type { ClubDto } from '@/lib/club/types';
import type { RosterPlayerSeed } from '@/lib/squad/seed-roster';
import type { PlayerRowDto, SquadDto, SquadPlayerDto } from '@/lib/squad/types';
import { SquadUnavailableError } from '@/lib/squad/types';

/** Display/filter position — group CBs/LB into OB for squad filters. */
function displayPosition(pos: string): string {
  if (pos === 'ŚO' || pos === 'LO') return 'OB';
  return pos;
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

function toDto(row: PlayerRowDto): SquadPlayerDto {
  const skill = row.skill;
  const shirt = row.shirtNumber;
  return {
    id: row.id,
    name: row.name,
    shortName: row.name,
    position: displayPosition(row.pos),
    age: row.age,
    form: 60 + (shirt % 25),
    energy: 70 + (shirt % 20),
    skill,
    status: row.status,
    nationality: row.nationality,
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
      wage: 2000 + shirt * 100,
      until: '30.06.2028',
      clause: 200_000 + shirt * 10_000,
      role: roleLabel(row.pos, row.captain),
    },
    history: [`Skład startowy ${row.clubId.slice(0, 8)}`, row.starter ? 'XI' : 'Ławka'],
    starter: row.starter,
    captain: row.captain,
    version: row.version,
  };
}

/**
 * Sole squad SSOT for product UI (LFE-PLAYERS-01).
 * Pure: requires DB rows — never seeds. Empty roster → SquadUnavailableError.
 */
export function resolveClubSquad(
  club: Pick<ClubDto, 'id'>,
  rows: readonly PlayerRowDto[],
): SquadDto {
  const active = rows.filter((r) => r.departedAt == null && r.status !== 'DEPARTED');
  if (active.length === 0) {
    throw new SquadUnavailableError(club.id);
  }
  const players = active.map(toDto);
  return { clubId: club.id, players };
}

/**
 * Starting XI for LFE sessions — from DB rows only (no seed).
 * Throws if fewer than 11 starters among active players.
 */
export function resolveStartingXi(rows: readonly PlayerRowDto[]): readonly RosterPlayerSeed[] {
  const xi = rows
    .filter((r) => r.departedAt == null && r.status !== 'DEPARTED' && r.starter)
    .map((r): RosterPlayerSeed => ({
      id: r.id,
      name: r.name,
      number: r.shirtNumber,
      pos: r.pos,
      role: r.role as PitchRole,
      starter: true,
      captain: r.captain || undefined,
    }));
  if (xi.length !== 11) {
    const clubId = rows[0]?.clubId ?? 'unknown';
    throw new SquadUnavailableError(clubId, `Starting XI incomplete (${xi.length}/11)`);
  }
  return xi;
}

export function getSquadPlayerById(squad: SquadDto, playerId: string): SquadPlayerDto | null {
  return squad.players.find((p) => p.id === playerId) ?? null;
}
