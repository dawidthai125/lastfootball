/**
 * LFE-CONTENT-PASS-01 — shared UI microcopy (PL).
 * SSOT: docs/game-design/UI_DESIGN_GUIDE.md §12 · §16.6
 * Presentation only — no domain rules.
 */
export const UI_COPY = {
  /** Soft exit from domains / soft-lock */
  hubExit: 'Wróć do Hub',
  hubEnter: 'Wejdź do Hub',
  hubSoft: 'Hub',

  squadNav: 'Kadra',
  viewSquad: 'Zobacz kadrę',
  setLineup: 'Ustaw skład',
  lineupTitle: 'Ustaw skład (XI)',
  goToMatch: 'Idź do meczu',
  playMatch: 'Zagraj mecz',
  playFirstMatch: 'Rozpocznij pierwszy mecz',

  softLockUnavailable: 'niedostępne',
  softLockSoon: 'wkrótce',
  softLockReason:
    'Ta lokacja odblokuje się wraz z postępem klubu. Wróć później lub wybierz inną sprawę dnia.',
  transferWindowClosed:
    'Okno transferowe jest zamknięte. Transakcje będą znów dostępne po kolejnych meczach ligowych.',

  saveAndContinue: 'Zapisz i dalej',
  saving: 'Zapisuję…',
  retry: 'Spróbuj ponownie',
  close: 'Zamknij',
  confirmOffer: 'Potwierdź akceptację oferty.',
  accept: 'Akceptuj',
  reject: 'Odrzuć',
  confirm: 'Potwierdź',

  loading: 'Ładowanie…',
  backToPrematch: 'Wróć do przedmeczu',
  backToChecklist: 'Wróć do checklisty',
} as const;

export type UiCopyKey = keyof typeof UI_COPY;
