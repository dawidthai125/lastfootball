import type { Metadata } from 'next';

import { LandingPage } from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'LastFootball',
  description: 'Załóż klub. Prowadź go przez ligę. Każdy mecz jest Twój.',
};

/** Public Landing — LFE-LANDING-01 (UI P0 marketing home). */
export default function MarketingHomePage() {
  return <LandingPage />;
}
