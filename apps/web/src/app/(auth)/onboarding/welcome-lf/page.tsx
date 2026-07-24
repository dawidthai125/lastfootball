import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ClubCrest } from '@/components/assets/ClubCrest';
import { LandingCta } from '@/components/landing/LandingCta';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';

import '@/components/onboarding/first-match-flow.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Witaj w LastFootball',
  robots: { index: false, follow: false },
};

/** Welcome beat after first match — then Hub becomes home. */
export default async function WelcomeLastFootballPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');
  if (!isFirstMatchCompleted(club)) redirect('/onboarding/first-match');

  return (
    <div className="lf-fm">
      <p className="lf-landing__eyebrow">Pierwszy mecz za tobą</p>
      <div className="lf-fm__crest">
        <ClubCrest
          shortName={club.shortName}
          clubName={club.name}
          crestTemplateId={club.crestTemplateId}
          accentColor={club.primaryColor}
          size="xl"
        />
      </div>
      <h1 className="lf-landing__title">Witaj w LastFootball</h1>
      <p className="lf-fm__lead">
        {club.name} ma już historię. Hub to twój dom — skład, terminarze i kolejne decyzje czekają.
      </p>
      <div className="lf-landing__cta-row">
        <LandingCta href="/hub" variant="primary">
          Wejdź do Hubu
        </LandingCta>
      </div>
    </div>
  );
}
