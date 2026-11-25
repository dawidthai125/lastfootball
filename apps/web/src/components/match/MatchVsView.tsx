import Image from 'next/image';
import Link from 'next/link';

import { MatchCrest } from '@/components/match/MatchCrest';
import { matchPrePath } from '@/lib/match/match-path';
import { skipOrLineupLink } from '@/lib/match/xi-block-path';

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
  rivalLines,
  xiBlocked,
}: {
  matchId: string;
  homeShort: string;
  homeName: string;
  awayShort: string;
  awayName: string;
  meta: string;
  rivalLines: readonly string[];
  xiBlocked: boolean;
}) {
  const skip = skipOrLineupLink({ matchId, xiBlocked });
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
        <p className="lf-mp__eyebrow">Przed pierwszym gwizdkiem</p>
        <div className="lf-mp__vs-row" aria-label="Zestawienie">
          <div>
            <MatchCrest shortName={homeShort} clubName={homeName} size="lg" />
            <p className="lf-mp__side-name">{homeName}</p>
          </div>
          <p className="lf-mp__vs-mark">VS</p>
          <div>
            <MatchCrest shortName={awayShort} clubName={awayName} size="lg" />
            <p className="lf-mp__side-name">{awayName}</p>
          </div>
        </div>
        <p className="lf-mp__meta">{meta}</p>
        <p className="lf-mp__eyebrow">Rywal</p>
        {rivalLines.map((line) => (
          <p className="lf-mp__meta" key={line}>
            {line}
          </p>
        ))}
        {xiBlocked ? (
          <>
            <p className="lf-mp__meta">Ktoś z wyjściowej 11 nie może grać.</p>
            <Link href={skip.href} className="lf-mp__primary">
              {skip.label}
            </Link>
          </>
        ) : (
          <>
            <Link href={matchPrePath(matchId)} className="lf-mp__primary">
              Dalej
            </Link>
            <Link href={skip.href} className="lf-mp__soft">
              {skip.label}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
