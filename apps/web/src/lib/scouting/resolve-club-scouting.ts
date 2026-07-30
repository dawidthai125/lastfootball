import type { ClubDto } from '@/lib/club/types';
import type { HubPhase } from '@/lib/hub/types';
import {
  potentialBandLabel,
  resolvePlayerPotential,
  resolvePotentialBand,
} from '@/lib/squad/potential';
import { filterSeniorPlayers, type PlayerRowDto } from '@/lib/squad/types';
import type { TransferMarketDto } from '@/lib/transfers/types';
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
): ScoutingCandidateDto {
  /** REUSE D22 helper — presentation band from existing skill/id/age (no second rating). */
  const potential = resolvePlayerPotential(listing.skill, listing.playerId, listing.age);
  return {
    playerId: listing.playerId,
    name: listing.playerName,
    pos: listing.pos,
    age: listing.age,
    potentialBand: resolvePotentialBand(potential),
    potentialLabel: potentialBandLabel(potential),
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
): ScoutingDto {
  const unlocked = phase === 'SEASON' || phase === 'PLAYOFF' || phase === 'OFFSEASON';
  const shortlistSet = new Set(shortlistIds);
  const seniors = filterSeniorPlayers(ownPlayers);

  const byId = new Map<string, ScoutingCandidateDto>();

  for (const row of seniors) {
    byId.set(row.id, fromOwnSenior(row, shortlistSet.has(row.id)));
  }
  for (const listing of market.liveListings) {
    byId.set(listing.playerId, fromLiveListing(listing, shortlistSet.has(listing.playerId)));
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
