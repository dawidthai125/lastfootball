/** Operator data on the legal pages (public tax register, confirmed by the Owner 2026-11-24). */
export const OPERATOR = {
  name: 'Dawid Thai Thanh',
  address: 'ul. Poświęcka 17C/26, 51-128 Wrocław',
  nip: '8952035524',
  regon: '022517157',
  email: 'kontakt@lastfootball.pl',
  site: 'www.lastfootball.pl',
} as const;

/** Minimum age and how long letters to the contact address are kept. */
export const LEGAL = { minAge: 16, lettersMonths: 12, since: '24 listopada 2026' } as const;
