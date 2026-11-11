import { EmailConfirmBanner } from '@/components/auth/EmailConfirmBanner';
import { loadEmailGate } from '@/lib/auth/email-confirm';

const deadlineFormat = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Warsaw',
});

/** One indexed read. Renders nothing when the email is already confirmed. */
export async function EmailConfirmSlot({
  userId,
  variant,
}: {
  userId: string;
  variant: 'game' | 'auth';
}) {
  const gate = await loadEmailGate(userId);
  if (!gate.showBanner || !gate.deadlineAt) return null;
  const parsed = Date.parse(gate.deadlineAt);
  const deadlineLabel = Number.isFinite(parsed) ? deadlineFormat.format(parsed) : gate.deadlineAt;

  return (
    <EmailConfirmBanner
      variant={variant}
      deadlineLabel={deadlineLabel}
      matchesBlocked={gate.matchesBlocked}
    />
  );
}
