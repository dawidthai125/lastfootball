'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { runTrainingSession } from '@/lib/training/actions';
import { TRAINING_ACTION_INITIAL } from '@/lib/training/action-types';
import type { TrainingDto, TrainingFocusId, TrainingIntensityId } from '@/lib/training/types';

function lockCopy(dto: TrainingDto): string {
  switch (dto.lockReason) {
    case 'not_unlocked':
      return `Trening odblokuje się po ${dto.playedRequired} rozegranych meczach ligowych (masz ${dto.playedCount}).`;
    case 'already_trained_today':
      return 'Dzisiejsza sesja już odbyta. Wróć jutro (dzień UTC).';
    case 'squad_unavailable':
      return 'Brak aktywnej kadry — trening niedostępny.';
    default:
      return '';
  }
}

export function TrainingView({ training }: { training: TrainingDto }) {
  const [focusId, setFocusId] = useState<TrainingFocusId>(training.defaults.focusId);
  const [intensityId, setIntensityId] = useState<TrainingIntensityId>(
    training.defaults.intensityId,
  );
  const [state, action, pending] = useActionState(runTrainingSession, TRAINING_ACTION_INITIAL);

  const r = training.readiness;
  const isRegen = focusId === 'regeneration';

  return (
    <div className="space-y-2">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {training.unlocked ? (
          <Badge tone="ok">Odblokowany</Badge>
        ) : (
          <Badge tone="warn">Zablokowany</Badge>
        )}
        {training.canTrain ? (
          <Badge tone="ok">Sesja dostępna</Badge>
        ) : (
          <Badge tone="default">Sesja niedostępna</Badge>
        )}
        <span className="text-[12px] text-[var(--lf-muted)]">
          Rozegrane: {training.playedCount}/{training.playedRequired} · Dziś (UTC): {training.today}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Panel title="Gotowi">
          <p className="m-0 text-lg font-medium tabular-nums">{r.ready}</p>
        </Panel>
        <Panel title="Zmęczeni">
          <p className="m-0 text-lg font-medium tabular-nums">{r.tired}</p>
        </Panel>
        <Panel title="Kontuzje">
          <p className="m-0 text-lg font-medium tabular-nums">{r.injured}</p>
        </Panel>
        <Panel title="Zawieszeni">
          <p className="m-0 text-lg font-medium tabular-nums">{r.suspended}</p>
        </Panel>
        <Panel title="Aktywni">
          <p className="m-0 text-lg font-medium tabular-nums">{r.active}</p>
        </Panel>
      </div>

      {!training.canTrain ? (
        <Panel title="Informacja">
          <p className="m-0 text-[var(--lf-color-text-muted)]">{lockCopy(training)}</p>
        </Panel>
      ) : null}

      {state.ok && !state.skipped ? (
        <Panel title="Trening zakończony">
          <p className="m-0 text-[var(--lf-ok)]">
            Sesja zapisana. Statusy kadry zaktualizowane — sprawdź{' '}
            <Link href="/squad" className="underline">
              Skład
            </Link>
            .
          </p>
        </Panel>
      ) : null}
      {state.ok && state.skipped ? (
        <Panel title="Informacja">
          <p className="m-0 text-[var(--lf-color-text-muted)]">Sesja na dziś była już zapisana.</p>
        </Panel>
      ) : null}
      {state.error ? (
        <Panel title="Błąd">
          <p className="m-0 text-[var(--lf-danger)]" role="alert">
            {state.error}
          </p>
        </Panel>
      ) : null}

      <Panel title="Fokus zespołowy">
        <div className="grid gap-2 sm:grid-cols-2">
          {training.focuses.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFocusId(f.id)}
              className="border px-3 py-2 text-left text-[13px] transition-colors"
              style={{
                borderColor: focusId === f.id ? 'var(--lf-color-border-gold)' : 'var(--lf-border)',
                background: focusId === f.id ? 'var(--lf-color-gold-soft)' : 'var(--lf-inset)',
              }}
            >
              <div className="font-medium text-[var(--lf-text-strong)]">{f.label}</div>
              <div className="mt-0.5 text-[12px] text-[var(--lf-muted)]">{f.description}</div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Intensywność">
        {isRegen ? (
          <p className="m-0 text-[13px] text-[var(--lf-muted)]">
            Przy regeneracji intensywność nie zmienia efektu — kadra odpoczywa.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {training.intensities.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setIntensityId(i.id)}
                className="border px-3 py-2 text-left text-[13px]"
                style={{
                  borderColor:
                    intensityId === i.id ? 'var(--lf-color-border-gold)' : 'var(--lf-border)',
                  background:
                    intensityId === i.id ? 'var(--lf-color-gold-soft)' : 'var(--lf-inset)',
                }}
              >
                <div className="font-medium">{i.label}</div>
                <div className="text-[12px] text-[var(--lf-muted)]">{i.description}</div>
              </button>
            ))}
          </div>
        )}
      </Panel>

      <form action={action} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="focusId" value={focusId} />
        <input type="hidden" name="intensityId" value={intensityId} />
        <Button type="submit" variant="primary" size="md" disabled={!training.canTrain || pending}>
          {pending ? 'Trening…' : 'Przeprowadź trening'}
        </Button>
        <Link
          href="/squad"
          className="text-[13px] text-[var(--lf-muted)] underline-offset-2 hover:underline"
        >
          Skład
        </Link>
      </form>
    </div>
  );
}
