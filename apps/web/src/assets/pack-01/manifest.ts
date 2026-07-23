/**
 * LFE-ASSET-PACK-01 — single registry for replaceable visual assets.
 * Swap files under public/assets/pack-01 without changing call sites.
 */

export const ASSET_PACK_ID = 'pack-01' as const;
export const ASSET_BASE = `/assets/${ASSET_PACK_ID}` as const;

/** Club crest keys — map shortName / slug → file */
export const CREST_FILES = {
  FCL: 'crests/fcl.svg',
  ORG: 'crests/org.svg',
  LPD: 'crests/lpd.svg',
  GW: 'crests/gw.svg',
  AN: 'crests/an.svg',
  ATC: 'crests/atc.svg',
  VH: 'crests/vh.svg',
  DEFAULT: 'crests/_default.svg',
} as const;

export type CrestKey = keyof typeof CREST_FILES;

export const PORTRAIT_FILES = {
  placeholder: 'portraits/placeholder.svg',
} as const;

export const TEXTURE_FILES = {
  grain: 'textures/grain.svg',
  vignette: 'textures/vignette.svg',
  floodlight: 'textures/floodlight.svg',
} as const;

export const NAV_ICON_FILES = {
  panel: 'icons/nav/panel.svg',
  club: 'icons/nav/club.svg',
  squad: 'icons/nav/squad.svg',
  stadium: 'icons/nav/stadium.svg',
  league: 'icons/nav/league.svg',
  matches: 'icons/nav/matches.svg',
  training: 'icons/nav/training.svg',
  academy: 'icons/nav/academy.svg',
  scouting: 'icons/nav/scouting.svg',
  transfers: 'icons/nav/transfers.svg',
  finance: 'icons/nav/finance.svg',
  sponsors: 'icons/nav/sponsors.svg',
  board: 'icons/nav/board.svg',
  messages: 'icons/nav/messages.svg',
  achievements: 'icons/nav/achievements.svg',
  profile: 'icons/nav/profile.svg',
  settings: 'icons/nav/settings.svg',
  status: 'icons/nav/status.svg',
} as const;

export type NavIconId = keyof typeof NAV_ICON_FILES;

export const LIVE_ICON_FILES = {
  goal: 'icons/live/goal.svg',
  card: 'icons/live/card.svg',
  sub: 'icons/live/sub.svg',
  shot: 'icons/live/shot.svg',
  corner: 'icons/live/corner.svg',
  info: 'icons/live/info.svg',
} as const;

export type LiveIconId = keyof typeof LIVE_ICON_FILES;

/** Optional full-name → crest key for standings / labels without shortName */
export const CLUB_NAME_TO_CREST: Record<string, CrestKey> = {
  'FC Lastovia': 'FCL',
  'Orzeł Grodzisk': 'ORG',
  'Lechia Południe': 'LPD',
  'Górnik Wschód': 'GW',
  'Akademia Nord': 'AN',
  'Atletyk Centrum': 'ATC',
  'Victoria Harbor': 'VH',
  'Wisła Północ': 'DEFAULT',
  'Stal Portowa': 'DEFAULT',
};

export function assetUrl(relativePath: string): string {
  return `${ASSET_BASE}/${relativePath}`;
}

export function resolveCrestKey(
  shortNameOrKey?: string | null,
  clubName?: string | null,
): CrestKey {
  if (shortNameOrKey) {
    const upper = shortNameOrKey.toUpperCase();
    if (upper in CREST_FILES && upper !== 'DEFAULT') {
      return upper as CrestKey;
    }
  }
  if (clubName && clubName in CLUB_NAME_TO_CREST) {
    return CLUB_NAME_TO_CREST[clubName] ?? 'DEFAULT';
  }
  return 'DEFAULT';
}

export function crestSrc(shortNameOrKey?: string | null, clubName?: string | null): string {
  const key = resolveCrestKey(shortNameOrKey, clubName);
  return assetUrl(CREST_FILES[key]);
}

export function portraitSrc(_playerId?: string | null): string {
  // Future: PORTRAIT_FILES[playerId] ?? placeholder
  void _playerId;
  return assetUrl(PORTRAIT_FILES.placeholder);
}

export function textureSrc(id: keyof typeof TEXTURE_FILES): string {
  return assetUrl(TEXTURE_FILES[id]);
}

export function navIconSrc(id: NavIconId): string {
  return assetUrl(NAV_ICON_FILES[id]);
}

export function liveIconSrc(id: LiveIconId): string {
  return assetUrl(LIVE_ICON_FILES[id]);
}

/** Nav item id (from lib/nav) → icon id */
export const NAV_ITEM_ICON: Record<string, NavIconId> = {
  panel: 'panel',
  club: 'club',
  squad: 'squad',
  stadium: 'stadium',
  league: 'league',
  matches: 'matches',
  training: 'training',
  academy: 'academy',
  scouting: 'scouting',
  transfers: 'transfers',
  finance: 'finance',
  sponsors: 'sponsors',
  board: 'board',
  messages: 'messages',
  achievements: 'achievements',
  profile: 'profile',
  settings: 'settings',
  status: 'status',
};
