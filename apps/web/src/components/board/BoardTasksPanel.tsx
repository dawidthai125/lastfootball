'use client';

import { useActionState } from 'react';

import { Button, Panel, StateBanner } from '@/components/ui';
import { BOARD_TASK_ACTION_INITIAL } from '@/lib/board/action-types';
import { collectTaskReward } from '@/lib/board/actions';
import type { BoardTaskDto, BoardTaskState } from '@/lib/board/tasks';

const STATE_LABEL: Record<BoardTaskState, string> = {
  upcoming: 'Przed nami',
  active: 'W toku',
  done: 'Wykonane',
  failed: 'Niewykonane',
  claimed: 'Odebrane',
};

/** Board tasks (D131). The server recomputes completion; the form only names the block. */
export function BoardTasksPanel({ tasks }: { tasks: readonly BoardTaskDto[] }) {
  const [state, action, pending] = useActionState(collectTaskReward, BOARD_TASK_ACTION_INITIAL);
  // One dominant button per screen (UI guide §16.3).
  const firstDone = tasks.find((task) => task.state === 'done')?.block;

  return (
    <Panel title="Zadania zarządu" flush>
      {state.error ? (
        <div className="px-2.5 pt-2.5">
          <StateBanner tone="error">{state.error}</StateBanner>
        </div>
      ) : null}
      <ul>
        {tasks.map((task) => (
          <li
            key={task.block}
            className="space-y-0.5 border-b border-[var(--lf-border)] px-2.5 py-2.5 text-[13px]"
            data-board-task={task.state}
          >
            <p className="text-[var(--lf-text-strong)]">{task.title}</p>
            <p className="text-[12px] text-[var(--lf-muted)]">
              {task.matchdaysLabel} · {STATE_LABEL[task.state]}
              {task.state === 'active' ? ` ${task.progress}/${task.target}` : ''} · nagroda{' '}
              {task.rewardLabel}
            </p>
            {task.state === 'done' ? (
              <form action={action} className="pt-1">
                <input type="hidden" name="block" value={task.block} />
                <Button
                  type="submit"
                  variant={task.block === firstDone ? 'primary' : 'default'}
                  size="md"
                  className="min-h-11"
                  disabled={pending}
                >
                  {pending ? 'Wypłata…' : `Odbierz ${task.rewardLabel}`}
                </Button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="px-2.5 py-2.5 text-[11px] text-[var(--lf-faint)]">
        Niewykonane zadanie nic nie kosztuje. Nieodebrane nagrody wypłacamy przy starcie kolejnego
        sezonu.
      </p>
    </Panel>
  );
}
