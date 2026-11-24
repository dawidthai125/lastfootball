import { describe, expect, it } from 'vitest';

import { applyMatchSquadTruth, banFor, groupsFromSkill, type SquadTruthPlayer } from './truth';
import { leadershipOf, TALENTS, talentsOf, withTalentSkills, type Talent } from './talents';

const ids = Array.from({ length: 3000 }, (_, i) => `player-${i}`);

describe('talents (GDD 7.16)', () => {
  it('gives nothing to two, the same every time, without repeats', () => {
    const counts = [0, 0, 0];
    for (const id of ids) {
      const got = talentsOf(id, 'ŚP');
      expect(talentsOf(id, 'ŚP')).toEqual(got);
      expect(new Set(got).size).toBe(got.length);
      counts[got.length]! += 1;
    }
    expect(counts[0]! / ids.length).toBeCloseTo(0.5, 1);
    expect(counts[2]! / ids.length).toBeGreaterThan(0.08);
    expect(counts[2]! / ids.length).toBeLessThan(0.17);
  });

  it('fits the position', () => {
    const seen = (pos: string) => new Set(ids.flatMap((id) => [...talentsOf(id, pos)]));
    expect(seen('BR').has('lowca')).toBe(false);
    expect(seen('BR').has('mur')).toBe(true);
    expect(seen('N').has('mur')).toBe(false);
    expect(seen('N').has('filar')).toBe(false);
    for (const t of Object.keys(TALENTS) as Talent[]) {
      expect(['BR', 'PO', 'ŚO', 'LO', 'ŚP', 'PN', 'N'].some((pos) => seen(pos).has(t))).toBe(true);
    }
  });

  it('is a light touch on the skills and never above 99', () => {
    const base = { finishing: 97, longShots: 50, crossing: 50, composure: 50 };
    const out = withTalentSkills(base, ['lowca', 'egzekutor']);
    expect(out.finishing).toBe(99);
    expect(out.longShots).toBe(62);
    expect(withTalentSkills(base, [])).toBe(base);
  });

  it('a born leader leads best', () => {
    const of = (personality: string, talents: Talent[], age = 25) =>
      leadershipOf({ personality, talents, age });
    expect(of('lider', ['przywodca'])).toBeGreaterThan(of('lider', []));
    expect(of('lider', [])).toBeGreaterThan(of('spokojny', []));
    expect(of('spokojny', [])).toBeGreaterThan(of('wybuchowy', []));
    expect(of('spokojny', [], 30)).toBeGreaterThan(of('spokojny', [], 18));
  });
});

const player = (id: string): SquadTruthPlayer => ({
  id,
  pos: 'ŚP',
  status: 'READY',
  skill: 60,
  potential: 80,
  groups: groupsFromSkill(60),
  energy: 80,
  form: 60,
  recentRatings: [],
  suspensionMatches: 0,
  injuryMatches: 0,
});

describe('squad after a full-rules match (D151)', () => {
  const run = (incidents: Parameters<typeof applyMatchSquadTruth>[1]['incidents']) =>
    Object.fromEntries(
      applyMatchSquadTruth(['red', 'two', 'hurt', 'sub', 'half', 'rest'].map(player), {
        matchKey: 'm1',
        result: 'draw',
        roleById: { red: 'xi', two: 'xi', hurt: 'xi', half: 'xi', sub: 'bench', rest: 'bench' },
        incidents,
      }).map((p) => [p.id, p]),
    );

  it('takes bans and injuries from the match, not from the draw', () => {
    const out = run({
      red: { card: 'red', minutes: 30 },
      two: { card: 'second_yellow', minutes: 60 },
      hurt: { injury: 'serious', card: 'yellow', minutes: 10 },
      half: { minutes: 45 },
      sub: { minutes: 45, injury: 'minor' },
    });
    expect(out.red).toMatchObject({ status: 'SUSPENDED', suspensionMatches: 2 });
    expect(out.two).toMatchObject({ status: 'SUSPENDED', suspensionMatches: 1 });
    expect(out.hurt).toMatchObject({ status: 'INJURED', injuryMatches: 2 });
    expect(out.sub).toMatchObject({ status: 'INJURED', injuryMatches: 1, energy: 73 });
    expect(out.half).toMatchObject({ status: 'READY', energy: 73 });
    expect(out.rest).toMatchObject({ status: 'READY', energy: 84 });
  });

  it('a match with nothing on record punishes nobody', () => {
    for (const id of ids.slice(0, 400)) {
      const [out] = applyMatchSquadTruth([player(id)], {
        matchKey: 'm2',
        result: 'win',
        roleById: { [id]: 'xi' },
        incidents: {},
      });
      expect(out!.status).toBe('READY');
    }
  });

  it('every fourth yellow is a full count', () => {
    const banned = ids.filter((id) => banFor('yellow', id, 'm3') === 1).length;
    expect(banned / ids.length).toBeCloseTo(0.25, 1);
    expect(banFor(undefined, 'x', 'm3')).toBe(0);
  });
});
