import Link from 'next/link';

import { LocationHero, Panel } from '@/components/ui';
import type { BoardTone, ClubBoardDto } from '@/lib/board';
import { UI_COPY } from '@/lib/ui/copy';

function toneLabel(tone: BoardTone): string {
  switch (tone) {
    case 'positive':
      return 'Ton: uznanie';
    case 'concern':
      return 'Ton: troska';
    default:
      return 'Ton: spokojny';
  }
}

/**
 * Board Experience — LFE-BOARD-01 Information Thin.
 * Domain only via resolveClubBoard (D102 · D103). No actions / mutations.
 */
export function BoardView({ board }: { board: ClubBoardDto }) {
  return (
    <div className="lf-brd" data-lf-impl="LFE-BOARD-01" data-board-tone={board.tone}>
      <LocationHero waId="HERO-001" src="/assets/world-art/hero-001-office-night.png" priority />

      <header className="mb-3 px-0.5">
        <p className="text-[11px] tracking-wide text-[var(--lf-muted)] uppercase">Zarząd</p>
        <h1 className="font-[family-name:var(--font-display)] text-[1.25rem] text-[var(--lf-text-strong)]">
          Co myślą władze o sezonie?
        </h1>
        <p className="mt-1 text-[12px] text-[var(--lf-muted)]">
          {board.seasonLabel} · {board.phaseLabel} · {toneLabel(board.tone)}
        </p>
      </header>

      <Panel title={board.expectation.label} flush>
        <p className="px-2.5 py-2.5 text-[13px] text-[var(--lf-muted)]">
          {board.expectation.summary}
        </p>
      </Panel>

      <div className="mt-3">
        <Panel title="Sytuacja w tabeli" flush>
          <div className="space-y-1 px-2.5 py-2.5 text-[13px]">
            <p className="text-[var(--lf-text-strong)]">{board.standing.progressLabel}</p>
            <p className="text-[12px] text-[var(--lf-muted)]">
              Rozegrano {board.standing.played}
              {board.standing.tableSize > 0 ? ` · tabela ${board.standing.tableSize}` : ''}
            </p>
          </div>
        </Panel>
      </div>

      {board.seasonReview ? (
        <div className="mt-3">
          <Panel title="Podsumowanie władz" flush>
            <div className="space-y-1.5 px-2.5 py-2.5 text-[13px]">
              <p className="text-[var(--lf-text-strong)]">{board.seasonReview.outcomeLabel}</p>
              <p className="text-[12px] text-[var(--lf-muted)]">{board.seasonReview.summary}</p>
            </div>
          </Panel>
        </div>
      ) : null}

      {board.hubHint ? (
        <p className="mt-3 text-[12px] text-[var(--lf-faint)]">{board.hubHint}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/hub"
          className="text-[13px] text-[var(--lf-color-accent)] underline-offset-2 hover:underline"
        >
          {UI_COPY.hubExit}
        </Link>
        <Link
          href="/league"
          className="text-[13px] text-[var(--lf-muted)] underline-offset-2 hover:underline"
        >
          Liga
        </Link>
      </div>
    </div>
  );
}
