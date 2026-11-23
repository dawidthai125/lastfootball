import { describe, expect, it } from 'vitest';

import { createRng } from '../rng';
import {
  createBench,
  createKickoffCommand,
  createLineup,
  createMatch,
  createPlayer,
  decideAction,
  decidePossession,
  formationAggressiveness,
} from '../testing';

import type { MatchAiContext, MatchAiSideContext } from './types';

/** Web plays 90 display minutes at 20 ticks each. */
const TICKS_PER_MINUTE = 20;

type Side = {
  readonly skill: number;
  readonly freshness?: number;
  readonly mentality?: number;
  readonly formation?: string;
};

function sideContext(side: 'home' | 'away', s: Side): MatchAiSideContext {
  const formationCode = s.formation ?? '4-4-2';
  return {
    side,
    tactics: { formationCode, mentality: s.mentality ?? 50, pressing: 50, tempo: 50, width: 50 },
    strength: s.skill / 100,
    freshness: s.freshness ?? 1,
    goalsFor: 0,
    goalsAgainst: 0,
    scoreDiff: 0,
    formationAggressiveness: formationAggressiveness(formationCode),
    possessionShare: 0.5,
  } as MatchAiSideContext;
}

/** Same chance ladder as the engine, without spatial or player attribution. */
function sample(home: Side, away: Side, matches = 4000) {
  const rng = createRng(20261123);
  const baseHome = sideContext('home', home);
  const baseAway = sideContext('away', away);
  const out = { home: 0, away: 0, shots: 0, wins: 0, draws: 0, losses: 0, wild: 0 };
  for (let m = 0; m < matches; m += 1) {
    let h = 0;
    let a = 0;
    for (let minute = 0; minute < 90; minute += 1) {
      const ctx = {
        phase: 'FIRST_HALF',
        displayMinute: minute,
        home: { ...baseHome, scoreDiff: h - a },
        away: { ...baseAway, scoreDiff: a - h },
      } as MatchAiContext;
      const poss = decidePossession(ctx).homeChance;
      for (const side of ['home', 'away'] as const) {
        const d = decideAction(ctx, side);
        const shot = (side === 'home' ? poss : 1 - poss) * d.attackChance * d.shotChance;
        out.shots += shot * TICKS_PER_MINUTE;
        const goal = 1 - (1 - shot * d.onTargetChance * d.goalChance) ** TICKS_PER_MINUTE;
        if (rng.next() < goal) {
          if (side === 'home') h += 1;
          else a += 1;
        }
      }
    }
    out.home += h;
    out.away += a;
    if (h > a) out.wins += 1;
    else if (h < a) out.losses += 1;
    else out.draws += 1;
    if (h + a >= 8) out.wild += 1;
  }
  return Object.fromEntries(
    Object.entries(out).map(([key, value]) => [key, value / matches]),
  ) as typeof out;
}

describe('MATCH-BALANCE-01', () => {
  it('equal teams play football scores', () => {
    const r = sample({ skill: 50 }, { skill: 50 });
    expect(r.home + r.away).toBeGreaterThan(2.4);
    expect(r.home + r.away).toBeLessThan(3);
    expect(r.shots).toBeGreaterThan(22);
    expect(r.shots).toBeLessThan(28);
    expect(r.draws).toBeGreaterThan(0.2);
    expect(r.draws).toBeLessThan(0.3);
    expect(r.home / (r.home + r.away)).toBeGreaterThan(0.52);
    expect(r.home / (r.home + r.away)).toBeLessThan(0.59);
    expect(r.wild).toBeLessThan(0.02);
  });

  it('the better squad wins more, without walkovers', () => {
    const better = sample({ skill: 65 }, { skill: 50 });
    expect(better.wins).toBeGreaterThan(0.55);
    expect(better.losses).toBeGreaterThan(0.08);
    const much = sample({ skill: 80 }, { skill: 50 });
    expect(much.wins).toBeGreaterThan(0.75);
    expect(much.home + much.away).toBeLessThan(4.2);
  });

  it('tired legs cost chances', () => {
    const fresh = sample({ skill: 60 }, { skill: 60 });
    const tired = sample({ skill: 60, freshness: 0.4 }, { skill: 60 });
    expect(tired.home).toBeLessThan(fresh.home * 0.9);
  });

  it('no mentality or formation wins for free', () => {
    const base = sample({ skill: 50 }, { skill: 50 });
    const points = (r: typeof base) => r.wins * 3 + r.draws;
    for (const setup of [
      { mentality: 85 },
      { mentality: 20 },
      { formation: '4-3-3' },
      { formation: '5-4-1' },
    ]) {
      const r = sample({ skill: 50, ...setup }, { skill: 50 });
      expect(Math.abs(points(r) - points(base)), JSON.stringify(setup)).toBeLessThan(0.16);
    }
    const open = sample({ skill: 50, mentality: 85 }, { skill: 50 });
    expect(open.home).toBeGreaterThan(base.home);
    expect(open.away).toBeGreaterThan(base.away);
  });

  it('the real session stays near the model', { timeout: 60_000 }, () => {
    let goals = 0;
    const matches = 24;
    for (let seed = 1; seed <= matches; seed += 1) {
      const ids = (side: string) => Array.from({ length: 11 }, (_, i) => `${side}${i}`);
      const session = createMatch({
        seed: seed * 7919,
        homeTeamId: 'home',
        awayTeamId: 'away',
        homeLineup: createLineup({ side: 'home', formationCode: '4-4-2', playerIds: ids('h') }),
        awayLineup: createLineup({ side: 'away', formationCode: '4-4-2', playerIds: ids('a') }),
        homeBench: createBench('home', []),
        awayBench: createBench('away', []),
        players: (['home', 'away'] as const).flatMap((side) =>
          ids(side[0]!).map((id, i) =>
            createPlayer({
              id,
              teamId: side,
              side,
              name: id,
              shirtNumber: i + 1,
              preferredRole: 'CM',
            }),
          ),
        ),
        settings: {
          halfDurationMs: 45_000,
          halfTimeDurationMs: 100,
          enableExtraTime: false,
          enablePenalties: false,
        },
      });
      session.start();
      session.step();
      session.dispatch(createKickoffCommand({ tick: session.context().tick, source: 'system' }));
      session.step();
      for (let i = 0; i < 4000 && session.getMatchState().phase !== 'FINISHED'; i += 1) {
        session.step();
      }
      const { home, away } = session.getMatchState().score;
      goals += home + away;
      session.dispose();
    }
    expect(goals / matches).toBeGreaterThan(1.5);
    expect(goals / matches).toBeLessThan(4.2);
  });
});
