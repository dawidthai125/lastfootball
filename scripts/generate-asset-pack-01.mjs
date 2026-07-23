import fs from 'node:fs';
import path from 'node:path';

const root = path.join('apps', 'web', 'public', 'assets', 'pack-01');

function crest({ id, primary, secondary, accent, mark }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${id}">
  <defs>
    <linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${secondary}"/>
      <stop offset="100%" stop-color="${primary}"/>
    </linearGradient>
  </defs>
  <path fill="url(#g-${id})" stroke="${accent}" stroke-width="1.5" d="M32 4 L54 12 V30 C54 46 42 56 32 60 C22 56 10 46 10 30 V12 Z"/>
  <path fill="none" stroke="${accent}" stroke-opacity="0.45" stroke-width="1" d="M32 10 L48 16 V30 C48 42 39 50 32 54 C25 50 16 42 16 30 V16 Z"/>
  ${mark}
</svg>
`;
}

const crests = {
  fcl: crest({
    id: 'fcl',
    primary: '#0A0C10',
    secondary: '#1A1520',
    accent: '#C4A35A',
    mark:
      '<circle cx="32" cy="30" r="10" fill="none" stroke="#C4A35A" stroke-width="1.5"/>' +
      '<path d="M32 22 L34.5 28 H41 L35.8 32 L37.8 38 L32 34.5 L26.2 38 L28.2 32 L23 28 H29.5 Z" fill="#C4A35A"/>',
  }),
  org: crest({
    id: 'org',
    primary: '#1A0A0A',
    secondary: '#3A1515',
    accent: '#C4A35A',
    mark:
      '<path d="M32 18 C28 24 22 28 22 34 C22 40 26 44 32 44 C38 44 42 40 42 34 C42 28 36 24 32 18 Z" fill="#C4A35A"/>' +
      '<path d="M26 34 H38" stroke="#1A0A0A" stroke-width="1.2"/>',
  }),
  lpd: crest({
    id: 'lpd',
    primary: '#0A1420',
    secondary: '#152838',
    accent: '#5A7EA0',
    mark:
      '<path d="M22 38 L32 18 L42 38 Z" fill="none" stroke="#5A7EA0" stroke-width="1.5"/>' +
      '<circle cx="32" cy="32" r="3" fill="#C4A35A"/>',
  }),
  gw: crest({
    id: 'gw',
    primary: '#0A1810',
    secondary: '#143020',
    accent: '#5A9E6F',
    mark:
      '<path d="M20 36 L32 16 L44 36 L38 36 L32 26 L26 36 Z" fill="#5A9E6F"/>' +
      '<rect x="30" y="36" width="4" height="8" fill="#C4A35A"/>',
  }),
  an: crest({
    id: 'an',
    primary: '#14100A',
    secondary: '#2A2210',
    accent: '#C4A035',
    mark:
      '<rect x="24" y="22" width="16" height="20" rx="1" fill="none" stroke="#C4A035" stroke-width="1.5"/>' +
      '<path d="M28 30 H36 M28 36 H36" stroke="#C4A35A" stroke-width="1.2"/>',
  }),
  atc: crest({
    id: 'atc',
    primary: '#0A1018',
    secondary: '#182030',
    accent: '#8A7340',
    mark:
      '<circle cx="32" cy="30" r="12" fill="none" stroke="#C4A35A" stroke-width="1.5"/>' +
      '<path d="M32 20 V40 M22 30 H42" stroke="#C4A35A" stroke-width="1.5"/>',
  }),
  vh: crest({
    id: 'vh',
    primary: '#0C1018',
    secondary: '#1A2438',
    accent: '#5A7EA0',
    mark:
      '<path d="M18 34 C22 22 42 22 46 34 L40 34 C38 28 26 28 24 34 Z" fill="#5A7EA0"/>' +
      '<circle cx="32" cy="38" r="3" fill="#C4A35A"/>',
  }),
  _default: crest({
    id: 'def',
    primary: '#111A28',
    secondary: '#152031',
    accent: '#8A7340',
    mark:
      '<circle cx="32" cy="30" r="8" fill="none" stroke="#C4A35A" stroke-width="1.5"/>' +
      '<circle cx="32" cy="30" r="2" fill="#C4A35A"/>',
  }),
};

for (const [k, v] of Object.entries(crests)) {
  fs.writeFileSync(path.join(root, 'crests', `${k}.svg`), v);
}

fs.writeFileSync(
  path.join(root, 'portraits', 'placeholder.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Player placeholder">
  <rect width="64" height="64" fill="#0A101A"/>
  <rect x="0.5" y="0.5" width="63" height="63" fill="none" stroke="#2A3A4F"/>
  <circle cx="32" cy="24" r="12" fill="#152031" stroke="#3D5168" stroke-width="1"/>
  <path d="M12 58 C14 42 50 42 52 58 Z" fill="#152031" stroke="#3D5168" stroke-width="1"/>
  <path d="M20 18 C24 14 40 14 44 18" fill="none" stroke="#C4A35A" stroke-opacity="0.35" stroke-width="1"/>
</svg>
`,
);

fs.writeFileSync(
  path.join(root, 'textures', 'grain.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.75  0 0 0 0 0.64  0 0 0 0 0.35  0 0 0 0.18 0"/>
  </filter>
  <rect width="160" height="160" filter="url(#n)"/>
</svg>
`,
);

fs.writeFileSync(
  path.join(root, 'textures', 'vignette.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <defs>
    <radialGradient id="v" cx="50%" cy="40%" r="70%">
      <stop offset="40%" stop-color="#03050A" stop-opacity="0"/>
      <stop offset="100%" stop-color="#03050A" stop-opacity="0.72"/>
    </radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#v)"/>
</svg>
`,
);

fs.writeFileSync(
  path.join(root, 'textures', 'floodlight.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <defs>
    <linearGradient id="fl" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#C4A35A" stop-opacity="0.14"/>
      <stop offset="35%" stop-color="#C4A35A" stop-opacity="0.04"/>
      <stop offset="70%" stop-color="#1F5C38" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#03050A" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="beam" cx="20%" cy="0%" r="55%">
      <stop offset="0%" stop-color="#F0F4FA" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#F0F4FA" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="beam2" cx="80%" cy="0%" r="50%">
      <stop offset="0%" stop-color="#C4A35A" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#C4A35A" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#fl)"/>
  <rect width="100" height="100" fill="url(#beam)"/>
  <rect width="100" height="100" fill="url(#beam2)"/>
</svg>
`,
);

const nav = {
  panel: 'M4 6h16v4H4zm0 8h7v6H4zm10 0h6v6h-6z',
  club: 'M12 3l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7z',
  squad: 'M8 10a3 3 0 116 0 3 3 0 01-6 0zM4 19c0-3 2.5-5 8-5s8 2 8 5M16 8a2.5 2.5 0 11.5 4',
  stadium: 'M3 18h18M5 18V9l7-4 7 4v9M9 18v-4h6v4',
  league: 'M6 4h12v3H6zm2 5h8v11H8zm3 2v7m3-7v7',
  matches: 'M4 6h16v12H4zm0 4h16M9 6v12m6-12v12',
  training: 'M12 4v4m0 8v4M4 12h4m8 0h4M7 7l2.5 2.5M14.5 14.5L17 17M17 7l-2.5 2.5M9.5 14.5L7 17',
  academy: 'M3 10l9-5 9 5-9 5-9-5zm0 4l9 5 9-5',
  scouting:
    'M11 4a7 7 0 015.6 11.2L21 20l-1.5 1.5-4.4-4.4A7 7 0 1111 4zm0 3a4 4 0 100 8 4 4 0 000-8z',
  transfers: 'M7 8h11l-3-3m3 3l-3 3M17 16H6l3 3m-3-3l3-3',
  finance: 'M4 6h16v12H4zm4 4h8m-8 4h5',
  sponsors: 'M12 4l2.5 5 5.5.8-4 3.9.9 5.3L12 16.5 7.1 19l.9-5.3-4-3.9 5.5-.8z',
  board: 'M5 5h14v14H5zm3 4h8m-8 4h8m-8 4h5',
  messages: 'M4 6h16v10H8l-4 4V6z',
  achievements: 'M8 4h8v3a4 4 0 01-4 4 4 4 0 01-4-4V4zm4 7v4m-4 4h8',
  profile: 'M12 4a4 4 0 110 8 4 4 0 010-8zM5 20c0-3.5 3-6 7-6s7 2.5 7 6',
  settings:
    'M12 8a4 4 0 100 8 4 4 0 000-8zm0-4v2m0 12v2m8-8h-2M6 12H4m12.5-5.5l-1.5 1.5M9 15.5L7.5 17m9 0L15 15.5m0-7L16.5 7',
  status: 'M5 16l4-8 4 5 3-4 3 7',
};

function strokeIcon(d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">
  <path d="${d}"/>
</svg>
`;
}

for (const [k, d] of Object.entries(nav)) {
  fs.writeFileSync(path.join(root, 'icons', 'nav', `${k}.svg`), strokeIcon(d));
}

const live = {
  goal: '<circle cx="12" cy="12" r="8"/><path d="M12 4l1.5 4.5H18l-3.5 2.8 1.3 4.7L12 13.5 8.2 16l1.3-4.7L6 8.5h4.5z"/>',
  card: '<rect x="8" y="4" width="8" height="16" rx="1"/>',
  sub: '<path d="M7 16l5-5 5 5M12 11V4"/><path d="M17 8l-5 5-5-5M12 13v7"/>',
  shot: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  corner: '<path d="M5 19V5h14"/><path d="M5 19h6"/>',
  info: '<circle cx="12" cy="12" r="8"/><path d="M12 10v6M12 7h.01"/>',
};

for (const [k, inner] of Object.entries(live)) {
  fs.writeFileSync(
    path.join(root, 'icons', 'live', `${k}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">
  ${inner}
</svg>
`,
  );
}

console.log('pack-01 generated');
