/**
 * LFE-STADIUM-01 — Stadium Information Thin (D109–D115).
 * Pure derive only — no persist, no Ticket Economy, no Match Engine.
 */

import { STARTER_PACKAGE } from '@/lib/club/types';
import type { ClubSeasonPhase } from '@/lib/season/types';

/** Qualitative attendance — not a numeric simulation (D113). */
export type StadiumAttendanceBand = 'quiet' | 'steady' | 'lively' | 'unknown';

export type HomeMatchOutcome = 'win' | 'draw' | 'loss';

export type ClubStadiumDto = {
  readonly name: string;
  readonly capacityLabel: string;
  readonly attendance: {
    readonly band: StadiumAttendanceBand;
    readonly label: string;
    readonly summary: string;
  };
  /** Static identity description — not dynamic (Owner LOCK 10). */
  readonly identityNote: string;
  /** Offseason only: Confirm is not blocked by Stadium. */
  readonly hubHint: string | null;
};

export type ResolveClubStadiumInput = {
  readonly clubName: string;
  readonly seasonPhase: ClubSeasonPhase;
  /** Last home played outcome; null when no home played yet. */
  readonly lastHomeOutcome: HomeMatchOutcome | null;
  readonly homePlayedCount: number;
};

const IDENTITY_NOTE =
  'Obiekt startowy klubu — stały dom w Thin. Rozbudowa i bilety nie są częścią tej karty.' as const;

function bandFromOutcome(outcome: HomeMatchOutcome | null): StadiumAttendanceBand {
  if (outcome == null) return 'unknown';
  if (outcome === 'win') return 'lively';
  if (outcome === 'draw') return 'steady';
  return 'quiet';
}

function attendanceCopy(
  band: StadiumAttendanceBand,
  homePlayedCount: number,
): { label: string; summary: string } {
  switch (band) {
    case 'lively':
      return {
        label: 'Głośno',
        summary:
          'Ostatni mecz u siebie skończył się zwycięstwem — atmosfera domu brzmi żywo. To odczyt jakościowy, nie licznik widzów.',
      };
    case 'steady':
      return {
        label: 'Solidnie',
        summary:
          'Ostatni remis u siebie — trybuny spokojne, ale obecne. Pasmo informacyjne, bez symulacji frekwencji.',
      };
    case 'quiet':
      return {
        label: 'Spokojnie',
        summary:
          'Po porażce u siebie dom przycichł. Sygnał jakościowy dla menedżera — bez wpływu na silnik meczu.',
      };
    default:
      return {
        label: '—',
        summary:
          homePlayedCount < 1
            ? 'Jeszcze nie graliście u siebie w tym sezonie — frekwencja pozostaje nieznana.'
            : 'Brak czytelnego odczytu ostatniego meczu domowego.',
      };
  }
}

/**
 * Sole UI DTO for Stadium (D109 · D110 · D113 · D114).
 * Information Thin — describe home facts; never mutate or pay cash.
 */
export function resolveClubStadium(input: ResolveClubStadiumInput): ClubStadiumDto {
  const homePlayed = Math.max(0, Math.trunc(input.homePlayedCount));
  const band = bandFromOutcome(input.lastHomeOutcome);
  const attendance = attendanceCopy(band, homePlayed);
  const offseason = input.seasonPhase === 'offseason';

  return {
    name: STARTER_PACKAGE.stadiumLabel(input.clubName),
    capacityLabel: STARTER_PACKAGE.stadiumCapacity,
    attendance: {
      band,
      label: attendance.label,
      summary: attendance.summary,
    },
    identityNote: IDENTITY_NOTE,
    hubHint: offseason
      ? 'Start kolejnego sezonu potwierdzasz na Hubie — Stadion go nie blokuje.'
      : null,
  };
}
