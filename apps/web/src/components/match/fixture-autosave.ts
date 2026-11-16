/**
 * When to persist a finished league, cup, challenge, or human fixture.
 * The post-match summary only shows this save; it must not start another one.
 * The first match keeps its own button.
 */
export type FixtureAutoSaveInput = {
  firstMatch: boolean;
  fixtureId: string | null;
  finished: boolean;
  finalOpen: boolean;
  postMatchOpen: boolean;
  started: boolean;
};

export function shouldAutoSaveFinishedFixture(input: FixtureAutoSaveInput): boolean {
  if (input.started || input.firstMatch || !input.fixtureId) return false;
  if (!input.finished) return false;
  // Same moment as the whistle overlay. Also covers opening the summary on that frame,
  // before finalOpen flips, so the result is still stored once.
  return input.finalOpen || input.postMatchOpen;
}

/** stay=1 keeps the manager on the match screen. */
export function fixtureStayForm(fixtureId: string, homeScore: number, awayScore: number): FormData {
  const data = new FormData();
  data.set('fixtureId', fixtureId);
  data.set('homeScore', String(homeScore));
  data.set('awayScore', String(awayScore));
  data.set('stay', '1');
  return data;
}
