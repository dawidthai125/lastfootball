import type { LeagueTableDto } from '@/lib/league/types';
import {
  formatSeasonLabel,
  type SeasonReportDto,
  type SeasonReportHighlight,
  type SeasonResultZone,
} from '@/lib/season/types';

const ZONE_LABEL: Record<SeasonResultZone, string> = {
  top: 'Góra tabeli',
  upper_mid: 'Górny środek',
  lower_mid: 'Dolny środek',
  bottom: 'Dół tabeli',
};

/**
 * Information Thin season report — pure derive from league table (D81 · D84 · D86).
 * Read-only: no mutations, no Fake Production, no promotion language (D73).
 */
export function resolveSeasonReport(
  table: LeagueTableDto,
  seasonNumber: number,
): SeasonReportDto | null {
  const player = table.rows.find((r) => r.isPlayer);
  if (!player) return null;

  const zone = resolveResultZone(player.position, table.rows.length);
  const highlights = buildHighlights(player, zone);

  return {
    seasonNumber,
    seasonLabel: formatSeasonLabel(seasonNumber),
    leagueLabel: table.leagueLabel,
    position: player.position,
    tableSize: table.rows.length,
    played: player.played,
    won: player.won,
    drawn: player.drawn,
    lost: player.lost,
    goalsFor: player.goalsFor,
    goalsAgainst: player.goalsAgainst,
    goalDifference: player.goalDifference,
    points: player.points,
    zone,
    zoneLabel: ZONE_LABEL[zone],
    highlights,
  };
}

function resolveResultZone(position: number, tableSize: number): SeasonResultZone {
  if (tableSize <= 0) return 'lower_mid';
  if (position <= 2) return 'top';
  if (position <= Math.ceil(tableSize / 2)) return 'upper_mid';
  if (position <= tableSize - 2) return 'lower_mid';
  return 'bottom';
}

function buildHighlights(
  player: {
    readonly position: number;
    readonly played: number;
    readonly won: number;
    readonly drawn: number;
    readonly lost: number;
    readonly points: number;
    readonly goalDifference: number;
  },
  zone: SeasonResultZone,
): SeasonReportHighlight[] {
  const out: SeasonReportHighlight[] = [
    {
      id: 'final-position',
      label: `Pozycja końcowa: ${player.position}.`,
    },
    {
      id: 'record',
      label: `Bilans: ${player.won}W · ${player.drawn}R · ${player.lost}P · ${player.points} pkt`,
    },
  ];
  if (player.played > 0) {
    out.push({
      id: 'goal-diff',
      label: `Bilans bramek: ${player.goalDifference >= 0 ? '+' : ''}${player.goalDifference}`,
    });
  } else {
    out.push({
      id: 'zone',
      label: `Strefa sezonu: ${ZONE_LABEL[zone]}`,
    });
  }
  return out.slice(0, 3);
}
