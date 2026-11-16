import { describe, expect, it } from 'vitest';

import { planSeasonDeparture } from './departure';

describe('planSeasonDeparture', () => {
  it('does nothing when nobody is 38', () => {
    expect(
      planSeasonDeparture([{ id: 'a', age: 37, skill: 40, academyTrack: false, departed: false }]),
    ).toEqual({ retireId: null, promoteId: null });
  });

  it('retires the weakest late player and promotes the first academy id', () => {
    expect(
      planSeasonDeparture([
        { id: 'old-strong', age: 39, skill: 80, academyTrack: false, departed: false },
        { id: 'old-weak', age: 40, skill: 50, academyTrack: false, departed: false },
        { id: 'b-youth', age: 17, skill: 44, academyTrack: true, departed: false },
        { id: 'a-youth', age: 18, skill: 60, academyTrack: true, departed: false },
        { id: 'gone', age: 41, skill: 10, academyTrack: false, departed: true },
      ]),
    ).toEqual({ retireId: 'old-weak', promoteId: 'a-youth' });
  });

  it('retires without a promote when the academy is empty', () => {
    expect(
      planSeasonDeparture([
        { id: 'b', age: 38, skill: 55, academyTrack: false, departed: false },
        { id: 'a', age: 38, skill: 55, academyTrack: false, departed: false },
      ]),
    ).toEqual({ retireId: 'a', promoteId: null });
  });
});
