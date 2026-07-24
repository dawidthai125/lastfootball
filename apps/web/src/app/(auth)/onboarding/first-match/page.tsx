import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ClubCrest } from '@/components/assets/ClubCrest';
import { LandingCta } from '@/components/landing/LandingCta';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { FIRST_MATCH_BOT, FIRST_MATCH_PATHS } from '@/lib/first-match/constants';
import { STARTER_PACKAGE } from '@/lib/club/types';

import '@/components/onboarding/first-match-flow.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pierwszy mecz',
  robots: { index: false, follow: false },
};

/** First Match Intro — Reveal → emotion bridge → Prematch (no Hub yet). */
export default async function FirstMatchIntroPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');
  if (isFirstMatchCompleted(club)) redirect('/hub');

  return (
    <div className="lf-fm">
      <p className="lf-landing__eyebrow">Dzień 1 · Pierwszy mecz</p>
      <div className="lf-fm__crest">
        <ClubCrest
          shortName={club.shortName}
          clubName={club.name}
          crestTemplateId={club.crestTemplateId}
          accentColor={club.primaryColor}
          size="xl"
        />
      </div>
      <h1 className="lf-landing__title">{club.name}</h1>
      <p className="lf-fm__lead">
        Twój klub jest gotowy. Przed tobą mecz inauguracyjny przeciwko{' '}
        <strong>{FIRST_MATCH_BOT.name}</strong> — {STARTER_PACKAGE.league}.
      </p>
      <p className="lf-fm__sub">
        Ustaw się na ławce, wyjdź na boisko i domknij pierwszy gwizdek w historii klubu.
      </p>
      <div className="lf-landing__cta-row">
        <LandingCta href={FIRST_MATCH_PATHS.prematch} variant="primary">
          Przygotuj pierwszy mecz
        </LandingCta>
      </div>
      <p className="lf-fm__footnote">
        Hub odblokuje się po zakończeniu meczu.{' '}
        <Link href={FIRST_MATCH_PATHS.prematch}>Pomiń intro →</Link>
      </p>
    </div>
  );
}
