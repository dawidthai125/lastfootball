/**
 * Puchar Krajowy (GDD §11).
 * AI ties are derived. The manager's tie is a real cup fixture once the round is due.
 */

export type CupOrigin = 'league' | 'guest';

export type CupClub = {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly isPlayer: boolean;
  readonly origin: CupOrigin;
};

export type CupRoundIndex = 1 | 2 | 3 | 4;

export type CupSide =
  | { readonly kind: 'club'; readonly club: CupClub }
  | { readonly kind: 'path' }
  | { readonly kind: 'tbd' };

export type CupTieStatus = 'played' | 'awaiting_player' | 'blocked';

export type CupVenue = 'club' | 'neutral' | 'unknown';

export type CupDecidedBy = 'regulation' | 'extra';

export type CupTieDto = {
  readonly id: string;
  readonly home: CupSide;
  readonly away: CupSide;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly winnerId: string | null;
  readonly status: CupTieStatus;
  readonly venue: CupVenue;
  readonly hostClubId: string | null;
  readonly decidedBy: CupDecidedBy | null;
  readonly onPlayerPath: boolean;
};

export type CupRoundDto = {
  readonly round: CupRoundIndex;
  readonly label: string;
  readonly ties: readonly CupTieDto[];
};

export type PlayerCupTieDto = {
  readonly round: CupRoundIndex;
  readonly roundLabel: string;
  readonly matchday: number;
  /** True when enough league matches are played to open this round. */
  readonly due: boolean;
  readonly opponentId: string;
  readonly opponentName: string;
  readonly opponentShort: string;
  readonly isHome: boolean;
};

export type NationalCupDto = {
  readonly name: 'Puchar Krajowy';
  readonly seasonLabel: string;
  /** Where the four guests come from (higher tier, or wildcards in Liga I). */
  readonly guestOriginLabel: string;
  readonly unlockAfterMatchday: number;
  readonly playedLeagueMatchdays: number;
  readonly editionOpen: boolean;
  /** All 16 clubs, name order. Not the draw. */
  readonly qualified: readonly CupClub[];
  /** Empty until the edition opens (draw is after league matchday 8). */
  readonly rounds: readonly CupRoundDto[];
  /** Next unplayed tie for the manager. Null before the draw, or after elimination. */
  readonly playerTie: PlayerCupTieDto | null;
};
