import type { PitchRole } from '@lastfootball/lfe';

import type { ClubDto } from '@/lib/club/types';
import { careerPhaseLabel, resolveCareerPhase } from '@/lib/squad/career-phase';
import { potentialBandLabel, resolvePotentialBand } from '@/lib/squad/potential';
import type { RosterPlayerSeed } from '@/lib/squad/seed-roster';
import type { PlayerRowDto, SquadDto, SquadPlayerDto } from '@/lib/squad/types';
import { filterSeniorPlayers, SquadUnavailableError } from '@/lib/squad/types';

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

/** Tired and injured players must not look fresh. Ready energy still varies by shirt. */
function energyForStatus(status: PlayerRowDto['status'], shirt: number): number {
  if (status === 'INJURED') return 25;
  if (status === 'TIRED') return 42;
  if (status === 'SUSPENDED') return 50;
  return 70 + (shirt % 20);
}

function toDto(row: PlayerRowDto): SquadPlayerDto {
  const skill = row.skill;
  const shirt = row.shirtNumber;
  const potentialBand = resolvePotentialBand(row.potential);
  const careerPhase = resolveCareerPhase({ age: row.age });
  return {
    id: row.id,
    name: row.name,
    shortName: row.name,
    position: displayPosition(row.pos),
    age: row.age,
    form: 60 + (shirt % 25),
    energy: energyForStatus(row.status, shirt),
    skill,
    potentialBand,
    potentialLabel: potentialBandLabel(row.potential),
    careerPhase,
    careerPhaseLabel: careerPhaseLabel({ age: row.age }),
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
  const active = filterSeniorPlayers(rows);
  if (active.length === 0) {
    throw new SquadUnavailableError(club.id);
  }
  const players = active.map(toDto);
  return { clubId: club.id, players };
}

/**
 * Starting XI for LFE sessions — from DB rows only (no seed).
 * Throws if fewer than 11 starters among active players.
 * LFE-TRAINING-02: hard fail when XI includes INJURED/SUSPENDED (no auto-swap).
 */
export function resolveStartingXi(rows: readonly PlayerRowDto[]): readonly RosterPlayerSeed[] {
  const xiRows = filterSeniorPlayers(rows).filter((r) => r.starter);
  const clubId = rows[0]?.clubId ?? 'unknown';

  const blocked = xiRows.filter((r) => r.status === 'INJURED' || r.status === 'SUSPENDED');
  if (blocked.length > 0) {
    throw new SquadUnavailableError(
      clubId,
      'Skład XI zawiera kontuzjowanych lub zawieszonych. Popraw XI przed meczem.',
    );
  }

  const xi = xiRows.map((r): RosterPlayerSeed => ({
    id: r.id,
    name: r.name,
    number: r.shirtNumber,
    pos: r.pos,
    role: r.role as PitchRole,
    starter: true,
    captain: r.captain || undefined,
    skill: r.skill,
  }));
  if (xi.length !== 11) {
    throw new SquadUnavailableError(clubId, `Starting XI incomplete (${xi.length}/11)`);
  }
  return xi;
}

/** Fit seniors outside the XI. Cap is the match bench, not a second squad model. */
export const MATCH_BENCH_MAX = 7;

export function resolveMatchBench(rows: readonly PlayerRowDto[]): readonly RosterPlayerSeed[] {
  return filterSeniorPlayers(rows)
    .filter((row) => !row.starter && row.status !== 'INJURED' && row.status !== 'SUSPENDED')
    .slice()
    .sort((a, b) => a.shirtNumber - b.shirtNumber || a.id.localeCompare(b.id))
    .slice(0, MATCH_BENCH_MAX)
    .map((row): RosterPlayerSeed => ({
      id: row.id,
      name: row.name,
      number: row.shirtNumber,
      pos: row.pos,
      role: row.role as PitchRole,
      starter: false,
      skill: row.skill,
    }));
}

export function getSquadPlayerById(squad: SquadDto, playerId: string): SquadPlayerDto | null {
  return squad.players.find((p) => p.id === playerId) ?? null;
}
