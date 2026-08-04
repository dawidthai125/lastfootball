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
  prepareNextSeason: 'Przygotuj sezon',

  /** LFE-SEASON-END-01 — Season report Information Thin (read-only) */
  seasonReportEyebrow: 'Sezon zamknięty',
  seasonReportTitle: 'Raport sezonu',
  seasonReportSubtitle: 'Podsumowanie faktów z tabeli ligowej',
  seasonReportConfirmHint: 'Potwierdź, gdy będziesz gotów na nowy sezon.',
  seasonReportPosition: 'Pozycja',
  seasonReportRecord: 'Bilans',
  seasonReportPoints: 'Punkty',
  seasonReportZone: 'Strefa',
  seasonReportOutcome: 'Wynik ligowy',
  seasonReportHighlights: 'Wyróżnienia',

  /** LFE-DAILY-01 — Daily Goal Thin (suggestion only; not Primary) */
  dailyGoalEyebrow: 'Dziś warto',
  dailyGoalMatch: 'Dokończ przygotowanie meczu',
  dailyGoalSquad: 'Sprawdź kadrę',
  dailyGoalTraining: 'Przeprowadź trening',

  /** LFE-MESSAGES-01 — derived inbox (no mocks / workflow) */
  messagesTitle: 'Wiadomości',
  messagesSubtitle: 'Skrót spraw z Transferów i systemu',
  messagesEmptyHint: 'Brak spraw do przejrzenia.',
  messagesOverlayTitle: 'Sprawy',
  messagesOpenInbox: 'Otwórz skrzynkę',
  messagesPriorityDecision: 'Sprawa',
  messagesPriorityInfo: 'Info',
  messagesBellAria: 'Sprawy',

  /** LFE-NOTIFICATIONS-01 — Invitation Layer (in-app soft remind; ≠ Messages) */
  invitationEyebrow: 'Zaproszenie',
  invitationMatchday: 'Idź do meczu',
  invitationOpen: 'Przejdź',
  invitationDismiss: 'Odrzuć zaproszenie',
  invitationAria: 'Zaproszenie do decyzji',

  /** LFE-ACHIEVEMENTS-01 — history Thin (no XP / rewards) */
  achievementsTitle: 'Osiągnięcia',
  achievementsSubtitle: 'Kamienie milowe kariery i klubu',
  achievementsEmptyHint: 'Historia zbuduje się wraz z karierą.',
  achievementClubFoundedTitle: 'Klub założony',
  achievementClubFoundedDetail: 'Tożsamość klubu zapisana w lidze.',
  achievementFirstMatchTitle: 'Pierwszy mecz',
  achievementFirstMatchDetail: 'Pierwszy oficjalny wyjazd na boisko za Tobą.',
  achievementFirstLeagueTitle: 'Pierwszy mecz ligowy',
  achievementFirstLeagueDetail: 'Kolejka ligowa domknięta w historii klubu.',
  achievementFirstTrainingTitle: 'Pierwszy trening',
  achievementFirstTrainingDetail: 'Pierwsza sesja treningowa drużyny odbyta.',
  achievementCategoryClub: 'Klub',
  achievementCategoryCareer: 'Kariera',
  achievementCategorySport: 'Sport',
  achievementCategorySeason: 'Sezon',

  /** LFE-RANKING-01 — seasonal club ranking Thin (no ELO / league columns) */
  rankingEyebrow: 'Sezon',
  rankingTitle: 'Ranking',
  rankingSubtitle: 'Jak wypada Twój klub wśród innych w tym sezonie',
  rankingBandUpper: 'Górna część sezonu',
  rankingBandMid: 'Środek stawki',
  rankingBandLower: 'Dolna część sezonu',
  rankingPlayerPositionPrefix: 'Twoja pozycja:',

  /** LFE-CLUB-01 — club identity card Thin (no §6 engine / staff) */
  clubTitle: 'Klub',
  clubSubtitle: 'Tożsamość i kontekst Twojego klubu',
  clubOrganizationStarter: 'Klub startowy',
  clubLinkSquad: 'Kadra',
  clubLinkFinance: 'Finanse',
  clubLinkLeague: 'Liga',
  clubLinkAchievements: 'Osiągnięcia',
  clubLinkRankings: 'Ranking',
  clubCashLabel: 'Kasa',
  clubLeaguePositionLabel: 'Pozycja',
  clubStadiumLabel: 'Stadion',
  clubLeagueLabel: 'Liga',
  clubOrganizationLabel: 'Organizacja',
  clubLinksLabel: 'Skróty',

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
