import { STARTER_PACKAGE, type ClubDto } from '@/lib/club/types';
import { stadiumSeatLabel } from '@/lib/stadium/levels';
import { formatMoney } from '@/lib/finance/format-money';
import { resolveLeagueTierLabel } from '@/lib/league/league-tier';
import { resolvePlayerLeaguePositionLabel, type LeagueTableDto } from '@/lib/league';
import { clubStyleSentence } from '@/lib/training/style';
import { UI_COPY } from '@/lib/ui/copy';

/**
 * LFE-CLUB-01 — Club profile Information Thin (D47–D50).
 * D47: identity, not progression · D48: composition of existing facts ·
 * D49: no staff surface · D50: view consumes DTO only (no business logic in UI).
 */

export type ClubProfileLinkId = 'squad' | 'finance' | 'league' | 'achievements' | 'rankings';

export type ClubProfileLinkDto = {
  readonly id: ClubProfileLinkId;
  readonly href: string;
  readonly label: string;
};

export type ClubProfileDto = {
  readonly identity: {
    readonly name: string;
    readonly shortName: string;
    readonly crestTemplateId: string;
    readonly primaryColor: string;
    readonly secondaryColor: string;
  };
  readonly starter: {
    readonly leagueLabel: string;
    readonly stadiumLabel: string;
    readonly stadiumCapacityLabel: string;
  };
  /** Qualitative organization label — not a numeric §6 level. */
  readonly organizationLabel: string;
  readonly cashLabel: string;
  readonly leaguePositionLabel: string | null;
  /** Season habits as one sentence. Points are 0..8. */
  readonly styleLabel: string;
  readonly links: readonly ClubProfileLinkDto[];
};

export type ResolveClubProfileInput = {
  readonly club: ClubDto;
  readonly table: LeagueTableDto;
  /** Missing stays the starter ground. */
  readonly standsLevel?: number;
  /** Pressing habit 0..8. Missing stays 0. */
  readonly stylePressing?: number;
  /** Tempo habit 0..8. Missing stays 0. */
  readonly styleTempo?: number;
  /** Width habit 0..8. Missing stays 0. */
  readonly styleWidth?: number;
};

const PROFILE_LINKS: readonly ClubProfileLinkDto[] = [
  { id: 'squad', href: '/squad', label: UI_COPY.clubLinkSquad },
  { id: 'finance', href: '/finance', label: UI_COPY.clubLinkFinance },
  { id: 'league', href: '/league', label: UI_COPY.clubLinkLeague },
  { id: 'achievements', href: '/achievements', label: UI_COPY.clubLinkAchievements },
  { id: 'rankings', href: '/rankings', label: UI_COPY.clubLinkRankings },
];

/**
 * Sole SSOT for `/club` UI DTO (LFE-CLUB-01 · D48).
 * Pure derive — zero I/O · zero §6 engine · zero staff.
 */
export function resolveClubProfile(input: ResolveClubProfileInput): ClubProfileDto {
  const { club, table } = input;
  return {
    identity: {
      name: club.name,
      shortName: club.shortName,
      crestTemplateId: club.crestTemplateId,
      primaryColor: club.primaryColor,
      secondaryColor: club.secondaryColor,
    },
    starter: {
      leagueLabel: resolveLeagueTierLabel(club.leagueTier),
      stadiumLabel: STARTER_PACKAGE.stadiumLabel(club.name),
      stadiumCapacityLabel: stadiumSeatLabel(input.standsLevel ?? 0),
    },
    organizationLabel: UI_COPY.clubOrganizationStarter,
    cashLabel: formatMoney(club.cashBalance),
    leaguePositionLabel: resolvePlayerLeaguePositionLabel(table),
    styleLabel: clubStyleSentence(
      input.stylePressing ?? 0,
      input.styleTempo ?? 0,
      input.styleWidth ?? 0,
    ),
    links: PROFILE_LINKS,
  };
}
