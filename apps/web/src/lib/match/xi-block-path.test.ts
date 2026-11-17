import { describe, expect, it } from 'vitest';

import { lineupEditorHref, skipOrLineupLink } from '@/lib/match/xi-block-path';

describe('xi block path', () => {
  it('points the lineup editor at /match/{id}/xi', () => {
    expect(lineupEditorHref('fx-1')).toBe('/match/fx-1/xi');
  });

  it('sends a blocked XI to the editor instead of live', () => {
    expect(skipOrLineupLink({ matchId: 'fx-1', xiBlocked: true })).toEqual({
      href: '/match/fx-1/xi',
      label: 'Popraw skład',
    });
  });

  it('keeps skip-to-live when the XI is legal', () => {
    expect(skipOrLineupLink({ matchId: 'fx-1', xiBlocked: false })).toEqual({
      href: '/match/fx-1/live',
      label: 'Pomiń checklistę · Start',
    });
  });
});
