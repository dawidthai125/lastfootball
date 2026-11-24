export const REPORT_REASONS = {
  name: 'Nazwa klubu',
  cheating: 'Nieuczciwa gra',
  other: 'Coś innego',
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;

export function isReportReason(value: unknown): value is ReportReason {
  return typeof value === 'string' && Object.hasOwn(REPORT_REASONS, value);
}

export type ModerationState = { readonly error: string | null; readonly info: string | null };
export const MODERATION_INITIAL: ModerationState = { error: null, info: null };
