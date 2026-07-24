import type { CrestKey } from '@/assets';
import { CREST_FILES, assetUrl } from '@/assets';

export type CrestTemplate = {
  id: CrestKey;
  label: string;
  src: string;
};

export const CREST_TEMPLATES: CrestTemplate[] = (Object.keys(CREST_FILES) as CrestKey[]).map(
  (id) => ({
    id,
    label: id === 'DEFAULT' ? 'Klasyczny' : id,
    src: assetUrl(CREST_FILES[id]),
  }),
);

export type ColorPreset = {
  id: string;
  label: string;
  primary: string;
  secondary: string;
};

/** Safe football pairs — tokens + pitch/gold world. */
export const COLOR_PRESETS: ColorPreset[] = [
  { id: 'pitch-gold', label: 'Murawa', primary: '#1F5C38', secondary: '#C4A35A' },
  { id: 'night-gold', label: 'Noc', primary: '#0C1420', secondary: '#C4A35A' },
  { id: 'crimson-ink', label: 'Karmel', primary: '#8B2E2E', secondary: '#F0F4FA' },
  { id: 'navy-white', label: 'Port', primary: '#1A3A5C', secondary: '#F0F4FA' },
  { id: 'violet-trim', label: 'Trybuna', primary: '#2A1F4A', secondary: '#C4A35A' },
  { id: 'steel-amber', label: 'Stal', primary: '#3D5168', secondary: '#C4A035' },
];

export function suggestShortName(name: string): string {
  const cleaned = name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .trim();
  if (!cleaned) return '';

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const initials = parts.map((p) => p[0] ?? '').join('');
    return initials.slice(0, 4);
  }

  const single = parts[0] ?? '';
  return single.slice(0, 4);
}

export function crestSrcByTemplateId(id: string): string {
  const key = id as CrestKey;
  if (key in CREST_FILES) return assetUrl(CREST_FILES[key]);
  return assetUrl(CREST_FILES.DEFAULT);
}
