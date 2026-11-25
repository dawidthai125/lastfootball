'use client';

import { ClubCrest, type ClubCrestSize } from '@/components/assets/ClubCrest';
import { useClub } from '@/components/club/ClubProvider';

/** A crest of a match: the manager's own club wears the crest chosen for it. */
export function MatchCrest({
  shortName,
  clubName,
  label,
  size,
}: {
  shortName: string;
  clubName?: string;
  label?: string;
  size: ClubCrestSize;
}) {
  const club = useClub();
  const own = club != null && club.name === clubName && club.shortName === shortName;
  return (
    <ClubCrest
      shortName={shortName}
      clubName={clubName}
      label={label}
      size={size}
      crestTemplateId={own ? club.crestTemplateId : null}
    />
  );
}
