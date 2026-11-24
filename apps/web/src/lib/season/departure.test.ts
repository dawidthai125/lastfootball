import { describe, expect, it } from 'vitest';

import {
  formatRetirementFarewell,
  planSeasonDeparture,
  resolveDeparturePreview,
  resolveRetirementFarewell,
} from './departure';

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

  it('never retires the last goalkeeper', () => {
    const keeper = (id: string, age: number, skill: number) => ({
      id,
      age,
      skill,
      academyTrack: false,
      departed: false,
      goalkeeper: true,
    });
    const back = { id: 'back', age: 39, skill: 60, academyTrack: false, departed: false };
    expect(planSeasonDeparture([keeper('gk', 40, 40), back]).retireId).toBe('back');
    expect(planSeasonDeparture([keeper('gk', 40, 40)]).retireId).toBeNull();
    expect(planSeasonDeparture([keeper('gk', 40, 40), keeper('gk2', 22, 40), back]).retireId).toBe(
      'gk',
    );
    // A junior keeper does not count: he may stay in the academy.
    expect(
      planSeasonDeparture([
        keeper('gk', 40, 40),
        { ...keeper('youth', 17, 40), academyTrack: true },
      ]).retireId,
    ).toBeNull();
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
      { id: 'a', name: 'Młody', age: 36, skill: 40, academyTrack: false, departed: false },
    ]);
    expect(preview.retire).toBeNull();
    expect(preview.promote).toBeNull();
    expect(preview.summary).toMatch(/nikt nie kończy kariery/i);
  });

  it('counts the birthday of the season start: 37 retires at 38', () => {
    const preview = resolveDeparturePreview([
      { id: 'a', name: 'Alfa', age: 37, skill: 40, academyTrack: false, departed: false },
    ]);
    expect(preview.retire).toMatchObject({ id: 'a', age: 37 });
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

describe('resolveRetirementFarewell', () => {
  const today = '2026-11-17';

  it('null when nobody departed today', () => {
    expect(
      resolveRetirementFarewell(
        [
          {
            id: 'a',
            name: 'Aktywny',
            status: 'READY',
            departedAt: null,
            promotedAt: null,
          },
        ],
        today,
      ),
    ).toBeNull();
  });

  it('retire + promote on same UTC day', () => {
    const farewell = resolveRetirementFarewell(
      [
        {
          id: 'old',
          name: 'Słaby Weteran',
          status: 'DEPARTED',
          departedAt: `${today}T12:00:00.000Z`,
          promotedAt: null,
        },
        {
          id: 'youth',
          name: 'A Youth',
          status: 'READY',
          departedAt: null,
          promotedAt: `${today}T12:00:01.000Z`,
        },
        {
          id: 'old-other-day',
          name: 'Wczoraj',
          status: 'DEPARTED',
          departedAt: '2026-11-16T12:00:00.000Z',
          promotedAt: null,
        },
      ],
      today,
    );
    expect(farewell).toMatchObject({
      retireName: 'Słaby Weteran',
      promoteName: 'A Youth',
    });
    expect(farewell?.subject).toContain('Słaby Weteran');
    expect(farewell?.subject).toContain('A Youth');
    expect(farewell?.summary).toMatch(/zakończył karierę/i);
  });

  it('retire only when no same-day promote', () => {
    const farewell = resolveRetirementFarewell(
      [
        {
          id: 'old',
          name: 'Solo',
          status: 'DEPARTED',
          departedAt: `${today}T08:00:00.000Z`,
          promotedAt: null,
        },
      ],
      today,
    );
    expect(farewell).toEqual(formatRetirementFarewell('Solo', null));
    expect(farewell?.promoteName).toBeNull();
    expect(farewell?.subject).toBe('Solo zakończył karierę');
  });
});
