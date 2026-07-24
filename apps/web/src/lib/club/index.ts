/** Client-safe barrel. Server-only: `./get-manager-club`, `./actions`. */
export { CREST_TEMPLATES, COLOR_PRESETS, suggestShortName, crestSrcByTemplateId } from './catalog';
export { validateClubIdentity, normalizeClubName, normalizeShortName } from './validation';
export type { ClubDto, ClubWizardDraft } from './types';
export { CLUB_WIZARD_DRAFT_KEY, STARTER_PACKAGE } from './types';
export type { CreateClubState } from './action-types';
export { CREATE_CLUB_INITIAL } from './action-types';
