import Image from 'next/image';
import Link from 'next/link';

import { CrestMonogram } from '@/components/match/CrestMonogram';
import { matchLivePath, matchPrePath } from '@/lib/match/match-path';

import './match-path.css';

/**
 * HF-MCH-02 Kick-Off / VS.
 */
export function MatchVsView({
  matchId,
  homeShort,
  homeName,
  awayShort,
  awayName,
  meta,
}: {
  matchId: string;
  homeShort: string;
  homeName: string;
  awayShort: string;
  awayName: string;
  meta: string;
}) {
  return (
    <div className="lf-mp lf-mp--immersive" data-lf-impl="LFE-UI-IMPL-02" data-mch="SCR-MCH-02">
      <div className="lf-mp__hero" data-wa="HERO-003">
        <Image
          className="lf-mp__hero-img"
          src="/assets/world-art/hero-003-pitch-night.png"
          alt=""
          fill
          sizes="100vw"
          priority
        />
        <div className="lf-mp__veil" />
      </div>
      <div className="lf-mp__decision">
        <p className="lf-mp__eyebrow">Kick-off</p>
        <div className="lf-mp__vs-row" aria-label="Zestawienie">
          <div>
            <CrestMonogram initials={homeShort} label={homeName} />
            <p className="lf-mp__side-name">{homeName}</p>
          </div>
          <p className="lf-mp__vs-mark">VS</p>
          <div>
            <CrestMonogram initials={awayShort} label={awayName} />
            <p className="lf-mp__side-name">{awayName}</p>
          </div>
        </div>
        <p className="lf-mp__meta">{meta}</p>
        <Link href={matchPrePath(matchId)} className="lf-mp__primary">
          Dalej
        </Link>
        <Link href={matchLivePath(matchId)} className="lf-mp__soft">
          Pomiń checklistę · Start
        </Link>
      </div>
    </div>
  );
}
