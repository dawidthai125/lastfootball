export type CompleteFixtureState = {
  error?: string;
  saved?: boolean;
  /** Official score written by the server. */
  score?: { readonly home: number; readonly away: number };
};

export const COMPLETE_FIXTURE_INITIAL: CompleteFixtureState = {};
