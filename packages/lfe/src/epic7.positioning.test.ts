import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PITCH,
  FORMATION_442,
  AwaySide,
  HomeSide,
  buildFormationLayout,
  cellAt,
  createKickoffSpawnPoints,
  createLineup,
  createMatch,
  createMatchSpatialState,
  createPitchGrid,
  createPlayer,
  createZones,
  distanceCalculator,
  longitudinalThird,
  pitchCoordinates,
  position,
  zonesContaining,
} from './index';
import type { MatchSessionConfig } from './index';
import { createBench } from './index';

function lineupPlayers(side: 'home' | 'away', teamId: string) {
  return Array.from({ length: 11 }, (_, i) =>
    createPlayer({
      id: `${side}-${i}`,
      teamId,
      side,
      name: `${side} ${i}`,
      shirtNumber: i + 1,
      preferredRole: i === 0 ? 'GK' : 'CM',
    }),
  );
}

describe('EPIC-7 positioning', () => {
  it('maps formation anchors to mirrored world positions for home/away', () => {
    const pitch = DEFAULT_PITCH;
    const home = buildFormationLayout(FORMATION_442, 'home', pitch);
    const away = buildFormationLayout(FORMATION_442, 'away', pitch);
    expect(home.slots).toHaveLength(11);
    expect(away.slots).toHaveLength(11);

    const homeGk = home.slots[0]!;
    const awayGk = away.slots[0]!;
    expect(homeGk.position.x).toBeCloseTo(0.05 * pitch.length);
    expect(awayGk.position.x).toBeCloseTo((1 - 0.05) * pitch.length);
    expect(homeGk.facing).toBe(HomeSide.attackFacing);
    expect(awayGk.facing).toBe(AwaySide.attackFacing);
  });

  it('distance calculator is deterministic', () => {
    const a = position(0, 0);
    const b = position(3, 4);
    expect(distanceCalculator.distance(a, b)).toBe(5);
    expect(distanceCalculator.distanceSquared(a, b)).toBe(25);
    expect(distanceCalculator.isWithin(a, b, 5)).toBe(true);
    expect(distanceCalculator.isWithin(a, b, 4.9)).toBe(false);
  });

  it('pitch grid and zones are serializable', () => {
    const pitch = DEFAULT_PITCH;
    const grid = createPitchGrid(pitch, 21, 14);
    const cell = cellAt(grid, position(52.5, 34));
    const zones = createZones(pitch, 'home');
    const ids = zonesContaining(position(5, 34), zones);
    expect(ids).toContain('own_penalty');
    expect(JSON.parse(JSON.stringify({ grid, cell, zones }))).toBeTruthy();
    expect(longitudinalThird(position(10, 34), pitch, 'home')).toBe('own_third');
  });

  it('kickoff spawn places 22 players + ball at centre', () => {
    const homePs = lineupPlayers('home', 'h');
    const awayPs = lineupPlayers('away', 'a');
    const homeLineup = createLineup({
      side: 'home',
      formationCode: '4-4-2',
      playerIds: homePs.map((p) => p.id),
      formation: FORMATION_442,
    });
    const awayLineup = createLineup({
      side: 'away',
      formationCode: '4-4-2',
      playerIds: awayPs.map((p) => p.id),
    });
    const spawns = createKickoffSpawnPoints(homeLineup, awayLineup, DEFAULT_PITCH);
    expect(spawns.home).toHaveLength(11);
    expect(spawns.away).toHaveLength(11);
    expect(spawns.ball).toEqual(DEFAULT_PITCH.centreSpot);
  });

  it('round-trips MatchSpatialState through JSON', () => {
    const homePs = lineupPlayers('home', 'h');
    const awayPs = lineupPlayers('away', 'a');
    const config: MatchSessionConfig = {
      seed: 1,
      homeTeamId: 'h',
      awayTeamId: 'a',
      homeLineup: createLineup({
        side: 'home',
        formationCode: '4-4-2',
        playerIds: homePs.map((p) => p.id),
      }),
      awayLineup: createLineup({
        side: 'away',
        formationCode: '4-4-2',
        playerIds: awayPs.map((p) => p.id),
      }),
      homeBench: createBench('home', []),
      awayBench: createBench('away', []),
      players: [...homePs, ...awayPs],
      engine: { logLevel: 'silent' },
    };
    const session = createMatch(config);
    const spatial = session.getSpatialState();
    expect(spatial.players).toHaveLength(22);
    const again = JSON.parse(JSON.stringify(spatial));
    expect(again.players).toHaveLength(22);
    expect(again.ball.position).toEqual(spatial.ball.position);

    const rebuilt = createMatchSpatialState(session.getMatchState());
    expect(rebuilt.players[0]?.position).toEqual(spatial.players[0]?.position);
  });

  it('normalized ↔ world is invertible for home', () => {
    const pitch = DEFAULT_PITCH;
    const world = pitchCoordinates.toWorld({ x: 0.25, y: 0.5 }, 'home', pitch);
    const back = pitchCoordinates.toNormalized(world, 'home', pitch);
    expect(back.x).toBeCloseTo(0.25);
    expect(back.y).toBeCloseTo(0.5);
  });
});
