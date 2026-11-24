'use client';

import type { CompleteFixtureState } from '@/lib/fixtures/action-types';
import { UI_COPY } from '@/lib/ui/copy';

const buttonStyle = {
  borderWidth: 'var(--lf-border-width-hair)',
  borderStyle: 'solid' as const,
  borderColor: 'var(--lf-color-border-gold)',
  background: 'var(--lf-color-gold-soft)',
  color: 'var(--lf-color-gold-base)',
  fontSize: 'var(--lf-type-body)',
  fontWeight: 600,
  padding: 'var(--lf-space-2) var(--lf-space-5)',
  borderRadius: 'var(--lf-radius-sm)',
  textDecoration: 'none',
  display: 'inline-block',
};

export function CompleteLeagueFixtureButton({
  fixtureId,
  homeScore,
  awayScore,
  managerLog,
  formation,
  startedOn,
  kickoffId,
  state,
  pending,
  action,
}: {
  fixtureId: string;
  /** Score on screen. Display only: the server owns the saved one. */
  homeScore: number;
  awayScore: number;
  managerLog: string;
  formation: string;
  startedOn: string;
  kickoffId: string | null;
  state: CompleteFixtureState;
  pending: boolean;
  action: (payload: FormData) => void;
}) {
  if (state.saved) {
    const differs =
      state.score && (state.score.home !== homeScore || state.score.away !== awayScore);
    return (
      <>
        {differs && state.score ? (
          <p role="status" style={{ margin: '0 0 0.5rem' }}>
            Oficjalny wynik: {state.score.home}:{state.score.away}. Dane meczu zmieniły się w
            trakcie meczu.
          </p>
        ) : null}
        <a href="/hub" style={buttonStyle}>
          {UI_COPY.hubExit}
        </a>
      </>
    );
  }

  return (
    <form action={action} style={{ display: 'inline' }}>
      <input type="hidden" name="fixtureId" value={fixtureId} />
      <input type="hidden" name="managerLog" value={managerLog} />
      <input type="hidden" name="shape" value={formation} />
      <input type="hidden" name="startedOn" value={startedOn} />
      {kickoffId ? <input type="hidden" name="kickoffId" value={kickoffId} /> : null}
      <input type="hidden" name="stay" value="1" />
      {state.error ? (
        <p role="alert" style={{ color: 'var(--lf-color-status-danger)', margin: '0 0 0.5rem' }}>
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !state.error}
        style={{ ...buttonStyle, cursor: pending ? 'wait' : 'pointer' }}
      >
        {pending || !state.error ? UI_COPY.saving : 'Zapisz wynik'}
      </button>
    </form>
  );
}
