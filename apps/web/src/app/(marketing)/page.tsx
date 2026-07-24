import type { Metadata } from 'next';

import { LandingPage } from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'LastFootball',
  description: 'Załóż klub. Prowadź go przez ligę. Każdy mecz jest Twój.',
};

/** Public Landing — LFE-PLATFORM-01 P1 (S0–S4). */
export default function MarketingHomePage() {
  return <LandingPage />;
}
