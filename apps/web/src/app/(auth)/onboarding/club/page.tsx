import type { Metadata } from 'next';

import { ClubWizard } from '@/components/onboarding/ClubWizard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Stwórz klub',
  robots: { index: false, follow: false },
};

/** Club Wizard §5 — identity → reveal → persist → Hub. */
export default function ClubOnboardingPage() {
  return <ClubWizard />;
}
