/** First steps of a new club (D142). Pure; `claim_starter_reward` repeats the checks. */

export const STARTER_REWARD = 5_000;
export const STARTER_REWARD_LABEL = 'Pierwsze kroki klubu';

export type StarterProgress = {
  readonly played: number;
  readonly trained: boolean;
  readonly intake: boolean;
  readonly claimed: boolean;
};

export type StarterStep = {
  readonly id: 'match-1' | 'match-2' | 'training' | 'intake' | 'match-3';
  readonly label: string;
  readonly why: string;
  readonly href: string;
  readonly done: boolean;
};

export type StarterPath = {
  readonly steps: readonly StarterStep[];
  /** First step that is not done. */
  readonly nextId: StarterStep['id'] | null;
  readonly complete: boolean;
};

/** Null when there is nothing left to show. */
export function resolveStarterPath(progress: StarterProgress | null): StarterPath | null {
  if (!progress || progress.claimed) return null;
  const steps: StarterStep[] = [
    {
      id: 'match-1',
      label: 'Rozegraj pierwszy mecz ligowy',
      why: 'Jeden mecz dziennie. Wygrana daje 13 000 €, a każdy mecz kosztuje pensje.',
      href: '/matches',
      done: progress.played >= 1,
    },
    {
      id: 'match-2',
      label: 'Rozegraj drugi mecz',
      why: 'Otwiera trening i transfery.',
      href: '/matches',
      done: progress.played >= 2,
    },
    {
      id: 'training',
      label: 'Przeprowadź trening',
      why: 'Raz dziennie. Rozwija zawodników, ale zabiera energię przed meczem.',
      href: '/training',
      done: progress.trained,
    },
    {
      id: 'intake',
      label: 'Zrób nabór w akademii',
      why: 'Młody zawodnik za darmo. Za kilka sezonów może grać w pierwszym składzie.',
      href: '/academy',
      done: progress.intake,
    },
    {
      id: 'match-3',
      label: 'Rozegraj trzeci mecz',
      why: 'W „Ustaw skład” użyj „Najlepsza jedenastka”: zmęczeni grają słabiej.',
      href: '/matches',
      done: progress.played >= 3,
    },
  ];
  const next = steps.find((step) => !step.done) ?? null;
  return { steps, nextId: next?.id ?? null, complete: next === null };
}
