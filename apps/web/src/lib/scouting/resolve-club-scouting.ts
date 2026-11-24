import type { ClubDto } from '@/lib/club/types';
import type { HubPhase } from '@/lib/hub/types';
import {
  POTENTIAL_BAND_LABEL,
  potentialBandLabel,
  resolvePlayerPotential,
  resolvePotentialBand,
  type PotentialBandId,
} from '@/lib/squad/potential';
import { filterSeniorPlayers, type PlayerRowDto } from '@/lib/squad/types';
import type { TransferMarketDto } from '@/lib/transfers/types';
import { academyCeilingView } from '@/lib/academy/ceiling';
import { canAddToShortlist } from '@/lib/scouting/shortlist';
import { SCOUTING_THIN, type ScoutingCandidateDto, type ScoutingDto } from '@/lib/scouting/types';

function displayPos(pos: string): string {
  if (pos === 'ŚO' || pos === 'LO') return 'OB';
  return pos;
}

function fromOwnSenior(row: PlayerRowDto, onShortlist: boolean): ScoutingCandidateDto {
  return {
    playerId: row.id,
    name: row.name,
    pos: displayPos(row.pos),
    age: row.age,
    potentialBand: resolvePotentialBand(row.potential),
    potentialLabel: potentialBandLabel(row.potential),
    listed: row.transferListedAt != null,
    source: 'own_senior',
    onShortlist,
    ctaHref: '/squad',
    ctaLabel: 'Kadra',
  };
}

function fromLiveListing(
  listing: TransferMarketDto['liveListings'][number],
  onShortlist: boolean,
  /** Null = reports could not be read here; undefined = not bought. */
  report: PotentialBandId | null | undefined,
): ScoutingCandidateDto {
  // The bought band stays true when the player ages; the estimate does not (D155).
  const revealed = report === null ? null : report !== undefined;
  const band =
    report ??
    resolvePotentialBand(resolvePlayerPotential(listing.skill, listing.playerId, listing.age));
  const bandLabel = POTENTIAL_BAND_LABEL[band];
  const ceiling =
    revealed === null
      ? { label: bandLabel, hidden: false }
      : academyCeilingView({ revealed, bandLabel });
  return {
    playerId: listing.playerId,
    name: listing.playerName,
    pos: listing.pos,
    age: listing.age,
    potentialBand: ceiling.hidden ? 'low' : band,
    potentialLabel: ceiling.label,
    listed: true,
    source: 'market_listed',
    onShortlist,
    ctaHref: '/transfers',
    ctaLabel: 'Transfery',
  };
}

/**
 * Sole Scouting UI SSOT (LFE-SCOUTING-01 Information Thin).
 * Pure — no Supabase. Organizes facts; never scores / ranks / AI-picks.
 * Callers pass market from resolveTransferMarket (REUSE).
 */
export function resolveClubScouting(
  club: Pick<ClubDto, 'id'>,
  ownPlayers: readonly PlayerRowDto[],
  market: TransferMarketDto,
  shortlistIds: readonly string[],
  phase: HubPhase,
  reports?: ReadonlyMap<string, PotentialBandId>,
): ScoutingDto {
  const unlocked = phase === 'SEASON' || phase === 'PLAYOFF' || phase === 'OFFSEASON';
  const shortlistSet = new Set(shortlistIds);
  const seniors = filterSeniorPlayers(ownPlayers);

  const byId = new Map<string, ScoutingCandidateDto>();

  for (const row of seniors) {
    byId.set(row.id, fromOwnSenior(row, shortlistSet.has(row.id)));
  }
  for (const listing of market.liveListings) {
    const report = reports == null ? null : reports.get(listing.playerId);
    byId.set(
      listing.playerId,
      fromLiveListing(listing, shortlistSet.has(listing.playerId), report),
    );
  }

  const candidates = [...byId.values()];
  const shortlist = shortlistIds
    .map((id) => byId.get(id))
    .filter((c): c is ScoutingCandidateDto => c != null);

  const shortlistCount = shortlist.length;
  const canAdd =
    unlocked &&
    shortlistCount < SCOUTING_THIN.MAX_SHORTLIST &&
    candidates.some((c) => {
      const check = canAddToShortlist(shortlistIds, c.playerId, ownPlayers, market.liveListings);
      return check.ok;
    });

  return {
    clubId: club.id,
    phase,
    unlocked,
    windowOpen: market.windowOpen,
    candidates,
    shortlist,
    shortlistCount,
    maxShortlist: SCOUTING_THIN.MAX_SHORTLIST,
    canAddShortlist: canAdd,
  };
}
