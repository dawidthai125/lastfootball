import { describe, expect, it } from 'vitest';

import {
  fixtureStayForm,
  shouldAutoSaveFinishedFixture,
  type FixtureAutoSaveInput,
} from '@/components/match/fixture-autosave';

const ready: FixtureAutoSaveInput = {
  firstMatch: false,
  fixtureId: 'fx-league',
  finished: true,
  finalOpen: true,
  postMatchOpen: false,
  started: false,
};

describe('shouldAutoSaveFinishedFixture', () => {
  it('saves once when the final whistle opens, before Podsumowanie', () => {
    expect(shouldAutoSaveFinishedFixture(ready)).toBe(true);
    expect(shouldAutoSaveFinishedFixture({ ...ready, finalOpen: false })).toBe(false);
  });

  it('does not start again from the summary after the whistle save', () => {
    expect(
      shouldAutoSaveFinishedFixture({
        ...ready,
        started: true,
        finalOpen: false,
        postMatchOpen: true,
      }),
    ).toBe(false);
  });

  it('still saves once if the summary opens on the same frame as the whistle', () => {
    expect(
      shouldAutoSaveFinishedFixture({
        ...ready,
        finalOpen: false,
        postMatchOpen: true,
      }),
    ).toBe(true);
    expect(
      shouldAutoSaveFinishedFixture({
        ...ready,
        finalOpen: true,
        postMatchOpen: true,
        started: true,
      }),
    ).toBe(false);
  });

  it('leaves the first match and an unfinished or missing fixture alone', () => {
    expect(shouldAutoSaveFinishedFixture({ ...ready, firstMatch: true })).toBe(false);
    expect(shouldAutoSaveFinishedFixture({ ...ready, fixtureId: null })).toBe(false);
    expect(shouldAutoSaveFinishedFixture({ ...ready, fixtureId: '' })).toBe(false);
    expect(shouldAutoSaveFinishedFixture({ ...ready, finished: false })).toBe(false);
  });

  it('keeps the manager on the match screen', () => {
    const form = fixtureStayForm('fx-cup', '[]', '4-3-3', '2026-11-24', 'k-1');
    expect(form.get('fixtureId')).toBe('fx-cup');
    expect(form.get('managerLog')).toBe('[]');
    expect(form.get('kickoffId')).toBe('k-1');
    expect(form.get('startedOn')).toBe('2026-11-24');
    expect(form.get('shape')).toBe('4-3-3');
    expect(form.has('homeScore')).toBe(false);
    expect(form.has('awayScore')).toBe(false);
    expect(form.get('stay')).toBe('1');
  });
});
