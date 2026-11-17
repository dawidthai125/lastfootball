import { describe, expect, it } from 'vitest';

import { planSeasonDeparture, resolveDeparturePreview } from './departure';

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

describe('resolveDeparturePreview', () => {
  it('empty plan: null slots and no-retirement summary', () => {
    const preview = resolveDeparturePreview([
      { id: 'a', name: 'Młody', age: 37, skill: 40, academyTrack: false, departed: false },
    ]);
    expect(preview.retire).toBeNull();
    expect(preview.promote).toBeNull();
    expect(preview.summary).toMatch(/nikt nie kończy kariery/i);
  });

  it('retire + promote: names in Polish summary', () => {
    const preview = resolveDeparturePreview([
      {
        id: 'old-strong',
        name: 'Silny',
        age: 39,
        skill: 80,
        academyTrack: false,
        departed: false,
      },
      {
        id: 'old-weak',
        name: 'Słaby Weteran',
        age: 40,
        skill: 50,
        academyTrack: false,
        departed: false,
      },
      {
        id: 'b-youth',
        name: 'B Youth',
        age: 17,
        skill: 44,
        academyTrack: true,
        departed: false,
      },
      {
        id: 'a-youth',
        name: 'A Youth',
        age: 18,
        skill: 60,
        academyTrack: true,
        departed: false,
      },
    ]);
    expect(preview.retire).toMatchObject({
      id: 'old-weak',
      name: 'Słaby Weteran',
      age: 40,
      skill: 50,
    });
    expect(preview.promote).toMatchObject({ id: 'a-youth', name: 'A Youth' });
    expect(preview.summary).toContain('Słaby Weteran');
    expect(preview.summary).toContain('lat 40');
    expect(preview.summary).toContain('A Youth');
    expect(preview.summary).toMatch(/z akademii wchodzi/i);
  });

  it('retire only: empty academy copy', () => {
    const preview = resolveDeparturePreview([
      { id: 'b', name: 'Beta', age: 38, skill: 55, academyTrack: false, departed: false },
      { id: 'a', name: 'Alfa', age: 38, skill: 55, academyTrack: false, departed: false },
    ]);
    expect(preview.retire).toMatchObject({ id: 'a', name: 'Alfa', age: 38 });
    expect(preview.promote).toBeNull();
    expect(preview.summary).toContain('Alfa');
    expect(preview.summary).toMatch(/akademia jest pusta/i);
  });
});
